"""
Custom admin for User model with enhanced features.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced User admin with custom fields and actions."""

    list_display = (
        'id', 'username', 'email', 'telegram_id', 'role', 'language',
        'is_premium', 'streak', 'last_active_at', 'created_at', 'is_active'
    )
    list_filter = (
        'role', 'language', 'is_premium', 'is_staff', 'is_active',
        'email_verified', 'created_at', 'last_active_at'
    )
    search_fields = (
        'username', 'email', 'first_name', 'last_name', 'telegram_id'
    )
    readonly_fields = (
        'id', 'created_at', 'updated_at', 'last_active_at', 'longest_streak'
    )
    list_editable = ('role', 'is_premium')
    list_per_page = 50
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        (_('Asosiy ma\'lumotlar'), {
            'fields': ('username', 'email', 'password', 'telegram_id')
        }),
        (_('Shaxsiy ma\'lumotlar'), {
            'fields': ('first_name', 'last_name', 'avatar_url', 'language')
        }),
        (_('Rollar va ruxsatlar'), {
            'fields': (
                'role', 'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions'
            )
        }),
        (_('Premium obuna'), {
            'fields': ('is_premium', 'premium_expires_at'),
            'classes': ('collapse',)
        }),
        (_('Xavfsizlik'), {
            'fields': (
                'email_verified', 'email_verification_token',
                'email_verification_expires', 'reset_password_token',
                'reset_password_expires', 'login_attempts', 'locked_until'
            ),
            'classes': ('collapse',)
        }),
        (_('Statistika'), {
            'fields': ('streak', 'longest_streak', 'last_active_at'),
            'classes': ('collapse',)
        }),
        (_('Muhim sanalar'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2',
                'telegram_id', 'first_name', 'last_name'
            ),
        }),
    )

    actions = ['make_premium', 'remove_premium', 'ban_users', 'activate_users']

    @admin.action(description='Tanlangan foydalanuvchilarni Premium qilish')
    def make_premium(self, request, queryset):
        updated = queryset.update(is_premium=True)
        self.message_user(request, f'{updated} foydalanuvchi Premium qilindi.')

    @admin.action(description='Tanlangan foydalanuvchilarning Premium olib tashlash')
    def remove_premium(self, request, queryset):
        updated = queryset.update(is_premium=False, premium_expires_at=None)
        self.message_user(request, f'{updated} foydalanuvchining Premium olib tashlandi.')

    @admin.action(description='Tanlangan foydalanuvchilarni bloklash')
    def ban_users(self, request, queryset):
        updated = queryset.update(role='BANNED', is_active=False)
        self.message_user(request, f'{updated} foydalanuvchi bloklandi.')

    @admin.action(description='Tanlangan foydalanuvchilarni faollashtirish')
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} foydalanuvchi faollashtirildi.')
