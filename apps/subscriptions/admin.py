from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user_display', 'plan_display', 'status_badge',
        'payment_provider_display', 'amount_display', 'currency',
        'starts_at', 'expires_at', 'is_expired', 'created_at'
    )
    list_filter = ('plan', 'status', 'payment_provider', 'currency')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'payment_id')
    raw_id_fields = ('user',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    list_per_page = 25
    readonly_fields = ('created_at', 'duration_display', 'days_remaining')

    fieldsets = (
        ('Asosiy ma\'lumotlar', {
            'fields': ('user', 'plan', 'status')
        }),
        ('To\'lov ma\'lumotlari', {
            'fields': ('payment_provider', 'payment_id', 'amount', 'currency')
        }),
        ('Muddatlar', {
            'fields': ('starts_at', 'expires_at', 'duration_display', 'days_remaining')
        }),
        ('Tizim', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    actions = [
        'activate_subscriptions', 'expire_subscriptions',
        'cancel_subscriptions', 'export_subscriptions'
    ]

    def user_display(self, obj):
        return obj.user.username
    user_display.short_description = 'Foydalanuvchi'
    user_display.admin_order_field = 'user__username'

    def plan_display(self, obj):
        plan_icons = {
            'MONTHLY': '',
            'QUARTERLY': '',
            'YEARLY': '',
            'LIFETIME': '',
        }
        icons = plan_icons.get(obj.plan, '')
        return format_html('{} {}', icons, obj.get_plan_display())
    plan_display.short_description = 'Reja'

    def status_badge(self, obj):
        colors = {
            'ACTIVE': '#28a745',
            'EXPIRED': '#dc3545',
            'CANCELLED': '#6c757d',
        }
        color = colors.get(obj.status, '#6c757d')
        labels = dict(Subscription._meta.get_field('status').choices)
        return format_html(
            '<span style="color: #fff; background-color: {}; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            color, labels.get(obj.status, obj.status)
        )
    status_badge.short_description = 'Holat'

    def payment_provider_display(self, obj):
        provider_emojis = {
            'CLICK': '',
            'PAYME': '',
            'UZUM': '',
            'TELEGRAM_STARS': '',
            'MANUAL': '',
        }
        emoji = provider_emojis.get(obj.payment_provider, '')
        return format_html('{} {}', emoji, obj.get_payment_provider_display())
    payment_provider_display.short_description = "To'lov tizimi"

    def amount_display(self, obj):
        return format_html('<strong>{:,.0f}</strong>', obj.amount)
    amount_display.short_description = 'Narxi'

    def is_expired(self, obj):
        if obj.status == 'EXPIRED':
            return format_html('<span style="color: #dc3545; font-weight: bold;">Tugagan</span>')
        elif obj.status == 'ACTIVE':
            if obj.expires_at and obj.expires_at < timezone.now():
                return format_html('<span style="color: #ffc107; font-weight: bold;">Tugayapti</span>')
            return format_html('<span style="color: #28a745; font-weight: bold;">Faol</span>')
        return format_html('<span style="color: #6c757d;">Bekor qilingan</span>')
    is_expired.short_description = 'Holat'

    def duration_display(self, obj):
        if obj.starts_at and obj.expires_at:
            delta = obj.expires_at - obj.starts_at
            days = delta.days
            if days >= 365:
                years = days // 365
                return f"{years} yil"
            elif days >= 30:
                months = days // 30
                return f"{months} oy"
            return f"{days} kun"
        return '-'
    duration_display.short_description = 'Davomiyligi'

    def days_remaining(self, obj):
        if obj.expires_at:
            delta = obj.expires_at - timezone.now()
            days = delta.days
            if days > 0:
                color = '#28a745' if days > 30 else '#ffc107' if days > 7 else '#dc3545'
                return format_html(
                    '<span style="color: {}; font-weight: bold;">{} kun qoldi</span>',
                    color, days
                )
            return format_html('<span style="color: #dc3545; font-weight: bold;">{} kun oldin tugagan</span>', abs(days))
        return '-'
    days_remaining.short_description = 'Qolgan kunlar'

    def activate_subscriptions(self, request, queryset):
        updated = queryset.filter(status__in=['EXPIRED', 'CANCELLED']).update(status='ACTIVE')
        self.message_user(request, f'{updated} ta obuna faollashtirildi.')
    activate_subscriptions.short_description = 'Tanlanganlarni faollashtirish'

    def expire_subscriptions(self, request, queryset):
        updated = queryset.filter(status='ACTIVE').update(status='EXPIRED')
        self.message_user(request, f'{updated} ta obuna muddati tugagan deb belgilandi.')
    expire_subscriptions.short_description = 'Tanlanganlarning muddatini tugatish'

    def cancel_subscriptions(self, request, queryset):
        updated = queryset.filter(status__in=['ACTIVE', 'EXPIRED']).update(status='CANCELLED')
        self.message_user(request, f'{updated} ta obuna bekor qilindi.')
    cancel_subscriptions.short_description = 'Tanlanganlarni bekor qilish'

    def export_subscriptions(self, request, queryset):
        # Placeholder for export functionality
        count = queryset.count()
        total_amount = sum(q.amount for q in queryset)
        self.message_user(request, f'{count} ta obuna tanlandi. Jami summa: {total_amount:,.0f} UZS')
    export_subscriptions.short_description = 'Tanlanganlarni eksport qilish (statistika)'
