"""
Admin configuration for the Accounts app.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import RefreshToken


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    """Admin for managing user refresh tokens."""

    list_display = ("token", "user", "expires_at", "created_at")
    list_filter = ("created_at", "expires_at")
    search_fields = ("token", "user__username", "user__email")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"
    raw_id_fields = ('user',)

    def has_add_permission(self, request):
        """Disable manual creation -- tokens are created programmatically."""
        return False
