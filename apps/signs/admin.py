from django.contrib import admin
from django.utils.html import format_html
from .models import RoadSign


@admin.register(RoadSign)
class RoadSignAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'code_display', 'name_short', 'category_badge',
        'order_index', 'image_preview', 'languages_count'
    )
    list_filter = ('category',)
    search_fields = ('code', 'name_uz', 'name_uz_cyr', 'name_ru', 'desc_uz')
    ordering = ('order_index',)
    list_editable = ('order_index',)
    list_per_page = 30
    readonly_fields = ('description_preview', 'image_preview_detail')

    fieldsets = (
        ('Asosiy ma\'lumotlar', {
            'fields': ('code', 'name_uz', 'name_uz_cyr', 'name_ru', 'category', 'order_index')
        }),
        ('Tavsif', {
            'fields': ('desc_uz', 'desc_uz_cyr', 'desc_ru', 'description_preview')
        }),
        ('Rasm', {
            'fields': ('image_url', 'image_preview_detail')
        }),
    )

    actions = [
        'export_signs', 'reorder_signs', 'verify_translations'
    ]

    def code_display(self, obj):
        return format_html('<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">{}</code>', obj.code)
    code_display.short_description = 'Kod'
    code_display.admin_order_field = 'code'

    def name_short(self, obj):
        max_length = 40
        name = obj.name_uz
        if len(name) > max_length:
            name = name[:max_length] + '...'
        return format_html('<strong>{}</strong>', name)
    name_short.short_description = 'Nomi'
    name_short.admin_order_field = 'name_uz'

    def category_badge(self, obj):
        colors = {
            'WARNING': '#dc3545',
            'PRIORITY': '#ffc107',
            'PROHIBITION': '#e83e8c',
            'MANDATORY': '#17a2b8',
            'SPECIAL': '#6f42c1',
            'INFORMATION': '#28a745',
            'SERVICE': '#20c997',
            'ADDITIONAL': '#6c757d',
        }
        color = colors.get(obj.category, '#6c757d')
        labels = dict(RoadSign._meta.get_field('category').choices)
        return format_html(
            '<span style="color: #fff; background-color: {}; padding: 3px 8px; border-radius: 3px; font-size: 12px;">{}</span>',
            color, labels.get(obj.category, obj.category)
        )
    category_badge.short_description = 'Kategoriya'

    def image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px; border: 1px solid #ddd;" />',
                obj.image_url
            )
        return format_html('<span style="color: #dc3545;">Rasm yo\'q</span>')
    image_preview.short_description = 'Rasm'

    def languages_count(self, obj):
        count = 3  # uz, uz_cyr, ru
        return format_html('<span style="font-weight: bold;">{}</span> til', count)
    languages_count.short_description = 'Tillar'

    def description_preview(self, obj):
        max_length = 500
        desc = obj.desc_uz
        if len(desc) > max_length:
            desc = desc[:max_length] + '...'
        return format_html(
            '<div style="max-height: 300px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px; line-height: 1.6;">{}</div>',
            desc
        )
    description_preview.short_description = 'Tavsif ko\'rinishi'

    def image_preview_detail(self, obj):
        if obj.image_url:
            return format_html(
                '<div style="max-width: 300px;"><img src="{}" style="width: 100%; border-radius: 4px; border: 1px solid #ddd;" /><br><small>{}</small></div>',
                obj.image_url, obj.image_url
            )
        return format_html('<span style="color: #dc3545;">Rasm mavjud emas</span>')
    image_preview_detail.short_description = 'Rasm ko\'rinishi'

    def export_signs(self, request, queryset):
        categories = {}
        for sign in queryset:
            cat = sign.category
            categories[cat] = categories.get(cat, 0) + 1
        summary = ', '.join(f'{v} ta {k}' for k, v in categories.items())
        self.message_user(request, f'{queryset.count()} ta belgi tanlandi. Kategoriyalar: {summary}')
    export_signs.short_description = 'Tanlanganlarni eksport qilish (statistika)'

    def reorder_signs(self, request, queryset):
        for i, sign in enumerate(queryset.order_by('order_index'), start=1):
            sign.order_index = i
            sign.save(update_fields=['order_index'])
        self.message_user(request, f'{queryset.count()} ta belgi qayta tartiblandi.')
    reorder_signs.short_description = 'Tanlanganlarni qayta tartiblash'

    def verify_translations(self, request, queryset):
        incomplete = []
        for sign in queryset:
            missing = []
            if not sign.name_uz_cyr:
                missing.append('name_uz_cyr')
            if not sign.name_ru:
                missing.append('name_ru')
            if not sign.desc_uz_cyr:
                missing.append('desc_uz_cyr')
            if not sign.desc_ru:
                missing.append('desc_ru')
            if missing:
                incomplete.append(f'{sign.code} ({", ".join(missing)})')
        if incomplete:
            self.message_user(
                request,
                f'{len(incomplete)} ta belgida tarjima yetishmayapti: {"; ".join(incomplete[:10])}',
                level='warning'
            )
        else:
            self.message_user(request, 'Barcha tanlangan belgilarda tarjimalar to\'liq.')
    verify_translations.short_description = 'Tanlanganlarning tarjimalarini tekshirish'
