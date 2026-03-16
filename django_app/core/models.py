"""Modelos de dados da Udev."""

from __future__ import annotations

import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Product(models.Model):
    """Produto/serviço publicado pela equipe gestora."""

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    video_url = models.URLField(blank=True)
    cover_image = models.FileField(upload_to="products/images/", blank=True, null=True)
    protected_file = models.FileField(upload_to="products/files/", blank=True, null=True)
    security_key = models.CharField(max_length=128, blank=True)
    requires_account = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True, verbose_name="Publicado")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)[:230] or "produto"
            candidate = base_slug
            suffix = 1
            while Product.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{suffix}"
                suffix += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Purchase(models.Model):
    """Aquisição de produto por usuário autenticado."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="purchases")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="purchases")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.username} -> {self.product.name}"


class SectionContent(models.Model):
    """Conteúdo editável das seções institucionais."""

    SECTION_HOME_HERO = "home_hero"
    SECTION_HOME_ABOUT = "home_about"
    SECTION_HOME_SERVICES = "home_services"
    SECTION_HOME_TEAM = "home_team"
    SECTION_HOME_CASES = "home_cases"
    SECTION_HOME_CTA = "home_cta"
    SECTION_ABOUT = "about_main"
    SECTION_SERVICES = "services_main"
    SECTION_SERVICES_PRICING = "services_pricing"
    SECTION_TEAM = "team_main"
    SECTION_CASES = "cases_main"
    SECTION_CONTACT = "contact_main"
    SECTION_PROFILE = "profile"

    SECTION_CHOICES = [
        (SECTION_HOME_HERO, "Home - Hero"),
        (SECTION_HOME_ABOUT, "Home - Sobre"),
        (SECTION_HOME_SERVICES, "Home - Serviços"),
        (SECTION_HOME_TEAM, "Home - Equipe"),
        (SECTION_HOME_CASES, "Home - Cases"),
        (SECTION_HOME_CTA, "Home - CTA final"),
        (SECTION_ABOUT, "Página Sobre"),
        (SECTION_SERVICES, "Página Serviços"),
        (SECTION_SERVICES_PRICING, "Página Serviços - Preços"),
        (SECTION_TEAM, "Página Equipe"),
        (SECTION_CASES, "Página Cases"),
        (SECTION_CONTACT, "Página Contato"),
        (SECTION_PROFILE, "Perfil (Contato e Redes)"),
    ]

    section_key = models.CharField(max_length=80, choices=SECTION_CHOICES, unique=True)
    title = models.CharField(max_length=255, blank=True)
    subtitle = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)
    image = models.FileField(upload_to="sections/images/", blank=True, null=True)
    phone = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    instagram = models.URLField(blank=True)
    is_published = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["section_key"]

    def __str__(self) -> str:
        return self.get_section_key_display()


class ManagerEmailToken(models.Model):
    """Token de verificação enviado por e-mail para ativar conta gestora."""

    email = models.EmailField()
    token = models.CharField(max_length=32, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @classmethod
    def create_token(cls, email: str) -> "ManagerEmailToken":
        token = secrets.token_urlsafe(18)
        expires_at = timezone.now() + timedelta(
            minutes=getattr(settings, "MANAGER_TOKEN_EXPIRY_MINUTES", 15)
        )
        return cls.objects.create(email=email, token=token, expires_at=expires_at)

    def is_valid(self) -> bool:
        return (not self.is_used) and timezone.now() <= self.expires_at


class ServiceRequest(models.Model):
    """Solicitação de serviço enviada pelo formulário público."""

    SERVICE_WEBSITE = "website"
    SERVICE_APP = "app"
    SERVICE_SYSTEM = "system"
    SERVICE_AUTOMATION = "automation"
    SERVICE_CUSTOM = "custom"

    SERVICE_CHOICES = [
        (SERVICE_WEBSITE, "Desenvolvimento de Sites"),
        (SERVICE_APP, "Aplicativos Mobile"),
        (SERVICE_SYSTEM, "Sistemas Web"),
        (SERVICE_AUTOMATION, "Automações e Integrações"),
        (SERVICE_CUSTOM, "Projeto sob medida"),
    ]

    STATUS_NEW = "new"
    STATUS_CONTACTED = "contacted"
    STATUS_DONE = "done"

    STATUS_CHOICES = [
        (STATUS_NEW, "Novo"),
        (STATUS_CONTACTED, "Em contato"),
        (STATUS_DONE, "Finalizado"),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    company = models.CharField(max_length=150, blank=True)
    service_type = models.CharField(max_length=32, choices=SERVICE_CHOICES)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} - {self.get_service_type_display()}"


class ClientFeedback(models.Model):
    """Feedbacks visuais de clientes (imagem + opcional descrição)."""

    image = models.FileField(upload_to="feedbacks/images/")
    author = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=150, blank=True)
    quote = models.TextField(blank=True)
    is_published = models.BooleanField(default=True, verbose_name="Publicado")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.author or "Feedback sem autor"


class ClientProfile(models.Model):
    """Perfil do cliente com avatar."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="client_profile")
    avatar = models.FileField(upload_to="profiles/avatars/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.user.username


class TeamMember(models.Model):
    """Membro da equipe com página de portfolio."""

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    role = models.CharField(max_length=180, blank=True)
    bio = models.TextField(blank=True)
    image = models.FileField(upload_to="team/images/", blank=True, null=True)
    content = models.TextField(blank=True)
    is_published = models.BooleanField(default=True, verbose_name="Publicado")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)[:170] or "membro"
            candidate = base_slug
            suffix = 1
            while TeamMember.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{suffix}"
                suffix += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class ServiceItem(models.Model):
    """Serviço oferecido pela empresa."""

    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    summary = models.CharField(max_length=255, blank=True)
    content = models.TextField(blank=True)
    image = models.FileField(upload_to="services/images/", blank=True, null=True)
    is_published = models.BooleanField(default=True, verbose_name="Publicado")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)[:170] or "servico"
            candidate = base_slug
            suffix = 1
            while ServiceItem.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{suffix}"
                suffix += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title


class CaseStudy(models.Model):
    """Projeto/Case publicado pela empresa."""

    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    summary = models.CharField(max_length=255, blank=True)
    result = models.TextField(blank=True)
    image = models.FileField(upload_to="cases/images/", blank=True, null=True)
    is_published = models.BooleanField(default=True, verbose_name="Publicado")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)[:170] or "projeto"
            candidate = base_slug
            suffix = 1
            while CaseStudy.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{suffix}"
                suffix += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title
