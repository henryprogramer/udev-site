"""Configuracoes do projeto Django Udev."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

load_dotenv(ROOT_DIR / ".env")

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "trocar-em-producao-django")
DEBUG = os.getenv("DJANGO_DEBUG", "true").lower() == "true"

allowed_hosts_raw = os.getenv(
    "DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,0.0.0.0,testserver"
)
ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_raw.split(",") if host.strip()]

MANAGER_REGISTRATION_EMAIL = os.getenv(
    "MANAGER_REGISTRATION_EMAIL", "udev.oficial@gmail.com"
).strip().lower()
MANAGER_TOKEN_EXPIRY_MINUTES = int(os.getenv("MANAGER_TOKEN_EXPIRY_MINUTES", "15"))

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "core.apps.CoreConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "core.context_processors.footer_profile",
                "core.context_processors.client_profile",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

db_path_raw = os.getenv("DJANGO_DB_PATH", str(ROOT_DIR / "data" / "udev_django.db"))
db_path = Path(db_path_raw)
if not db_path.is_absolute():
    db_path = (ROOT_DIR / db_path).resolve()
db_path.parent.mkdir(parents=True, exist_ok=True)

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": str(db_path),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = ROOT_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = ROOT_DIR / "data" / "uploads"
MEDIA_ROOT.mkdir(parents=True, exist_ok=True)

EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND", "django.core.mail.backends.filebased.EmailBackend"
)
EMAIL_FILE_PATH = ROOT_DIR / "logs" / "mail_outbox"
EMAIL_FILE_PATH.mkdir(parents=True, exist_ok=True)
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "nao-responda@udev.local")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

LOGIN_URL = "/login/"
LOGIN_REDIRECT_URL = "/conta/"
LOGOUT_REDIRECT_URL = "/"
