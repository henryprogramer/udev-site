"""Comando para garantir usuário gestor inicial."""

from __future__ import annotations

import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Cria ou atualiza o usuário gestor padrão (com senha inicial)."

    def handle(self, *args, **options):
        email = os.getenv("MANAGER_REGISTRATION_EMAIL", "udev.oficial@gmail.com").strip().lower()
        full_name = os.getenv("MANAGER_REGISTRATION_NAME", "Equipe Gestora Udev").strip()
        default_password = os.getenv("MANAGER_DEFAULT_PASSWORD", "Ud9088152022/")

        if not email:
            self.stdout.write(
                self.style.WARNING("Variáveis de gestor não definidas. Nada foi feito.")
            )
            return

        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                "email": email,
                "first_name": full_name,
                "is_staff": True,
                "is_superuser": False,
                "is_active": True,
            },
        )

        changed = False
        if user.email != email:
            user.email = email
            changed = True
        if user.first_name != full_name:
            user.first_name = full_name
            changed = True
        if not user.is_staff:
            user.is_staff = True
            changed = True
        if not user.is_active:
            user.is_active = True
            changed = True

        # Em criação inicial (ou se a conta ainda estiver sem senha),
        # garante acesso com a senha padrão para o primeiro login.
        if created or not user.has_usable_password():
            user.set_password(default_password)
            changed = True

        if created or changed:
            user.save()

        status = "criado" if created else "atualizado"
        self.stdout.write(self.style.SUCCESS(f"Usuário gestor {status}: {email}"))
