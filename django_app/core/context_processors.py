"""Context processors globais."""

from __future__ import annotations

from django.conf import settings

from .models import ClientProfile, SectionContent


def footer_profile(_request):
    """Disponibiliza contatos institucionais no footer."""
    section = SectionContent.objects.filter(
        section_key=SectionContent.SECTION_PROFILE
    ).first()

    phone = section.phone if section else ""
    email = section.email if section else settings.MANAGER_REGISTRATION_EMAIL
    instagram = section.instagram if section else ""

    return {
        "footer_profile": {
            "phone": phone,
            "email": email,
            "instagram": instagram,
        }
    }


def client_profile(request):
    """Perfil do cliente autenticado para exibir avatar no header."""
    if request.user.is_authenticated and not request.user.is_staff:
        profile, _created = ClientProfile.objects.get_or_create(user=request.user)
        return {"client_profile": profile}
    return {"client_profile": None}
