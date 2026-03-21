"""Conteudos institucionais compartilhados para as paginas legais."""

from __future__ import annotations

from datetime import date

LEGAL_LAST_UPDATED = date(2026, 3, 21)

LEGAL_DOCS_INDEX = {
    "title": "Central de documentação",
    "summary": "Página central com acesso a todas as políticas e diretrizes publicadas.",
    "url_name": "docs",
}

LEGAL_DOCUMENTS = [
    {
        "title": "Política de Privacidade",
        "summary": "Como a UDEV coleta, usa, compartilha e protege dados pessoais.",
        "url_name": "privacy",
    },
    {
        "title": "Termos de Uso",
        "summary": "Condições para acessar, navegar e utilizar os serviços da UDEV.",
        "url_name": "terms",
    },
    {
        "title": "Política de Pagamento e Reembolso",
        "summary": "Regras para confirmação, cancelamento, reembolso e contestação.",
        "url_name": "payment_policy",
    },
    {
        "title": "Segurança e Proteção de Dados",
        "summary": "Medidas de proteção, acesso restrito e resposta a incidentes.",
        "url_name": "security",
    },
    {
        "title": "Direitos de Uso",
        "summary": "Condições de uso do conteúdo, da identidade visual e dos materiais.",
        "url_name": "rights",
    },
    {
        "title": "Diretrizes da Marca",
        "summary": "Orientações para aplicar a marca UDEV de forma consistente.",
        "url_name": "guidelines",
    },
]

LEGAL_FOOTER_GROUPS = [
    {
        "title": "LEGAL & DADOS",
        "documents": [
            {"title": "Política de Privacidade", "url_name": "privacy"},
            {"title": "Termos de Uso", "url_name": "terms"},
            {"title": "Segurança e Proteção de Dados", "url_name": "security"},
        ],
    },
    {
        "title": "FINANCEIRO",
        "documents": [
            {
                "title": "Política de Pagamento e Reembolso",
                "url_name": "payment_policy",
            }
        ],
    },
    {
        "title": "INSTITUCIONAL",
        "documents": [
            {"title": "Direitos de Uso", "url_name": "rights"},
            {"title": "Diretrizes da Marca", "url_name": "guidelines"},
        ],
    },
]

LEGAL_TRUST_BLOCK = {
    "title": "Segurança",
    "lines": [
        "Pagamentos processados por plataforma segura.",
        "Não armazenamos dados completos de cartão.",
    ],
}

LEGAL_NOTICE_POINTS = [
    "Pagamentos são processados por plataforma intermediadora externa.",
    "A UDEV não armazena dados completos de cartão em seus servidores.",
    "A navegação e o uso do site devem respeitar os Termos de Uso publicados.",
]

LEGAL_NOTICE_SHORT = (
    "Pagamentos são processados por plataforma intermediadora externa. "
    "A UDEV não armazena dados completos de cartão. "
    "A navegação e o uso do site devem respeitar os Termos de Uso publicados."
)
