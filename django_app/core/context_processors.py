"""Context processors globais."""

from __future__ import annotations

from django.conf import settings
from django.urls import reverse

from .models import ClientProfile, SectionContent
from .legal import (
    LEGAL_DOCS_INDEX,
    LEGAL_FOOTER_GROUPS,
    LEGAL_DOCUMENTS,
    LEGAL_NOTICE_POINTS,
    LEGAL_NOTICE_SHORT,
    LEGAL_TRUST_BLOCK,
)


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


def legal_resources(_request):
    """Links e avisos institucionais usados no footer e nas paginas legais."""
    legal_footer_docs_groups = [
        {
            "title": group["title"],
            "documents": [
                {
                    "title": document["title"],
                    "url": reverse(document["url_name"]),
                }
                for document in group["documents"]
            ],
        }
        for group in LEGAL_FOOTER_GROUPS[:2]
    ]

    legal_footer_institutional_group = {
        "title": LEGAL_FOOTER_GROUPS[2]["title"],
        "documents": [
            {
                "title": document["title"],
                "url": reverse(document["url_name"]),
            }
            for document in LEGAL_FOOTER_GROUPS[2]["documents"]
        ],
    }

    return {
        "legal_docs_index": {
            "title": LEGAL_DOCS_INDEX["title"],
            "summary": LEGAL_DOCS_INDEX["summary"],
            "url": reverse(LEGAL_DOCS_INDEX["url_name"]),
        },
        "legal_documents": [
            {
                "title": item["title"],
                "summary": item["summary"],
                "url": reverse(item["url_name"]),
            }
            for item in LEGAL_DOCUMENTS
        ],
        "legal_footer_groups": legal_footer_docs_groups + [legal_footer_institutional_group],
        "legal_footer_docs_groups": legal_footer_docs_groups,
        "legal_footer_institutional_group": legal_footer_institutional_group,
        "legal_trust_block": LEGAL_TRUST_BLOCK,
        "legal_notice_points": LEGAL_NOTICE_POINTS,
        "legal_notice_short": LEGAL_NOTICE_SHORT,
    }


def client_profile(request):
    """Perfil do cliente autenticado para exibir avatar no header."""
    if request.user.is_authenticated and not request.user.is_staff:
        profile, _created = ClientProfile.objects.get_or_create(user=request.user)
        return {"client_profile": profile}
    return {"client_profile": None}
