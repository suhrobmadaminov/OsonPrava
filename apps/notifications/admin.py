from django.contrib import admin
from django.utils.html import format_html
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user_display', 'type_display', 'title_short',
        'is_read_badge', 'created_at', 'time_ago'
    )
    list_filter = ('is_read', 'type', 'created_at')
    search_fields = ('user__username', 'user__email', 'title_uz', 'title_ru', 'body_uz')
    raw_id_fields = ('user',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    list_editable = ('is_read',)
    readonly_fields = ('created_at', 'body_preview', 'data_preview')
    list_per_page = 25

    fieldsets = (
        ('Asosiy ma\'lumotlar', {
            'fields': ('user', 'type', 'is_read')
        }),
        ('Matnlar', {
            'fields': ('title_uz', 'title_ru', 'body_uz', 'body_ru', 'body_preview')
        }),
        ('Qo\'shimcha ma\'lumotlar', {
            'fields': ('data_preview',),
            'classes': ('collapse',)
        }),
        ('Tizim', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    actions = [
        'mark_as_read', 'mark_as_unread', 'delete_read',
        'export_notifications'
    ]

    def user_display(self, obj):
        return obj.user.username
    user_display.short_description = 'Foydalanuvchi'
    user_display.admin_order_field = 'user__username'

    def type_display(self, obj):
        type_colors = {
            'achievement': '#6f42c1',
            'subscription': '#17a2b8',
            'test_result': '#28a745',
            'system': '#6c757d',
            'reminder': '#ffc107',
        }
        color = type_colors.get(obj.type, '#6c757d')
        return format_html(
            '<span style="color: #fff; background-color: {}; padding: 3px 8px; border-radius: 3px; font-size: 12px;">{}</span>',
            color, obj.type
        )
    type_display.short_description = 'Turi'

    def title_short(self, obj):
        max_length = 50
        title = obj.title_uz
        if len(title) > max_length:
            title = title[:max_length] + '...'
        return format_html('<strong>{}</strong>', title)
    title_short.short_description = 'Sarlavha'
    title_short.admin_order_field = 'title_uz'

    def is_read_badge(self, obj):
        if obj.is_read:
            return format_html('<span style="color: #6c757d; font-weight: bold;">O\'qilgan</span>')
        return format_html('<span style="color: #dc3545; font-weight: bold;">Yangi</span>')
    is_read_badge.short_description = 'Holat'

    def time_ago(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.created_at
        total_seconds = int(delta.total_seconds())
        if total_seconds < 60:
            return f'{total_seconds} soniya oldin'
        elif total_seconds < 3600:
            return f'{total_seconds // 60} daqiqa oldin'
        elif total_seconds < 86400:
            return f'{total_seconds // 3600} soat oldin'
        else:
            return f'{total_seconds // 86400} kun oldin'
    time_ago.short_description = 'Qachon'

    def body_preview(self, obj):
        max_length = 500
        body = obj.body_uz
        if len(body) > max_length:
            body = body[:max_length] + '...'
        return format_html(
            '<div style="max-height: 200px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px; line-height: 1.6;">{}</div>',
            body
        )
    body_preview.short_description = 'Matn ko\'rinishi'

    def data_preview(self, obj):
        if obj.data:
            import json
            formatted = json.dumps(obj.data, indent=2, ensure_ascii=False)
            return format_html(
                '<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto; font-size: 12px;">{}</pre>',
                formatted
            )
        return format_html('<span style="color: #6c757d;">Qo\'shimcha ma\'lumot yo\'q</span>')
    data_preview.short_description = 'JSON ma\'lumotlar'

    def mark_as_read(self, request, queryset):
        updated = queryset.filter(is_read=False).update(is_read=True)
        self.message_user(request, f'{updated} ta bildirishnoma o\'qilgan deb belgilandi.')
    mark_as_read.short_description = 'Tanlanganlarni o\'qilgan deb belgilash'

    def mark_as_unread(self, request, queryset):
        updated = queryset.filter(is_read=True).update(is_read=False)
        self.message_user(request, f'{updated} ta bildirishnoma o\'qilmagan deb belgilandi.')
    mark_as_unread.short_description = 'Tanlanganlarni o\'qilmagan deb belgilash'

    def delete_read(self, request, queryset):
        deleted_count = queryset.filter(is_read=True).count()
        queryset.filter(is_read=True).delete()
        self.message_user(request, f'{deleted_count} ta o\'qilgan bildirishnoma o\'chirildi.')
    delete_read.short_description = "O'qilganlarni o'chirish"

    def export_notifications(self, request, queryset):
        read_count = queryset.filter(is_read=True).count()
        unread_count = queryset.filter(is_read=False).count()
        types = {}
        for n in queryset:
            types[n.type] = types.get(n.type, 0) + 1
        type_summary = ', '.join(f'{v} ta {k}' for k, v in types.items())
        self.message_user(
            request,
            f'{queryset.count()} ta bildirishnoma tanlandi. '
            f'O\'qilgan: {read_count}, O\'qilmagan: {unread_count}. '
            f'Turlari: {type_summary}'
        )
    export_notifications.short_description = 'Tanlanganlarni eksport qilish (statistika)'
