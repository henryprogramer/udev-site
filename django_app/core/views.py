"""Views da interface Django Udev."""

from __future__ import annotations

from datetime import datetime
from functools import wraps
from pathlib import Path
from typing import Callable

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.views import LoginView, LogoutView, redirect_to_login
from django.core.mail import send_mail
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.http import FileResponse, HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .forms import (
    CaseStudyForm,
    ClientFeedbackForm,
    LoginForm,
    ManagerUserForm,
    ManagerUserEditForm,
    ManagerPasswordSetupForm,
    ManagerTokenRequestForm,
    ProductForm,
    RegisterForm,
    ServiceItemForm,
    ServiceRequestForm,
    ServiceRequestAdminForm,
    SectionContentForm,
    TeamMemberForm,
)
from .models import (
    CaseStudy,
    ClientProfile,
    ClientFeedback,
    ManagerEmailToken,
    Product,
    Purchase,
    SectionContent,
    ServiceItem,
    ServiceRequest,
    TeamMember,
)
from .legal import LEGAL_LAST_UPDATED


def manager_required(view_func: Callable) -> Callable:
    """Decorator para restringir views à equipe gestora."""
    @wraps(view_func)
    def _wrapped(request: HttpRequest, *args, **kwargs) -> HttpResponse:
        if not request.user.is_authenticated:
            return redirect_to_login(request.get_full_path(), login_url="/gestao/login/")

        if not request.user.is_staff:
            messages.error(request, "Acesso restrito ao portal de gestão.")
            return redirect("account")

        if request.session.get("manager_verified_user") != request.user.pk:
            return redirect_to_login(request.get_full_path(), login_url="/gestao/login/")

        return view_func(request, *args, **kwargs)

    return _wrapped


def _shift_month(year: int, month: int, delta: int) -> tuple[int, int]:
    total = year * 12 + (month - 1) + delta
    new_year = total // 12
    new_month = total % 12 + 1
    return new_year, new_month


def _monthly_series(queryset, date_field: str, months: int = 6) -> list[dict]:
    now = timezone.localtime(timezone.now())
    start_year, start_month = _shift_month(now.year, now.month, -(months - 1))
    tz = timezone.get_current_timezone()
    start_dt = timezone.make_aware(datetime(start_year, start_month, 1), tz)

    rows = (
        queryset.filter(**{f"{date_field}__gte": start_dt})
        .annotate(month=TruncMonth(date_field))
        .values("month")
        .annotate(total=Count("id"))
        .order_by("month")
    )
    counts = {(row["month"].year, row["month"].month): row["total"] for row in rows}

    series: list[dict] = []
    values: list[int] = []
    for i in range(months):
        year, month = _shift_month(start_year, start_month, i)
        value = counts.get((year, month), 0)
        values.append(value)
        label = f"{month:02d}/{str(year)[-2:]}"
        series.append({"label": label, "value": value})

    max_value = max(values) if values else 0
    for item in series:
        if max_value:
            item["percent"] = round(item["value"] / max_value * 100, 2)
        else:
            item["percent"] = 0
    return series


SECTION_DEFAULTS = {
    "home_hero": {
        "title": "Transformamos ideias em soluções digitais práticas.",
        "subtitle": "Startup de tecnologia orientada a resultados",
        "body": (
            "Três amigos com visão compartilhada decidiram construir o futuro com "
            "tecnologia que organiza, automatiza e impulsiona negócios."
        ),
    },
    "home_about": {
        "title": "Sobre a Startup",
        "subtitle": "Não apenas programamos. Construímos estrutura digital.",
        "body": (
            "Criamos desde sites institucionais até sistemas de gestão e plataformas "
            "SaaS personalizadas para pequenas e médias empresas."
        ),
    },
    "home_services": {
        "title": "Serviços e Soluções",
        "subtitle": "Execução técnica com foco em negócio",
        "body": "Estruture sua operação com web, software, automação e dados.",
    },
    "home_team": {
        "title": "Equipe Líder",
        "subtitle": "Visão estratégica, engenharia, finanças e design.",
        "body": "Liderança complementar para transformar intenção em direção e entrega.",
    },
    "home_cases": {
        "title": "Cases e Resultados",
        "subtitle": "Projetos orientados a KPI",
        "body": "Foco em eficiência operacional e evolução contínua.",
    },
    "home_cta": {
        "title": "Pronto para acelerar sua operação?",
        "subtitle": "Crie sua conta e fale com a Udev",
        "body": "Landing institucional, gestão de conteúdo e catálogo de produtos em um ecossistema único.",
    },
    "about_main": {
        "title": "Sobre a Udev",
        "subtitle": "Startup de tecnologia que transforma ideias em soluções digitais práticas.",
        "body": (
            "Somos uma startup de tecnologia focada em construir sistemas que organizam, "
            "automatizam e impulsionam negócios."
        ),
    },
    "services_main": {
        "title": "Produtos e Serviços",
        "subtitle": "Catálogo ativo da Udev",
        "body": "Selecione soluções sob medida para sua operação.",
    },
    "services_pricing": {
        "title": "Preços e formatos de contratação",
        "subtitle": "Orçamentos sob demanda",
        "body": (
            "Nossos preços são definidos de acordo com escopo, prazo e nível de "
            "complexidade. Compartilhe seu objetivo e retornamos com proposta personalizada."
        ),
    },
    "team_main": {
        "title": "Equipe Udev",
        "subtitle": "Lideranças com especialidades complementares.",
        "body": "Execução orientada a resultado, qualidade e crescimento sustentável.",
    },
    "cases_main": {
        "title": "Cases Udev",
        "subtitle": "Impacto comprovado",
        "body": "Resultados reais em operações comerciais e administrativas.",
    },
    "contact_main": {
        "title": "Contato",
        "subtitle": "Fale com a equipe",
        "body": "Envie seu contexto e retornamos com diagnóstico técnico e comercial.",
    },
    "profile": {
        "title": "Perfil institucional",
        "subtitle": "Dados de contato e redes oficiais",
        "body": "",
        "phone": "https://wa.me/5563984412348",
        "email": "udev.oficial@gmail.com",
        "instagram": "https://www.instagram.com/udev.oficial/",
    },
}

SERVICE_FALLBACKS = [
    {
        "slug": "sites-institucionais",
        "title": "Sites Institucionais",
        "summary": "Presença profissional para autoridade e captação.",
        "image_url": "/static/assets/showcase/code-1.jpg",
        "content": "Criamos sites institucionais modernos, rápidos e com foco em conversão.",
    },
    {
        "slug": "sistemas-gestao",
        "title": "Sistemas de Gestão",
        "summary": "Controle operacional com rastreabilidade.",
        "image_url": "/static/assets/showcase/crm.jpg",
        "content": "Sistemas web para organizar operações, equipes e indicadores.",
    },
    {
        "slug": "e-commerce",
        "title": "E-commerce",
        "summary": "Lojas online com checkout otimizado.",
        "image_url": "/static/assets/showcase/ecommerce.png",
        "content": "Plataformas de venda com catálogo, pagamentos e integrações.",
    },
    {
        "slug": "plataformas-saas",
        "title": "Plataformas SaaS",
        "summary": "Arquitetura escalável para receita recorrente.",
        "image_url": "/static/assets/showcase/programmer.jpg",
        "content": "Construção de produtos digitais prontos para escalar.",
    },
    {
        "slug": "automacao",
        "title": "Automação",
        "summary": "Menos retrabalho e mais produtividade.",
        "image_url": "/static/assets/showcase/automation.jpg",
        "content": "Integrações e automações para eliminar tarefas manuais.",
    },
    {
        "slug": "pdv-varejo",
        "title": "PDVs e Varejo",
        "summary": "Operação de caixa com integração e controle.",
        "image_url": "/static/assets/showcase/pdv.jpg",
        "content": "Soluções de PDV integradas ao estoque e financeiro.",
    },
]

CASE_FALLBACKS = [
    {
        "slug": "funil-comercial",
        "title": "Funil Comercial",
        "summary": "+42% em oportunidades qualificadas em 90 dias.",
        "image_url": "/static/assets/showcase/crm.jpg",
        "result": "Estruturamos um funil e CRM sob medida para acelerar conversões.",
    },
    {
        "slug": "dashboard-operacional",
        "title": "Dashboard Operacional",
        "summary": "-31% no tempo de análise semanal.",
        "image_url": "/static/assets/showcase/pdv.jpg",
        "result": "Dashboards conectados ao operacional para decisões rápidas.",
    },
    {
        "slug": "plataforma-saas",
        "title": "Plataforma SaaS",
        "summary": "+28% de retenção no primeiro ciclo trimestral.",
        "image_url": "/static/assets/showcase/programmer.jpg",
        "result": "Produto SaaS com onboarding e indicadores de retenção.",
    },
]

TEAM_FALLBACKS = [
    {
        "slug": "pedro-henrique",
        "name": "Pedro Henrique",
        "role": "CEO & Arquiteto de Produto",
        "image_static": "assets/team/pedro_comfundo.png",
        "bio": "Fundador e responsável pela visão estratégica da Udev.",
        "content": "Direção corporativa, arquitetura de produtos e execução técnica.",
    },
    {
        "slug": "hetilon-araujo",
        "name": "Hetilon Araújo",
        "role": "Co-CEO & CTO",
        "image_static": "assets/team/hetilon_comfundo.png",
        "bio": "Responsável pela engenharia e estabilidade técnica da empresa.",
        "content": "Arquitetura de sistemas, backend e garantia de qualidade.",
    },
    {
        "slug": "kaua-emanuel",
        "name": "Kauã Emanuel",
        "role": "CFO & Diretor de Hardware/Robótica",
        "image_static": "assets/team/kaua_comfundo.png",
        "bio": "Responsável pela sustentação financeira e expansão futura.",
        "content": "Planejamento financeiro e gestão administrativa.",
    },
    {
        "slug": "isaque-silva",
        "name": "Isaque Silva",
        "role": "Lead Designer & CDO",
        "image_static": "assets/team/isaque_comfundo.png",
        "bio": "Responsável pela identidade visual e experiência dos produtos.",
        "content": "Design de interfaces e padronização visual.",
    },
]


def _service_cards():
    items = ServiceItem.objects.filter(is_published=True)
    if items.exists():
        payloads = []
        for item in items:
            payloads.append(
                {
                    "slug": item.slug,
                    "title": item.title,
                    "summary": item.summary or item.content[:140],
                    "image_url": item.image.url if item.image else SERVICE_FALLBACKS[0]["image_url"],
                }
            )
        return payloads
    return SERVICE_FALLBACKS


def _case_cards():
    items = CaseStudy.objects.filter(is_published=True)
    if items.exists():
        payloads = []
        for item in items:
            payloads.append(
                {
                    "slug": item.slug,
                    "title": item.title,
                    "summary": item.summary or item.result[:140],
                    "image_url": item.image.url if item.image else CASE_FALLBACKS[0]["image_url"],
                }
            )
        return payloads
    return CASE_FALLBACKS


def get_section_payload(section_key: str) -> dict:
    """Retorna conteúdo publicado da seção ou fallback padrão."""
    default = SECTION_DEFAULTS.get(
        section_key,
        {
            "title": "",
            "subtitle": "",
            "body": "",
            "phone": "",
            "email": "",
            "instagram": "",
        },
    )
    if section_key == SectionContent.SECTION_PROFILE:
        section = SectionContent.objects.filter(section_key=section_key).first()
    else:
        section = SectionContent.objects.filter(
            section_key=section_key,
            is_published=True,
        ).first()

    if not section:
        return {**default, "image_url": ""}

    return {
        "title": section.title or default.get("title", ""),
        "subtitle": section.subtitle or default.get("subtitle", ""),
        "body": section.body or default.get("body", ""),
        "phone": section.phone or default.get("phone", ""),
        "email": section.email or default.get("email", ""),
        "instagram": section.instagram or default.get("instagram", ""),
        "image_url": section.image.url if section.image else "",
    }


def home_view(request: HttpRequest) -> HttpResponse:
    featured_products = Product.objects.filter(is_active=True)[:3]
    members = TeamMember.objects.filter(is_published=True)
    if not members.exists():
        members = TEAM_FALLBACKS
    context = {
        "featured_products": featured_products,
        "members": members,
        "service_cards": _service_cards(),
        "case_cards": _case_cards(),
        "details": {
            "about": [
                "Foco em eficiencia operacional com entregas mensuraveis.",
                "Projetos sob medida para pequenas e medias empresas.",
                "Time preparado para ir do diagnostico ao deploy.",
            ],
            "services": [
                "Mapeamos processos e apontamos gargalos.",
                "Construimos solucao com etapas claras e entregas curtas.",
                "Treinamento e suporte para garantir adocao.",
            ],
            "team": [
                "Equipe multidisciplinar com visao de produto e negocio.",
                "Liderancas experientes em arquitetura, design e operacoes.",
                "Acompanhamento continuo com foco em resultado.",
            ],
            "cases": [
                "KPI's claros para medir impacto real.",
                "Automacoes e dashboards para decisao rapida.",
                "Resultados sustentaveis com base em dados.",
            ],
            "cta": [
                "Diagnostico inicial para entender o seu contexto.",
                "Roadmap objetivo com prioridades e prazos.",
                "Proposta alinhada ao seu momento de crescimento.",
            ],
        },
        "sections": {
            "hero": get_section_payload("home_hero"),
            "about": get_section_payload("home_about"),
            "services": get_section_payload("home_services"),
            "team": get_section_payload("home_team"),
            "cases": get_section_payload("home_cases"),
            "cta": get_section_payload("home_cta"),
        },
    }
    return render(request, "home.html", context)


def about_view(request: HttpRequest) -> HttpResponse:
    return render(
        request,
        "about.html",
        {"section": get_section_payload("about_main")},
    )


def services_view(request: HttpRequest) -> HttpResponse:
    products = Product.objects.filter(is_active=True)
    pricing_section = get_section_payload("services_pricing")
    service_request_form = ServiceRequestForm(request.POST or None)
    service_cards = _service_cards()

    if request.method == "POST":
        if service_request_form.is_valid():
            service_request = service_request_form.save()
            profile = get_section_payload("profile")
            recipient = profile.get("email") or settings.MANAGER_REGISTRATION_EMAIL
            message = (
                "Nova solicitação de serviço recebida:\n\n"
                f"Nome: {service_request.name}\n"
                f"E-mail: {service_request.email}\n"
                f"WhatsApp: {service_request.phone or 'Não informado'}\n"
                f"Empresa: {service_request.company or 'Não informado'}\n"
                f"Tipo: {service_request.get_service_type_display()}\n\n"
                "Mensagem:\n"
                f"{service_request.message}\n"
            )
            send_mail(
                subject="Nova solicitação de serviço - Udev",
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            messages.success(request, "Solicitação enviada com sucesso.")
            return redirect("services")

        messages.error(request, "Revise os campos e tente novamente.")

    return render(
        request,
        "services.html",
        {
            "products": products,
            "section": get_section_payload("services_main"),
            "service_cards": service_cards,
            "pricing_section": pricing_section,
            "service_request_form": service_request_form,
            "service_types": ServiceRequest.SERVICE_CHOICES,
        },
    )


def team_view(request: HttpRequest) -> HttpResponse:
    members = TeamMember.objects.filter(is_published=True)
    if not members.exists():
        members = TEAM_FALLBACKS
    return render(
        request,
        "team.html",
        {"section": get_section_payload("team_main"), "members": members},
    )


def cases_view(request: HttpRequest) -> HttpResponse:
    return render(
        request,
        "cases.html",
        {"section": get_section_payload("cases_main"), "case_cards": _case_cards()},
    )


def contact_view(request: HttpRequest) -> HttpResponse:
    profile = get_section_payload("profile")
    return render(
        request,
        "contact.html",
        {
            "section": get_section_payload("contact_main"),
            "profile": profile,
        },
    )


def feedbacks_view(request: HttpRequest) -> HttpResponse:
    feedbacks = ClientFeedback.objects.filter(is_published=True)
    return render(request, "feedbacks.html", {"feedbacks": feedbacks})


def service_detail_view(request: HttpRequest, slug: str) -> HttpResponse:
    service = ServiceItem.objects.filter(slug=slug, is_published=True).first()
    if service:
        payload = {
            "title": service.title,
            "summary": service.summary,
            "content": service.content,
            "image_url": service.image.url if service.image else "",
        }
    else:
        payload = next((item for item in SERVICE_FALLBACKS if item["slug"] == slug), None)
        if payload is None:
            return HttpResponse(status=404)

    return render(request, "service_detail.html", {"service": payload})


def case_detail_view(request: HttpRequest, slug: str) -> HttpResponse:
    case_item = CaseStudy.objects.filter(slug=slug, is_published=True).first()
    if case_item:
        payload = {
            "title": case_item.title,
            "summary": case_item.summary,
            "result": case_item.result,
            "image_url": case_item.image.url if case_item.image else "",
        }
    else:
        payload = next((item for item in CASE_FALLBACKS if item["slug"] == slug), None)
        if payload is None:
            return HttpResponse(status=404)

    return render(request, "case_detail.html", {"case": payload})


def member_detail_view(request: HttpRequest, slug: str) -> HttpResponse:
    member = TeamMember.objects.filter(slug=slug, is_published=True).first()
    if member:
        payload = {
            "name": member.name,
            "role": member.role,
            "bio": member.bio,
            "content": member.content,
            "image_url": member.image.url if member.image else "",
        }
    else:
        payload = next((item for item in TEAM_FALLBACKS if item["slug"] == slug), None)
        if payload is None:
            return HttpResponse(status=404)

    return render(request, "member_detail.html", {"member": payload})


def docs_view(request: HttpRequest) -> HttpResponse:
    return render(request, "docs.html", {"last_updated": LEGAL_LAST_UPDATED})


def privacy_view(request: HttpRequest) -> HttpResponse:
    return render(request, "privacy.html", {"last_updated": LEGAL_LAST_UPDATED})


def terms_view(request: HttpRequest) -> HttpResponse:
    return render(request, "terms.html", {"last_updated": LEGAL_LAST_UPDATED})


def payment_policy_view(request: HttpRequest) -> HttpResponse:
    return render(
        request,
        "payment_policy.html",
        {"last_updated": LEGAL_LAST_UPDATED},
    )


def security_view(request: HttpRequest) -> HttpResponse:
    return render(request, "security.html", {"last_updated": LEGAL_LAST_UPDATED})


def rights_view(request: HttpRequest) -> HttpResponse:
    return render(request, "rights.html", {"last_updated": LEGAL_LAST_UPDATED})


def guidelines_view(request: HttpRequest) -> HttpResponse:
    return render(request, "guidelines.html", {"last_updated": LEGAL_LAST_UPDATED})


def product_detail_view(request: HttpRequest, slug: str) -> HttpResponse:
    product = get_object_or_404(Product, slug=slug, is_active=True)

    has_purchase = False
    if request.user.is_authenticated:
        has_purchase = Purchase.objects.filter(user=request.user, product=product).exists()

    can_buy = request.user.is_authenticated
    can_download = bool(
        product.protected_file
        and ((request.user.is_authenticated and has_purchase) or request.user.is_staff)
    )

    return render(
        request,
        "product_detail.html",
        {
            "product": product,
            "has_purchase": has_purchase,
            "can_buy": can_buy,
            "can_download": can_download,
        },
    )


@login_required
@require_POST
def purchase_product_view(request: HttpRequest, slug: str) -> HttpResponse:
    product = get_object_or_404(Product, slug=slug, is_active=True)

    purchase, created = Purchase.objects.get_or_create(user=request.user, product=product)
    if created:
        messages.success(request, "Produto adquirido com sucesso.")
    else:
        messages.info(request, "Você já adquiriu este produto.")

    return redirect("product_detail", slug=product.slug)


@login_required
@require_POST
def download_product_file_view(request: HttpRequest, slug: str) -> HttpResponse:
    product = get_object_or_404(Product, slug=slug, is_active=True)

    if not product.protected_file:
        messages.error(request, "Este produto não possui arquivo para download.")
        return redirect("product_detail", slug=slug)

    has_purchase = Purchase.objects.filter(user=request.user, product=product).exists()
    if not has_purchase and not request.user.is_staff:
        messages.error(request, "Adquira o produto antes de baixar o arquivo.")
        return redirect("product_detail", slug=slug)

    informed_key = request.POST.get("security_key", "").strip()
    required_key = (product.security_key or "").strip()
    if required_key and informed_key != required_key and not request.user.is_staff:
        messages.error(request, "Chave de segurança inválida para este arquivo.")
        return redirect("product_detail", slug=slug)

    file_handle = product.protected_file.open("rb")
    filename = Path(product.protected_file.name).name
    response = FileResponse(file_handle, as_attachment=True, filename=filename)
    return response


class UdevLoginView(LoginView):
    """Login institucional da plataforma."""

    template_name = "login.html"
    authentication_form = LoginForm

    def get_success_url(self):
        return self.get_redirect_url() or settings.LOGIN_REDIRECT_URL

    def form_valid(self, form):
        response = super().form_valid(form)
        self.request.session.pop("manager_verified_user", None)
        return response


class ManagerLoginView(LoginView):
    """Login do portal de gestão."""

    template_name = "manager_login.html"
    authentication_form = LoginForm

    def get_success_url(self):
        return self.get_redirect_url() or "/gestao/"

    def form_valid(self, form):
        user = form.get_user()
        if not user.is_staff:
            form.add_error(None, "Acesso restrito ao portal de gestão.")
            return self.form_invalid(form)

        login(self.request, user)
        self.request.session["manager_verified_user"] = user.pk
        return redirect(self.get_success_url())


class UdevLogoutView(LogoutView):
    """Logout da sessão autenticada."""

    next_page = "/"


def register_view(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return redirect("account")

    form = RegisterForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        ClientProfile.objects.get_or_create(user=user)
        login(request, user)
        messages.success(request, "Cadastro realizado com sucesso.")
        return redirect("account")

    return render(request, "register.html", {"form": form})


@login_required
def account_view(request: HttpRequest) -> HttpResponse:
    purchases = Purchase.objects.filter(user=request.user).select_related("product")
    return render(request, "account.html", {"purchases": purchases})


def manager_token_request_view(request: HttpRequest) -> HttpResponse:
    """Solicita token para ativação da conta gestora por e-mail."""
    initial = {"email": settings.MANAGER_REGISTRATION_EMAIL}
    form = ManagerTokenRequestForm(request.POST or None, initial=initial)

    if request.method == "POST" and form.is_valid():
        email = form.cleaned_data["email"].strip().lower()

        if email != settings.MANAGER_REGISTRATION_EMAIL:
            form.add_error("email", "E-mail gestor inválido para ativação.")
        else:
            token_obj = ManagerEmailToken.create_token(email=email)
            message = (
                "Seu token de ativação do Portal de Gestão Udev:\n\n"
                f"Token: {token_obj.token}\n"
                f"Expira em: {token_obj.expires_at:%d/%m/%Y %H:%M}\n\n"
                "Use este token na etapa de definição de senha."
            )
            send_mail(
                subject="Token de ativação - Portal de Gestão Udev",
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            messages.success(
                request,
                "Token enviado para o e-mail gestor configurado. Verifique sua caixa de entrada.",
            )
            return redirect("manager_password_setup")

    return render(
        request,
        "manager_token_request.html",
        {
            "form": form,
            "manager_email": settings.MANAGER_REGISTRATION_EMAIL,
        },
    )


def manager_password_setup_view(request: HttpRequest) -> HttpResponse:
    """Define senha da conta gestora após validação do token por e-mail."""
    initial = {"email": settings.MANAGER_REGISTRATION_EMAIL}
    form = ManagerPasswordSetupForm(request.POST or None, initial=initial)

    if request.method == "POST" and form.is_valid():
        email = form.cleaned_data["email"].strip().lower()
        token_value = form.cleaned_data["token"].strip()
        password = form.cleaned_data["password1"]

        if email != settings.MANAGER_REGISTRATION_EMAIL:
            form.add_error("email", "E-mail gestor inválido para ativação.")
        else:
            token = (
                ManagerEmailToken.objects.filter(email=email, token=token_value)
                .order_by("-created_at")
                .first()
            )

            if token is None or not token.is_valid():
                form.add_error("token", "Token inválido ou expirado.")
            else:
                user, _created = User.objects.get_or_create(
                    username=email,
                    defaults={
                        "email": email,
                        "first_name": "Equipe Gestora Udev",
                        "is_staff": True,
                        "is_superuser": False,
                        "is_active": True,
                    },
                )
                user.email = email
                user.is_staff = True
                user.is_superuser = False
                user.is_active = True
                user.set_password(password)
                user.save()

                token.is_used = True
                token.save(update_fields=["is_used"])

                login(request, user)
                request.session["manager_verified_user"] = user.pk
                messages.success(
                    request,
                    "Senha definida com sucesso. Acesso gestor liberado.",
                )
                return redirect("manager_dashboard")

    return render(request, "manager_password_setup.html", {"form": form})


@manager_required
def manager_dashboard_view(request: HttpRequest) -> HttpResponse:
    product_form = ProductForm(prefix="product")
    section_form = SectionContentForm(prefix="section")
    user_form = ManagerUserForm(prefix="user")
    feedback_form = ClientFeedbackForm(prefix="feedback")
    member_form = TeamMemberForm(prefix="member")
    service_form = ServiceItemForm(prefix="service")
    case_form = CaseStudyForm(prefix="case")

    if request.method == "POST":
        action = request.POST.get("action", "")

        if action == "create_product":
            product_form = ProductForm(
                request.POST,
                request.FILES,
                prefix="product",
            )
            if product_form.is_valid():
                product_form.save()
                messages.success(request, "Produto publicado com sucesso.")
                return redirect("manager_dashboard")

        if action == "save_section":
            section_form = SectionContentForm(
                request.POST,
                request.FILES,
                prefix="section",
            )
            if section_form.is_valid():
                cleaned = section_form.cleaned_data
                section_key = cleaned["section_key"]
                section = SectionContent.objects.filter(section_key=section_key).first()

                if section is None:
                    section = SectionContent(section_key=section_key)

                section.title = cleaned["title"]
                section.subtitle = cleaned["subtitle"]
                section.body = cleaned["body"]
                section.phone = cleaned["phone"]
                section.email = cleaned["email"]
                section.instagram = cleaned["instagram"]
                if cleaned.get("image"):
                    section.image = cleaned["image"]
                section.is_published = cleaned["is_published"]
                section.save()

                messages.success(request, "Seção salva com sucesso.")
                return redirect("manager_dashboard")

        if action == "create_user":
            user_form = ManagerUserForm(request.POST, request.FILES, prefix="user")
            if user_form.is_valid():
                full_name = user_form.cleaned_data["full_name"].strip()
                email = user_form.cleaned_data["email"].strip().lower()
                role = user_form.cleaned_data["role"]
                password = user_form.cleaned_data["password1"]
                avatar = user_form.cleaned_data.get("avatar")

                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password,
                    first_name=full_name,
                )
                user.is_staff = role == ManagerUserForm.ROLE_STAFF
                user.is_active = True
                user.save()
                if role == ManagerUserForm.ROLE_CLIENT:
                    profile, _created = ClientProfile.objects.get_or_create(user=user)
                    if avatar:
                        profile.avatar = avatar
                        profile.save()

                messages.success(request, "Usuário criado com sucesso.")
                return redirect("manager_dashboard")

        if action == "create_feedback":
            feedback_form = ClientFeedbackForm(
                request.POST,
                request.FILES,
                prefix="feedback",
            )
            if feedback_form.is_valid():
                feedback_form.save()
                messages.success(request, "Feedback cadastrado com sucesso.")
                return redirect("manager_dashboard")

        if action == "create_member":
            member_form = TeamMemberForm(
                request.POST,
                request.FILES,
                prefix="member",
            )
            if member_form.is_valid():
                member_form.save()
                messages.success(request, "Membro cadastrado com sucesso.")
                return redirect("manager_dashboard")

        if action == "create_service":
            service_form = ServiceItemForm(
                request.POST,
                request.FILES,
                prefix="service",
            )
            if service_form.is_valid():
                service_form.save()
                messages.success(request, "Serviço cadastrado com sucesso.")
                return redirect("manager_dashboard")

        if action == "create_case":
            case_form = CaseStudyForm(
                request.POST,
                request.FILES,
                prefix="case",
            )
            if case_form.is_valid():
                case_form.save()
                messages.success(request, "Case cadastrado com sucesso.")
                return redirect("manager_dashboard")

    products = Product.objects.all()
    sections = SectionContent.objects.all()
    users = User.objects.all().order_by("-is_staff", "username")
    service_requests = ServiceRequest.objects.all()
    feedbacks = ClientFeedback.objects.all()
    members = TeamMember.objects.all()
    services = ServiceItem.objects.all()
    cases = CaseStudy.objects.all()

    kpis = {
        "products": products.count(),
        "services": services.count(),
        "cases": cases.count(),
        "members": members.count(),
        "feedbacks": feedbacks.count(),
        "requests": service_requests.count(),
        "users": users.count(),
        "purchases": Purchase.objects.count(),
    }

    requests_series = _monthly_series(ServiceRequest.objects.all(), "created_at")
    purchases_series = _monthly_series(Purchase.objects.all(), "created_at")
    return render(
        request,
        "manager_dashboard.html",
        {
            "product_form": product_form,
            "section_form": section_form,
            "user_form": user_form,
            "feedback_form": feedback_form,
            "member_form": member_form,
            "service_form": service_form,
            "case_form": case_form,
            "products": products,
            "sections": sections,
            "users": users,
            "service_requests": service_requests,
            "feedbacks": feedbacks,
            "members": members,
            "services": services,
            "cases": cases,
            "kpis": kpis,
            "requests_series": requests_series,
            "purchases_series": purchases_series,
            "manager_email": settings.MANAGER_REGISTRATION_EMAIL,
        },
    )


@manager_required
@require_POST
def manager_user_toggle_staff_view(request: HttpRequest, user_id: int) -> HttpResponse:
    user = get_object_or_404(User, pk=user_id)
    if user == request.user:
        messages.error(request, "Você não pode alterar seu próprio perfil.")
        return redirect("manager_dashboard")

    if user.is_staff:
        staff_count = User.objects.filter(is_staff=True).count()
        if staff_count <= 1:
            messages.error(request, "É necessário manter ao menos um administrador.")
            return redirect("manager_dashboard")
        user.is_staff = False
        messages.success(request, "Usuário movido para perfil de cliente.")
    else:
        user.is_staff = True
        messages.success(request, "Usuário promovido para administrador.")

    user.save(update_fields=["is_staff"])
    return redirect("manager_dashboard")


@manager_required
@require_POST
def manager_user_toggle_active_view(request: HttpRequest, user_id: int) -> HttpResponse:
    user = get_object_or_404(User, pk=user_id)
    if user == request.user:
        messages.error(request, "Você não pode desativar seu próprio acesso.")
        return redirect("manager_dashboard")

    user.is_active = not user.is_active
    user.save(update_fields=["is_active"])
    status = "ativado" if user.is_active else "desativado"
    messages.success(request, f"Usuário {status} com sucesso.")
    return redirect("manager_dashboard")


@manager_required
def manager_user_edit_view(request: HttpRequest, user_id: int) -> HttpResponse:
    user = get_object_or_404(User, pk=user_id)
    initial = {
        "full_name": user.first_name,
        "email": user.email or user.username,
        "role": ManagerUserForm.ROLE_STAFF if user.is_staff else ManagerUserForm.ROLE_CLIENT,
    }
    form = ManagerUserEditForm(
        request.POST or None,
        request.FILES or None,
        user=user,
        initial=initial,
    )

    if request.method == "POST" and form.is_valid():
        role = form.cleaned_data["role"]
        email = form.cleaned_data["email"].strip().lower()
        avatar = form.cleaned_data.get("avatar")

        if user.is_staff and role == ManagerUserForm.ROLE_CLIENT:
            staff_count = User.objects.filter(is_staff=True).count()
            if staff_count <= 1:
                messages.error(request, "É necessário manter ao menos um administrador.")
                return redirect("manager_dashboard")

        user.first_name = form.cleaned_data["full_name"].strip()
        user.username = email
        user.email = email
        user.is_staff = role == ManagerUserForm.ROLE_STAFF
        user.save()

        if role == ManagerUserForm.ROLE_CLIENT or avatar:
            profile, _created = ClientProfile.objects.get_or_create(user=user)
            if avatar:
                profile.avatar = avatar
                profile.save()

        messages.success(request, "Usuário atualizado com sucesso.")
        return redirect("manager_dashboard")

    return render(request, "manager_user_edit.html", {"form": form, "user_item": user})


@manager_required
@require_POST
def manager_user_delete_view(request: HttpRequest, user_id: int) -> HttpResponse:
    user = get_object_or_404(User, pk=user_id)
    if user == request.user:
        messages.error(request, "Você não pode remover seu próprio acesso.")
        return redirect("manager_dashboard")

    if user.is_staff:
        staff_count = User.objects.filter(is_staff=True).count()
        if staff_count <= 1:
            messages.error(request, "É necessário manter ao menos um administrador.")
            return redirect("manager_dashboard")

    user.delete()
    messages.success(request, "Usuário removido com sucesso.")
    return redirect("manager_dashboard")


@manager_required
@require_POST
def manager_service_request_delete_view(
    request: HttpRequest, request_id: int
) -> HttpResponse:
    service_request = get_object_or_404(ServiceRequest, pk=request_id)
    service_request.delete()
    messages.success(request, "Solicitação removida com sucesso.")
    return redirect("manager_dashboard")


@manager_required
def manager_service_request_edit_view(
    request: HttpRequest, request_id: int
) -> HttpResponse:
    service_request = get_object_or_404(ServiceRequest, pk=request_id)
    form = ServiceRequestAdminForm(request.POST or None, instance=service_request)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Solicitação atualizada com sucesso.")
        return redirect("manager_dashboard")
    return render(
        request,
        "manager_service_request_edit.html",
        {"form": form, "service_request": service_request},
    )


@manager_required
@require_POST
def manager_feedback_delete_view(request: HttpRequest, feedback_id: int) -> HttpResponse:
    feedback = get_object_or_404(ClientFeedback, pk=feedback_id)
    feedback.delete()
    messages.success(request, "Feedback removido com sucesso.")
    return redirect("manager_dashboard")


@manager_required
def manager_feedback_edit_view(request: HttpRequest, feedback_id: int) -> HttpResponse:
    feedback = get_object_or_404(ClientFeedback, pk=feedback_id)
    form = ClientFeedbackForm(
        request.POST or None, request.FILES or None, instance=feedback
    )
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Feedback atualizado com sucesso.")
        return redirect("manager_dashboard")
    return render(
        request,
        "manager_feedback_edit.html",
        {"form": form, "feedback": feedback},
    )


@manager_required
def manager_product_edit_view(request: HttpRequest, product_id: int) -> HttpResponse:
    product = get_object_or_404(Product, pk=product_id)
    form = ProductForm(request.POST or None, request.FILES or None, instance=product)

    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Produto atualizado com sucesso.")
        return redirect("manager_dashboard")

    return render(
        request,
        "manager_product_edit.html",
        {
            "form": form,
            "product": product,
        },
    )


@manager_required
def manager_product_delete_view(request: HttpRequest, product_id: int) -> HttpResponse:
    product = get_object_or_404(Product, pk=product_id)

    if request.method == "POST":
        product.delete()
        messages.success(request, "Produto removido com sucesso.")
        return redirect("manager_dashboard")

    return render(
        request,
        "manager_product_delete.html",
        {
            "product": product,
        },
    )


@manager_required
def manager_member_edit_view(request: HttpRequest, member_id: int) -> HttpResponse:
    member = get_object_or_404(TeamMember, pk=member_id)
    form = TeamMemberForm(request.POST or None, request.FILES or None, instance=member)

    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Membro atualizado com sucesso.")
        return redirect("manager_dashboard")

    return render(
        request,
        "manager_member_edit.html",
        {
            "form": form,
            "member": member,
        },
    )


@manager_required
def manager_member_delete_view(request: HttpRequest, member_id: int) -> HttpResponse:
    member = get_object_or_404(TeamMember, pk=member_id)

    if request.method == "POST":
        member.delete()
        messages.success(request, "Membro removido com sucesso.")
        return redirect("manager_dashboard")

    return render(
        request,
        "manager_member_delete.html",
        {
            "member": member,
        },
    )


@manager_required
def manager_service_edit_view(request: HttpRequest, service_id: int) -> HttpResponse:
    service = get_object_or_404(ServiceItem, pk=service_id)
    form = ServiceItemForm(request.POST or None, request.FILES or None, instance=service)

    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Serviço atualizado com sucesso.")
        return redirect("manager_dashboard")

    return render(
        request,
        "manager_service_edit.html",
        {
            "form": form,
            "service": service,
        },
    )


@manager_required
def manager_service_delete_view(request: HttpRequest, service_id: int) -> HttpResponse:
    service = get_object_or_404(ServiceItem, pk=service_id)

    if request.method == "POST":
        service.delete()
        messages.success(request, "Serviço removido com sucesso.")
        return redirect("manager_dashboard")

    return render(
        request,
        "manager_service_delete.html",
        {
            "service": service,
        },
    )


@manager_required
def manager_case_edit_view(request: HttpRequest, case_id: int) -> HttpResponse:
    case_item = get_object_or_404(CaseStudy, pk=case_id)
    form = CaseStudyForm(request.POST or None, request.FILES or None, instance=case_item)

    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Case atualizado com sucesso.")
        return redirect("manager_dashboard")

    return render(
        request,
        "manager_case_edit.html",
        {
            "form": form,
            "case": case_item,
        },
    )


@manager_required
def manager_case_delete_view(request: HttpRequest, case_id: int) -> HttpResponse:
    case_item = get_object_or_404(CaseStudy, pk=case_id)

    if request.method == "POST":
        case_item.delete()
        messages.success(request, "Case removido com sucesso.")
        return redirect("manager_dashboard")

    return render(
        request,
        "manager_case_delete.html",
        {
            "case": case_item,
        },
    )
