"""
Admin configuration for the Accounts app.
Registers User and RefreshToken models from the users app
with full list_display, filters, search, actions, and fieldsets.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from apps.users.models import RefreshToken

User = get_user_model()


# ---------------------------------------------------------------------------
# Inline for RefreshToken
# ---------------------------------------------------------------------------
@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    """Admin for managing user refresh tokens."""

    list_display = ("token", "user", "expires_at", "created_at", "is_expired")
    list_filter = ("created_at", "expires_at")
    search_fields = ("token", "user__username", "user__email")
    readonly_fields = ("created_at", "is_expired_display")
    date_hierarchy = "created_at"

    fieldsets = (
        (None, {
            "fields": ("token", "user", "expires_at")
        }),
        (_("Timestamps"), {
            "fields": ("created_at", "is_expired_display")
        }),
    )

    def is_expired_display(self, obj):
        """Show expiry status in readable form."""
        return _("Yes") if obj.is_expired else _("No")
    is_expired_display.short_description = _("Is Expired")

    def has_add_permission(self, request):
        """Disable manual creation -- tokens are created programmatically."""
        return False


# ---------------------------------------------------------------------------
# User Admin
# ---------------------------------------------------------------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Professional admin view for the custom User model."""

    list_display = (
        "id",
        "username",
        "email",
        "first_name",
        "role",
        "is_premium",
        "streak",
        "last_active_at",
        "is_active",
        "created_at",
    )
    list_display_links = ("id", "username")
    list_filter = (
        "role",
        "is_premium",
        "is_active",
        "is_staff",
        "language",
        "email_verified",
        "last_active_at",
        "created_at",
    )
    search_fields = (
        "username",
        "email",
        "first_name",
        "last_name",
        "telegram_id",
    )
    readonly_fields = (
        "id",
        "created_at",
        "updated_at",
        "last_active_at",
        "email_verification_token",
        "email_verification_expires",
        "reset_password_token",
        "reset_password_expires",
        "login_attempts",
        "locked_until",
        "longest_streak",
        "is_locked_display",
    )
    ordering = ("-created_at",)
    date_hierarchy = "created_at"

    fieldsets = (
        (_("Personal Info"), {
            "fields": (
                "id", "username", "email", "first_name", "last_name",
                "avatar_url", "telegram_id",
            )
        }),
        (_("Role & Permissions"), {
            "fields": (
                "role", "language", "is_premium", "premium_expires_at",
                "is_active", "is_staff", "is_superuser", "groups",
                "user_permissions",
            )
        }),
        (_("Activity"), {
            "fields": (
                "streak", "longest_streak", "last_active_at",
            )
        }),
        (_("Email Verification"), {
            "classes": ("collapse",),
            "fields": (
                "email_verified", "email_verification_token",
                "email_verification_expires",
            )
        }),
        (_("Password Reset"), {
            "classes": ("collapse",),
            "fields": (
                "reset_password_token", "reset_password_expires",
            )
        }),
        (_("Security"), {
            "classes": ("collapse",),
            "fields": (
                "login_attempts", "locked_until", "is_locked_display",
            )
        }),
        (_("Timestamps"), {
            "fields": ("created_at", "updated_at")
        }),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "username", "email", "password1", "password2",
                "role", "language",
            ),
        }),
    )

    actions = [
        "activate_users",
        "deactivate_users",
        "make_premium",
        "remove_premium",
        "reset_login_attempts_action",
        "mark_email_verified",
    ]

    # --- Actions ---

    @admin.action(description=_("Activate selected users"))
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, _("%d user(s) activated.") % updated)

    @admin.action(description=_("Deactivate selected users"))
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, _("%d user(s) deactivated.") % updated)

    @admin.action(description=_("Grant Premium to selected users"))
    def make_premium(self, request, queryset):
        updated = queryset.update(is_premium=True)
        self.message_user(request, _("%d user(s) set to Premium.") % updated)

    @admin.action(description=_("Remove Premium from selected users"))
    def remove_premium(self, request, queryset):
        updated = queryset.update(is_premium=False, premium_expires_at=None)
        self.message_user(request, _("Premium removed from %d user(s).") % updated)

    @admin.action(description=_("Reset login attempts for selected users"))
    def reset_login_attempts_action(self, request, queryset):
        for user in queryset:
            user.reset_login_attempts()
        self.message_user(request, _("Login attempts reset for %d user(s).") % queryset.count())

    @admin.action(description=_("Mark email as verified"))
    def mark_email_verified(self, request, queryset):
        updated = queryset.update(email_verified=True)
        self.message_user(request, _("%d user(s) marked as email verified.") % updated)

    # --- Display helpers ---

    @admin.display(boolean=True, description=_("Locked"))
    def is_locked_display(self, obj):
        return obj.is_locked
