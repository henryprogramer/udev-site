"""Configuração do Django Admin para modelos da Udev."""

from django.contrib import admin

from .models import ManagerEmailToken, Product, Purchase, SectionContent


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "price", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "product", "created_at")
    search_fields = ("user__username", "product__name")


@admin.register(SectionContent)
class SectionContentAdmin(admin.ModelAdmin):
    list_display = ("section_key", "title", "is_published", "updated_at")
    list_filter = ("is_published", "section_key")
    search_fields = ("title", "subtitle", "body", "phone", "email", "instagram")


@admin.register(ManagerEmailToken)
class ManagerEmailTokenAdmin(admin.ModelAdmin):
    list_display = ("email", "token", "expires_at", "is_used", "created_at")
    list_filter = ("is_used",)
