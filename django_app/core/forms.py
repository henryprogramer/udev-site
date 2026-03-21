"""Formulários do app core."""

from __future__ import annotations

import re

from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User

from .models import (
    CaseStudy,
    ClientFeedback,
    Product,
    SectionContent,
    ServiceItem,
    ServiceRequest,
    TeamMember,
)

SPECIAL_CHAR_PATTERN = re.compile(r"[^A-Za-z0-9]")


def validate_password_policy(password: str) -> None:
    """Valida regra de senha: 8+, maiúscula, número e caractere especial."""
    if len(password) < 8:
        raise forms.ValidationError("A senha deve ter pelo menos 8 caracteres.")
    if not re.search(r"[A-Z]", password):
        raise forms.ValidationError("A senha precisa conter ao menos 1 letra maiúscula.")
    if not re.search(r"[0-9]", password):
        raise forms.ValidationError("A senha precisa conter ao menos 1 número.")
    if not SPECIAL_CHAR_PATTERN.search(password):
        raise forms.ValidationError(
            "A senha precisa conter ao menos 1 caractere especial."
        )


class LoginForm(AuthenticationForm):
    """Formulário de login com labels em PT-BR."""

    username = forms.EmailField(label="E-mail")
    password = forms.CharField(
        label="Senha",
        widget=forms.PasswordInput(attrs={"class": "password-field"}),
    )

    def clean_username(self):
        """Normaliza e-mail para evitar falha de login por caixa alta."""
        return self.cleaned_data["username"].strip().lower()


class RegisterForm(UserCreationForm):
    """Cadastro de cliente."""

    full_name = forms.CharField(label="Nome completo", max_length=150)
    email = forms.EmailField(label="E-mail")

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("full_name", "email", "password1", "password2")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["password1"].help_text = (
            "<strong>Requisitos da senha:</strong><br>"
            "- 8 caracteres ou mais<br>"
            "- 1 letra maiúscula<br>"
            "- 1 número<br>"
            "- 1 caractere especial"
        )
        self.fields["password1"].widget.attrs.update({"class": "password-field"})
        self.fields["password2"].widget.attrs.update({"class": "password-field"})

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(username=email).exists():
            raise forms.ValidationError("Este e-mail já está em uso.")
        return email

    def clean_password1(self):
        password = self.cleaned_data["password1"]
        validate_password_policy(password)
        return password

    def save(self, commit=True):
        user = super().save(commit=False)
        email = self.cleaned_data["email"].strip().lower()
        full_name = self.cleaned_data["full_name"].strip()
        user.username = email
        user.email = email
        user.first_name = full_name
        user.is_active = True
        user.is_staff = False
        user.is_superuser = False
        if commit:
            user.save()
        return user


class ProductForm(forms.ModelForm):
    """Formulário de cadastro/edição de produto."""

    class Meta:
        model = Product
        fields = [
            "name",
            "description",
            "price",
            "video_url",
            "cover_image",
            "protected_file",
            "security_key",
            "requires_account",
            "is_active",
        ]
        labels = {
            "name": "Nome",
            "description": "Descrição",
            "price": "Preço",
            "video_url": "URL de vídeo",
            "cover_image": "Imagem de capa",
            "protected_file": "Arquivo protegido do produto",
            "security_key": "Chave de segurança do arquivo",
            "requires_account": "Exige conta para adquirir",
            "is_active": "Publicado",
        }
        help_texts = {
            "security_key": "Informe uma chave para proteger o download do arquivo.",
        }


class SectionContentForm(forms.ModelForm):
    """Formulário de conteúdo das seções da landing."""

    class Meta:
        model = SectionContent
        fields = [
            "section_key",
            "title",
            "subtitle",
            "body",
            "image",
            "phone",
            "email",
            "instagram",
            "is_published",
        ]
        labels = {
            "section_key": "Seção",
            "title": "Título",
            "subtitle": "Subtítulo",
            "body": "Texto principal",
            "image": "Imagem da seção",
            "phone": "Link do WhatsApp",
            "email": "E-mail comercial",
            "instagram": "Link do Instagram",
            "is_published": "Publicado",
        }
        help_texts = {
            "phone": "Use URL completa. Exemplo: https://wa.me/5563984412348",
            "email": "Exemplo: udev.oficial@gmail.com",
            "instagram": "Campo usado pela seção Perfil para exibir Instagram em Contato.",
        }


class ManagerTokenRequestForm(forms.Form):
    """Solicita token de ativação para e-mail gestor."""

    email = forms.EmailField(label="E-mail gestor")


class ManagerPasswordSetupForm(forms.Form):
    """Define senha da conta gestora após token por e-mail."""

    email = forms.EmailField(label="E-mail gestor")
    token = forms.CharField(label="Token recebido", max_length=32)
    password1 = forms.CharField(
        label="Nova senha",
        widget=forms.PasswordInput(attrs={"class": "password-field"}),
        help_text=(
            "<strong>Requisitos da senha:</strong><br>"
            "- 8 caracteres ou mais<br>"
            "- 1 letra maiúscula<br>"
            "- 1 número<br>"
            "- 1 caractere especial"
        ),
    )
    password2 = forms.CharField(
        label="Confirmar senha",
        widget=forms.PasswordInput(attrs={"class": "password-field"}),
    )
    avatar = forms.ImageField(label="Foto (opcional)", required=False)

    def clean_password1(self):
        password = self.cleaned_data["password1"]
        validate_password_policy(password)
        return password

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("As senhas não conferem.")
        return cleaned_data


class ServiceRequestForm(forms.ModelForm):
    """Formulário público de solicitação de serviço."""

    class Meta:
        model = ServiceRequest
        fields = ["name", "email", "phone", "company", "service_type", "message"]
        labels = {
            "name": "Nome completo",
            "email": "E-mail",
            "phone": "WhatsApp",
            "company": "Empresa (opcional)",
            "service_type": "Tipo de serviço",
            "message": "Descreva o que você precisa",
        }
        help_texts = {
            "phone": "Use DDD. Exemplo: (63) 98441-0000",
        }
        widgets = {
            "message": forms.Textarea(attrs={"rows": 5}),
        }


class ServiceRequestAdminForm(forms.ModelForm):
    """Edição administrativa de solicitações de serviço."""

    class Meta:
        model = ServiceRequest
        fields = [
            "name",
            "email",
            "phone",
            "company",
            "service_type",
            "status",
            "message",
        ]
        labels = {
            "name": "Nome completo",
            "email": "E-mail",
            "phone": "WhatsApp",
            "company": "Empresa (opcional)",
            "service_type": "Tipo de serviço",
            "status": "Status",
            "message": "Mensagem do cliente",
        }
        widgets = {
            "message": forms.Textarea(attrs={"rows": 5}),
        }


class ManagerUserForm(forms.Form):
    """Criação rápida de usuários pelo portal de gestão."""

    ROLE_STAFF = "staff"
    ROLE_CLIENT = "client"

    ROLE_CHOICES = [
        (ROLE_STAFF, "Administrador"),
        (ROLE_CLIENT, "Cliente"),
    ]

    full_name = forms.CharField(label="Nome completo", max_length=150)
    email = forms.EmailField(label="E-mail")
    role = forms.ChoiceField(label="Perfil", choices=ROLE_CHOICES, initial=ROLE_STAFF)
    password1 = forms.CharField(
        label="Senha",
        widget=forms.PasswordInput(attrs={"class": "password-field"}),
        help_text=(
            "<strong>Requisitos da senha:</strong><br>"
            "- 8 caracteres ou mais<br>"
            "- 1 letra maiúscula<br>"
            "- 1 número<br>"
            "- 1 caractere especial"
        ),
    )
    password2 = forms.CharField(
        label="Confirmar senha",
        widget=forms.PasswordInput(attrs={"class": "password-field"}),
    )

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(username=email).exists():
            raise forms.ValidationError("Este e-mail já está cadastrado.")
        return email

    def clean_password1(self):
        password = self.cleaned_data["password1"]
        validate_password_policy(password)
        return password

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("As senhas não conferem.")
        return cleaned_data


class ManagerUserEditForm(forms.Form):
    """Edição administrativa de usuários."""

    ROLE_STAFF = ManagerUserForm.ROLE_STAFF
    ROLE_CLIENT = ManagerUserForm.ROLE_CLIENT
    ROLE_CHOICES = ManagerUserForm.ROLE_CHOICES

    full_name = forms.CharField(label="Nome completo", max_length=150)
    email = forms.EmailField(label="E-mail")
    role = forms.ChoiceField(label="Perfil", choices=ROLE_CHOICES)
    avatar = forms.ImageField(label="Foto (opcional)", required=False)

    def __init__(self, *args, user: User, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if (
            User.objects.filter(username=email)
            .exclude(pk=self.user.pk)
            .exists()
        ):
            raise forms.ValidationError("Este e-mail já está cadastrado.")
        return email


class ClientFeedbackForm(forms.ModelForm):
    """Cadastro de feedbacks com imagem."""

    class Meta:
        model = ClientFeedback
        fields = ["image", "author", "role", "quote", "is_published"]
        labels = {
            "image": "Imagem do feedback",
            "author": "Cliente (opcional)",
            "role": "Cargo/empresa (opcional)",
            "quote": "Resumo do feedback (opcional)",
            "is_published": "Publicado",
        }
        help_texts = {
            "image": "Recomendado 1200x800 (proporção 3:2) para preencher o carrossel.",
        }
        widgets = {
            "quote": forms.Textarea(attrs={"rows": 4}),
        }


class TeamMemberForm(forms.ModelForm):
    """Cadastro de membros da equipe."""

    class Meta:
        model = TeamMember
        fields = ["name", "role", "bio", "image", "content", "is_published"]
        labels = {
            "name": "Nome",
            "role": "Cargo",
            "bio": "Resumo rápido",
            "image": "Foto do membro",
            "content": "Conteúdo do portfólio",
            "is_published": "Publicado",
        }
        widgets = {
            "bio": forms.Textarea(attrs={"rows": 3}),
            "content": forms.Textarea(attrs={"rows": 6}),
        }


class ServiceItemForm(forms.ModelForm):
    """Cadastro de serviços da empresa."""

    class Meta:
        model = ServiceItem
        fields = ["title", "summary", "content", "image", "is_published"]
        labels = {
            "title": "Título",
            "summary": "Resumo",
            "content": "Conteúdo detalhado",
            "image": "Imagem do serviço",
            "is_published": "Publicado",
        }
        widgets = {
            "summary": forms.Textarea(attrs={"rows": 2}),
            "content": forms.Textarea(attrs={"rows": 6}),
        }


class CaseStudyForm(forms.ModelForm):
    """Cadastro de projetos/cases."""

    class Meta:
        model = CaseStudy
        fields = ["title", "summary", "result", "image", "is_published"]
        labels = {
            "title": "Título",
            "summary": "Resumo",
            "result": "Resultado/História",
            "image": "Imagem do case",
            "is_published": "Publicado",
        }
        widgets = {
            "summary": forms.Textarea(attrs={"rows": 2}),
            "result": forms.Textarea(attrs={"rows": 6}),
        }
