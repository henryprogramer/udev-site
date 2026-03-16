"""Testes de regressao do app core."""

from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from .models import Product, Purchase


class AuthAndPurchaseFlowTests(TestCase):
    """Valida fluxos criticos de autenticacao e compra."""

    def setUp(self) -> None:
        self.user = User.objects.create_user(
            username="cliente@example.com",
            email="cliente@example.com",
            password="SenhaForte123!",
            first_name="Cliente QA",
        )
        self.product = Product.objects.create(
            name="Produto QA",
            description="Produto para testes",
            price=Decimal("49.90"),
            security_key="segredo-qa",
            is_active=True,
        )

    def test_login_accepts_uppercase_email(self) -> None:
        """Login deve funcionar mesmo com e-mail em caixa alta."""
        response = self.client.post(
            reverse("login"),
            {
                "username": "CLIENTE@EXAMPLE.COM",
                "password": "SenhaForte123!",
            },
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.headers.get("Location"), reverse("account"))

    def test_purchase_route_requires_post(self) -> None:
        """Compra nao pode ser realizada via GET para evitar escrita indevida no banco."""
        self.client.force_login(self.user)
        purchase_url = reverse("purchase_product", args=[self.product.slug])

        get_response = self.client.get(purchase_url)
        self.assertEqual(get_response.status_code, 405)
        self.assertFalse(Purchase.objects.filter(user=self.user, product=self.product).exists())

        post_response = self.client.post(purchase_url)
        self.assertEqual(post_response.status_code, 302)
        self.assertTrue(Purchase.objects.filter(user=self.user, product=self.product).exists())

    def test_download_route_requires_post(self) -> None:
        """Download protegido nao deve aceitar GET."""
        self.client.force_login(self.user)
        Purchase.objects.create(user=self.user, product=self.product)

        response = self.client.get(reverse("download_product_file", args=[self.product.slug]))
        self.assertEqual(response.status_code, 405)
