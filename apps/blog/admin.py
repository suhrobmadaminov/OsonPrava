from django.contrib import admin
from django.utils.html import format_html
from .models import BlogPost


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'title_short', 'category_badge', 'is_published_badge',
        'is_published', 'published_at', 'view_count_display', 'created_at', 'updated_at'
    )
    list_filter = ('is_published', 'category', 'created_at')
    search_fields = ('title_uz', 'title_uz_cyr', 'title_ru', 'content_uz', 'content_uz_cyr', 'content_ru')
    prepopulated_fields = {'slug': ('title_uz',)}
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    list_editable = ('is_published',)
    readonly_fields = ('view_count', 'created_at', 'updated_at', 'content_preview')
    list_per_page = 20

    fieldsets = (
        ('Asosiy ma\'lumotlar', {
            'fields': ('slug', 'title_uz', 'title_uz_cyr', 'title_ru', 'is_published')
        }),
        ('Tarkib', {
            'fields': ('content_uz', 'content_uz_cyr', 'content_ru', 'content_preview')
        }),
        ('Qisqacha matn', {
            'fields': ('excerpt_uz', 'excerpt_uz_cyr', 'excerpt_ru'),
            'classes': ('collapse',)
        }),
        ('Rasmlar va kategoriyalar', {
            'fields': ('image_url', 'category', 'tags')
        }),
        ('Nashr va statistika', {
            'fields': ('published_at', 'view_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = [
        'publish_posts', 'unpublish_posts', 'reset_views',
        'increment_views', 'export_posts'
    ]

    def title_short(self, obj):
        max_length = 50
        title = obj.title_uz
        if len(title) > max_length:
            title = title[:max_length] + '...'
        return format_html('<strong>{}</strong>', title)
    title_short.short_description = 'Sarlavha'
    title_short.admin_order_field = 'title_uz'

    def category_badge(self, obj):
        colors = {
            'huquq': '#17a2b8',
            'qoidalar': '#ffc107',
            'maslahatlar': '#28a745',
            'yangiliklar': '#6f42c1',
        }
        color = colors.get(obj.category.lower(), '#6c757d')
        return format_html(
            '<span style="color: #fff; background-color: {}; padding: 3px 8px; border-radius: 3px; font-size: 12px;">{}</span>',
            color, obj.category
        )
    category_badge.short_description = 'Kategoriya'

    def is_published_badge(self, obj):
        if obj.is_published:
            return format_html('<span style="color: #28a745; font-weight: bold;">Nashr qilingan</span>')
        return format_html('<span style="color: #dc3545; font-weight: bold;">Qoralama</span>')
    is_published_badge.short_description = 'Holat'

    def view_count_display(self, obj):
        return format_html('<span style="font-weight: bold;">{:,}</span>', obj.view_count)
    view_count_display.short_description = "Ko'rishlar"
    view_count_display.admin_order_field = 'view_count'

    def content_preview(self, obj):
        max_length = 300
        content = obj.content_uz
        if len(content) > max_length:
            content = content[:max_length] + '...'
        return format_html('<div style="max-height: 200px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px;">{}</div>', content)
    content_preview.short_description = 'Tarkib ko\'rinishi'

    def publish_posts(self, request, queryset):
        from django.utils import timezone
        updated = queryset.filter(is_published=False).update(is_published=True, published_at=timezone.now())
        self.message_user(request, f'{updated} ta post nashr qilindi.')
    publish_posts.short_description = 'Tanlanganlarni nashr qilish'

    def unpublish_posts(self, request, queryset):
        updated = queryset.filter(is_published=True).update(is_published=False)
        self.message_user(request, f'{updated} ta post qoralama holatiga qaytarildi.')
    unpublish_posts.short_description = 'Tanlanganlarni qoralama qilish'

    def reset_views(self, request, queryset):
        updated = queryset.update(view_count=0)
        self.message_user(request, f'{updated} ta post ko\'rishlar soni nollandi.')
    reset_views.short_description = "Tanlanganlarning ko'rishlar sonini nollash"

    def increment_views(self, request, queryset):
        for post in queryset:
            post.increment_views()
        self.message_user(request, f'{queryset.count()} ta post ko\'rishlar soni oshirildi.')
    increment_views.short_description = "Tanlanganlarning ko'rishlar sonini oshirish"

    def export_posts(self, request, queryset):
        total_views = sum(p.view_count for p in queryset)
        published_count = queryset.filter(is_published=True).count()
        self.message_user(
            request,
            f'{queryset.count()} ta post tanlandi. '
            f'Jami ko\'rishlar: {total_views:,}. '
            f'Nashr qilingan: {published_count} ta.'
        )
    export_posts.short_description = 'Tanlanganlarni eksport qilish (statistika)'
