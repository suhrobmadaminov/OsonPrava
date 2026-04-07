from django.contrib import admin
from django.utils.html import format_html
from .models import Achievement, UserAchievement


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'key_display', 'name_short', 'points_badge',
        'condition_preview', 'icon_preview', 'user_count', 'created_at'
    )
    search_fields = ('key', 'name_uz', 'name_uz_cyr', 'name_ru', 'desc_uz')
    ordering = ('-points', '-created_at')
    readonly_fields = ('created_at', 'description_preview', 'condition_detail', 'icon_preview_detail')
    list_per_page = 25

    fieldsets = (
        ('Asosiy ma\'lumotlar', {
            'fields': ('key', 'name_uz', 'name_uz_cyr', 'name_ru', 'points')
        }),
        ('Tavsif', {
            'fields': ('desc_uz', 'desc_uz_cyr', 'desc_ru', 'description_preview')
        }),
        ('Shartlar', {
            'fields': ('condition', 'condition_detail')
        }),
        ('Rasm va tizim', {
            'fields': ('icon_url', 'icon_preview_detail', 'created_at'),
            'classes': ('collapse',)
        }),
    )

    actions = [
        'export_achievements', 'verify_achievements'
    ]

    def key_display(self, obj):
        return format_html('<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">{}</code>', obj.key)
    key_display.short_description = 'Kalit so\'z'
    key_display.admin_order_field = 'key'

    def name_short(self, obj):
        max_length = 40
        name = obj.name_uz
        if len(name) > max_length:
            name = name[:max_length] + '...'
        return format_html('<strong>{}</strong>', name)
    name_short.short_description = 'Nomi'
    name_short.admin_order_field = 'name_uz'

    def points_badge(self, obj):
        color = '#28a745' if obj.points >= 50 else '#ffc107' if obj.points >= 20 else '#6c757d'
        return format_html(
            '<span style="color: #fff; background-color: {}; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{} ball</span>',
            color, obj.points
        )
    points_badge.short_description = 'Ball'
    points_badge.admin_order_field = 'points'

    def condition_preview(self, obj):
        import json
        try:
            cond = obj.condition if isinstance(obj.condition, dict) else json.loads(obj.condition)
            preview = json.dumps(cond, ensure_ascii=False)[:100]
            if len(str(cond)) > 100:
                preview += '...'
            return format_html('<code style="font-size: 12px;">{}</code>', preview)
        except Exception:
            return format_html('<span style="color: #dc3545;">Noto\'g\'ri format</span>')
    condition_preview.short_description = 'Shartlar'

    def icon_preview(self, obj):
        if obj.icon_url:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px; border: 1px solid #ddd;" />',
                obj.icon_url
            )
        return format_html('<span style="color: #6c757d;">Yo\'q</span>')
    icon_preview.short_description = 'Ikonka'

    def user_count(self, obj):
        count = obj.userachievement_set.count()
        color = '#28a745' if count > 10 else '#ffc107' if count > 0 else '#6c757d'
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, count)
    user_count.short_description = 'Egalangan'

    def description_preview(self, obj):
        max_length = 500
        desc = obj.desc_uz
        if len(desc) > max_length:
            desc = desc[:max_length] + '...'
        return format_html(
            '<div style="max-height: 200px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px; line-height: 1.6;">{}</div>',
            desc
        )
    description_preview.short_description = 'Tavsif ko\'rinishi'

    def condition_detail(self, obj):
        import json
        try:
            cond = obj.condition if isinstance(obj.condition, dict) else json.loads(obj.condition)
            formatted = json.dumps(cond, indent=2, ensure_ascii=False)
            return format_html(
                '<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 300px; overflow-y: auto; font-size: 12px;">{}</pre>',
                formatted
            )
        except Exception:
            return format_html('<span style="color: #dc3545;">Noto\'g\'ri JSON format</span>')
    condition_detail.short_description = 'Shartlar tafsiloti'

    def icon_preview_detail(self, obj):
        if obj.icon_url:
            return format_html(
                '<div style="max-width: 200px;"><img src="{}" style="width: 100%; border-radius: 4px; border: 1px solid #ddd;" /><br><small>{}</small></div>',
                obj.icon_url, obj.icon_url
            )
        return format_html('<span style="color: #6c757d;">Ikonka mavjud emas</span>')
    icon_preview_detail.short_description = 'Ikonka ko\'rinishi'

    def export_achievements(self, request, queryset):
        total_points = sum(a.points for a in queryset)
        self.message_user(
            request,
            f'{queryset.count()} ta yutuq tanlandi. '
            f'Jami ball: {total_points}. '
            f'O\'rtacha ball: {total_points / queryset.count():.1f}'
        )
    export_achievements.short_description = 'Tanlanganlarni eksport qilish (statistika)'

    def verify_achievements(self, request, queryset):
        issues = []
        for a in queryset:
            missing = []
            if not a.name_uz_cyr:
                missing.append('name_uz_cyr')
            if not a.name_ru:
                missing.append('name_ru')
            if not a.desc_uz_cyr:
                missing.append('desc_uz_cyr')
            if not a.desc_ru:
                missing.append('desc_ru')
            if not a.icon_url:
                missing.append('icon_url')
            if missing:
                issues.append(f'{a.key} ({", ".join(missing)})')
        if issues:
            self.message_user(
                request,
                f'{len(issues)} ta yutuqda ma\'lumot yetishmayapti: {"; ".join(issues[:10])}',
                level='warning'
            )
        else:
            self.message_user(request, 'Barcha tanlangan yutuqlarda ma\'lumotlar to\'liq.')
    verify_achievements.short_description = 'Tanlanganlarning ma\'lumotlarini tekshirish'


class UserAchievementInline(admin.TabularInline):
    model = UserAchievement
    raw_id_fields = ('user', 'achievement')
    extra = 0
    readonly_fields = ('unlocked_at',)


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user_display', 'achievement_display',
        'achievement_points', 'unlocked_at', 'time_ago'
    )
    list_filter = ('achievement', 'unlocked_at')
    search_fields = ('user__username', 'user__email', 'achievement__name_uz', 'achievement__key')
    raw_id_fields = ('user', 'achievement')
    date_hierarchy = 'unlocked_at'
    ordering = ('-unlocked_at',)
    readonly_fields = ('unlocked_at',)
    list_per_page = 25

    fieldsets = (
        ('Foydalanuvchi va yutuq', {
            'fields': ('user', 'achievement')
        }),
        ('Tizim', {
            'fields': ('unlocked_at',),
            'classes': ('collapse',)
        }),
    )

    actions = [
        'export_user_achievements', 'remove_user_achievements'
    ]

    def user_display(self, obj):
        return obj.user.username
    user_display.short_description = 'Foydalanuvchi'
    user_display.admin_order_field = 'user__username'

    def achievement_display(self, obj):
        max_length = 50
        name = obj.achievement.name_uz
        if len(name) > max_length:
            name = name[:max_length] + '...'
        return format_html('<strong>{}</strong>', name)
    achievement_display.short_description = 'Yutuq'
    achievement_display.admin_order_field = 'achievement__name_uz'

    def achievement_points(self, obj):
        points = obj.achievement.points
        color = '#28a745' if points >= 50 else '#ffc107' if points >= 20 else '#6c757d'
        return format_html(
            '<span style="color: {}; font-weight: bold;">+{}</span>',
            color, points
        )
    achievement_points.short_description = 'Ball'
    achievement_points.admin_order_field = 'achievement__points'

    def time_ago(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.unlocked_at
        total_seconds = int(delta.total_seconds())
        if total_seconds < 3600:
            return f'{total_seconds // 60} daqiqa oldin'
        elif total_seconds < 86400:
            return f'{total_seconds // 3600} soat oldin'
        else:
            return f'{total_seconds // 86400} kun oldin'
    time_ago.short_description = 'Qachon'

    def export_user_achievements(self, request, queryset):
        total_points = sum(qa.achievement.points for qa in queryset)
        users = {}
        for qa in queryset:
            users[qa.user.username] = users.get(qa.user.username, 0) + 1
        user_summary = ', '.join(f'{v} ta {k}' for k, v in list(users.items())[:10])
        self.message_user(
            request,
            f'{queryset.count()} ta yutuq tanlandi. '
            f'Jami ball: {total_points}. '
            f'Foydalanuvchilar: {user_summary}'
        )
    export_user_achievements.short_description = 'Tanlanganlarni eksport qilish (statistika)'

    def remove_user_achievements(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'{count} ta foydalanuvchi yutug\'i o\'chirildi.')
    remove_user_achievements.short_description = "Tanlangan yutuqlarni o'chirish"
