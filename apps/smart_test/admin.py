from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import UserQuestionStat


@admin.register(UserQuestionStat)
class UserQuestionStatAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user_display', 'question_display', 'times_answered',
        'accuracy_percent', 'consecutive_streak', 'ease_factor_badge',
        'interval_display', 'next_review_at', 'is_due', 'last_answered_at'
    )
    list_filter = ('times_answered', 'interval')
    search_fields = ('user__username', 'user__email', 'question__text', 'question__text_uz')
    raw_id_fields = ('user', 'question')
    date_hierarchy = 'next_review_at'
    ordering = ('-last_answered_at',)
    list_per_page = 25
    readonly_fields = (
        'times_answered', 'times_correct', 'consecutive_correct',
        'ease_factor', 'interval', 'next_review_at', 'last_answered_at',
        'accuracy_percent_detail', 'sm2_info'
    )

    fieldsets = (
        ('Asosiy ma\'lumotlar', {
            'fields': ('user', 'question')
        }),
        ('Javob statistikasi', {
            'fields': ('times_answered', 'times_correct', 'consecutive_correct', 'accuracy_percent_detail')
        }),
        ('SM-2 Algoritmi', {
            'fields': ('ease_factor', 'interval', 'next_review_at', 'interval_display', 'sm2_info')
        }),
        ('Tizim', {
            'fields': ('last_answered_at',),
            'classes': ('collapse',)
        }),
    )

    actions = [
        'reset_stats', 'reset_consecutive', 'mark_as_reviewed',
        'export_stats', 'increase_interval', 'decrease_interval'
    ]

    def user_display(self, obj):
        return obj.user.username
    user_display.short_description = 'Foydalanuvchi'
    user_display.admin_order_field = 'user__username'

    def question_display(self, obj):
        max_length = 60
        text = str(obj.question)
        if len(text) > max_length:
            text = text[:max_length] + '...'
        return format_html('<strong>{}</strong>', text)
    question_display.short_description = 'Savol'

    def accuracy_percent(self, obj):
        if obj.times_answered > 0:
            percent = (obj.times_correct / obj.times_answered) * 100
            color = '#28a745' if percent >= 80 else '#ffc107' if percent >= 50 else '#dc3545'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{:.0f}%</span>',
                color, percent
            )
        return format_html('<span style="color: #6c757d;">0%</span>')
    accuracy_percent.short_description = 'Aniqlik'

    def accuracy_percent_detail(self, obj):
        if obj.times_answered > 0:
            percent = (obj.times_correct / obj.times_answered) * 100
            color = '#28a745' if percent >= 80 else '#ffc107' if percent >= 50 else '#dc3545'
            return format_html(
                '<div style="padding: 10px; background: #f5f5f5; border-radius: 4px;">'
                '<strong style="color: {}; font-size: 24px;">{:.1f}%</strong><br>'
                '<span>To\'g\'ri: {} / Jami: {}</span>'
                '</div>',
                color, percent, obj.times_correct, obj.times_answered
            )
        return format_html('<span style="color: #6c757d;">Hali javob berilmagan</span>')
    accuracy_percent_detail.short_description = 'Aniqlik tafsiloti'

    def consecutive_streak(self, obj):
        if obj.consecutive_correct > 0:
            return format_html('<span style="color: #28a745; font-weight: bold;">{} ketma-ket</span>', obj.consecutive_correct)
        return format_html('<span style="color: #dc3545;">0</span>')
    consecutive_streak.short_description = 'Ketma-ket to\'g\'ri'

    def ease_factor_badge(self, obj):
        color = '#28a745' if obj.ease_factor >= 2.5 else '#ffc107' if obj.ease_factor >= 1.5 else '#dc3545'
        return format_html(
            '<span style="color: #fff; background-color: {}; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{:.2f}</span>',
            color, obj.ease_factor
        )
    ease_factor_badge.short_description = 'Osonlik koeffitsienti'
    ease_factor_badge.admin_order_field = 'ease_factor'

    def interval_display(self, obj):
        days = obj.interval
        if days >= 365:
            return f'{days // 365} yil'
        elif days >= 30:
            return f'{days // 30} oy'
        elif days >= 7:
            return f'{days // 7} hafta'
        return f'{days} kun'
    interval_display.short_description = 'Interval'

    def is_due(self, obj):
        if obj.next_review_at:
            if obj.next_review_at <= timezone.now():
                return format_html('<span style="color: #dc3545; font-weight: bold;">Ko\'rib chiqish kerak</span>')
            delta = obj.next_review_at - timezone.now()
            days = delta.days
            if days == 0:
                return format_html('<span style="color: #ffc107; font-weight: bold;">Bugun</span>')
            elif days <= 3:
                return format_html('<span style="color: #ffc107;">{} kundan keyin</span>', days)
            return format_html('<span style="color: #28a745;">{} kundan keyin</span>', days)
        return format_html('<span style="color: #6c757d;">Noma\'lum</span>')
    is_due.short_description = 'Holat'

    def sm2_info(self, obj):
        return format_html(
            '<div style="padding: 10px; background: #f5f5f5; border-radius: 4px; line-height: 1.8;">'
            '<strong>SM-2 Algoritmi parametrlari:</strong><br>'
            'Osonlik koeffitsienti (EF): <code>{}</code><br>'
            'Interval: <code>{}</code> kun<br>'
            'Keyingi ko\'rib chiqish: <code>{}</code><br>'
            '<br>'
            '<em>EF 2.5 dan yuqori = savol oson, 1.5 dan past = savol qiyin</em>'
            '</div>',
            obj.ease_factor, obj.interval, obj.next_review_at.strftime('%Y-%m-%d %H:%M') if obj.next_review_at else '-'
        )
    sm2_info.short_description = 'SM-2 haqida'

    def reset_stats(self, request, queryset):
        updated = queryset.update(
            times_answered=0, times_correct=0, consecutive_correct=0,
            ease_factor=2.5, interval=1, next_review_at=timezone.now()
        )
        self.message_user(request, f'{updated} ta statistika qayta boshlandi.')
    reset_stats.short_description = 'Tanlanganlarning statistikasini qayta boshlash'

    def reset_consecutive(self, request, queryset):
        updated = queryset.update(consecutive_correct=0)
        self.message_user(request, f'{updated} ta ketma-ket to\'g\'ri javoblar nollandi.')
    reset_consecutive.short_description = 'Ketma-ket to\'g\'ri javoblarni nollash'

    def mark_as_reviewed(self, request, queryset):
        updated = queryset.update(next_review_at=timezone.now())
        self.message_user(request, f'{updated} ta savol ko\'rib chiqilgan deb belgilandi.')
    mark_as_reviewed.short_description = 'Tanlanganlarni ko\'rib chiqilgan deb belgilash'

    def export_stats(self, request, queryset):
        total_answered = sum(s.times_answered for s in queryset)
        total_correct = sum(s.times_correct for s in queryset)
        avg_accuracy = (total_correct / total_answered * 100) if total_answered > 0 else 0
        avg_ease = sum(s.ease_factor for s in queryset) / queryset.count() if queryset.count() > 0 else 0
        self.message_user(
            request,
            f'{queryset.count()} ta statistika tanlandi. '
            f'Jami javoblar: {total_answered}, To\'g\'ri: {total_correct}. '
            f'O\'rtacha aniqlik: {avg_accuracy:.1f}%. '
            f'O\'rtacha osonlik: {avg_ease:.2f}'
        )
    export_stats.short_description = 'Tanlanganlarni eksport qilish (statistika)'

    def increase_interval(self, request, queryset):
        for stat in queryset:
            stat.interval = int(stat.interval * 1.5)
            stat.save(update_fields=['interval'])
        self.message_user(request, f'{queryset.count()} ta savol intervali 1.5 barobar oshirildi.')
    increase_interval.short_description = 'Intervalni 1.5 barobar oshirish'

    def decrease_interval(self, request, queryset):
        for stat in queryset:
            stat.interval = max(1, int(stat.interval * 0.5))
            stat.save(update_fields=['interval'])
        self.message_user(request, f'{queryset.count()} ta savol intervali 50% kamaytirildi.')
    decrease_interval.short_description = 'Intervalni 50% kamaytirish'
