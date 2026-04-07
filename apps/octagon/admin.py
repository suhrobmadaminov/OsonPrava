from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import OctagonMatch, OctagonPlayer


class OctagonPlayerInline(admin.TabularInline):
    model = OctagonPlayer
    raw_id_fields = ('user',)
    extra = 0
    readonly_fields = ('score_display', 'correct_count', 'avg_time_display', 'is_winner')
    fields = ('user', 'score_display', 'correct_count', 'avg_time_display', 'is_winner')

    def score_display(self, obj):
        return obj.score
    score_display.short_description = 'Ball'

    def avg_time_display(self, obj):
        if obj.avg_time_sec:
            return f"{obj.avg_time_sec:.1f} soniya"
        return '-'
    avg_time_display.short_description = "O'rtacha vaqt"


@admin.register(OctagonMatch)
class OctagonMatchAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'status_badge', 'status', 'questions_count', 'players_count',
        'winner_display', 'started_at', 'completed_at', 'duration_display', 'created_at'
    )
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'winner__username', 'winner__email')
    raw_id_fields = ('winner',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    list_editable = ('status',)
    inlines = [OctagonPlayerInline]
    readonly_fields = ('created_at', 'started_at', 'completed_at', 'duration_display', 'question_ids_display')
    list_per_page = 25

    fieldsets = (
        ('Asosiy ma\'lumotlar', {
            'fields': ('status', 'questions_count', 'question_ids_display')
        }),
        ('Natijalar', {
            'fields': ('winner', 'started_at', 'completed_at', 'duration_display')
        }),
        ('Tizim', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    actions = ['make_completed', 'make_cancelled', 'make_in_progress']

    def status_badge(self, obj):
        colors = {
            'WAITING': '#ffc107',
            'IN_PROGRESS': '#17a2b8',
            'COMPLETED': '#28a745',
            'CANCELLED': '#dc3545',
        }
        color = colors.get(obj.status, '#6c757d')
        labels = dict(OctagonMatch._meta.get_field('status').choices)
        return format_html(
            '<span style="color: #fff; background-color: {}; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            color, labels.get(obj.status, obj.status)
        )
    status_badge.short_description = 'Holat'

    def winner_display(self, obj):
        return obj.winner.username if obj.winner else '-'
    winner_display.short_description = "G'olib"
    winner_display.admin_order_field = 'winner__username'

    def players_count(self, obj):
        return obj.players.count()
    players_count.short_description = 'O\'yinchilar'

    def duration_display(self, obj):
        if obj.started_at and obj.completed_at:
            delta = obj.completed_at - obj.started_at
            total_seconds = int(delta.total_seconds())
            minutes = total_seconds // 60
            seconds = total_seconds % 60
            return f"{minutes} daqiqa {seconds} soniya"
        return '-'
    duration_display.short_description = 'Davomiyligi'

    def question_ids_display(self, obj):
        if obj.question_ids:
            count = len(obj.question_ids)
            return format_html('<strong>{}</strong> ta savol mavjud', count)
        return 'Savollar hali tanlanmagan'
    question_ids_display.short_description = 'Savollar ro\'yxati'

    def make_completed(self, request, queryset):
        updated = queryset.update(status='COMPLETED', completed_at=timezone.now())
        self.message_user(request, f'{updated} ta match "Tugallangan" holatiga o\'tkazildi.')
    make_completed.short_description = 'Tanlanganlarni tugallangan deb belgilash'

    def make_cancelled(self, request, queryset):
        updated = queryset.update(status='CANCELLED', completed_at=timezone.now())
        self.message_user(request, f'{updated} ta match "Bekor qilingan" holatiga o\'tkazildi.')
    make_cancelled.short_description = 'Tanlanganlarni bekor qilingan deb belgilash'

    def make_in_progress(self, request, queryset):
        updated = queryset.update(status='IN_PROGRESS', started_at=timezone.now())
        self.message_user(request, f'{updated} ta match "Jarayonda" holatiga o\'tkazildi.')
    make_in_progress.short_description = 'Tanlanganlarni jarayonda deb belgilash'


@admin.register(OctagonPlayer)
class OctagonPlayerAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'match_link', 'user_display', 'score', 'correct_count',
        'avg_time_display', 'accuracy_percent', 'is_winner_badge'
    )
    list_filter = ('is_winner', 'match__status')
    search_fields = ('user__username', 'user__email', 'match__id')
    raw_id_fields = ('user', 'match')
    ordering = ('-score',)
    list_per_page = 25
    readonly_fields = ('score', 'correct_count', 'avg_time_sec', 'is_winner')

    fieldsets = (
        ('O\'yinchi ma\'lumotlari', {
            'fields': ('match', 'user')
        }),
        ('Natijalar', {
            'fields': ('score', 'correct_count', 'avg_time_sec', 'is_winner')
        }),
    )

    actions = ['set_winner', 'unset_winner']

    def match_link(self, obj):
        return format_html('<a href="?match__id__exact={}">Match #{}</a>', obj.match.id, obj.match.id)
    match_link.short_description = 'Match'

    def user_display(self, obj):
        return obj.user.username
    user_display.short_description = 'Foydalanuvchi'
    user_display.admin_order_field = 'user__username'

    def avg_time_display(self, obj):
        if obj.avg_time_sec:
            return f"{obj.avg_time_sec:.1f}s"
        return '-'
    avg_time_display.short_description = "O'rtacha vaqt"

    def accuracy_percent(self, obj):
        if obj.match.questions_count and obj.match.questions_count > 0:
            percent = (obj.correct_count / obj.match.questions_count) * 100
            color = '#28a745' if percent >= 70 else '#ffc107' if percent >= 40 else '#dc3545'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{:.0f}%</span>',
                color, percent
            )
        return '-'
    accuracy_percent.short_description = 'Aniqlik'

    def is_winner_badge(self, obj):
        if obj.is_winner:
            return format_html('<span style="color: #28a745; font-weight: bold;">✓ G\'olib</span>')
        return format_html('<span style="color: #6c757d;">✗</span>')
    is_winner_badge.short_description = 'Natija'

    def set_winner(self, request, queryset):
        if queryset.count() == 1:
            player = queryset.first()
            player.is_winner = True
            player.save(update_fields=['is_winner'])
            if player.match:
                player.match.winner = player.user
                player.match.save(update_fields=['winner'])
            self.message_user(request, f'{player.user.username} g\'olib deb belgilandi.')
        else:
            self.message_user(request, 'Faqat bitta o\'yinchini g\'olib deb belgilash mumkin.', level='warning')
    set_winner.short_description = 'Tanlangan o\'yinchini g\'olib deb belgilash'

    def unset_winner(self, request, queryset):
        updated = queryset.update(is_winner=False)
        self.message_user(request, f'{updated} ta o\'yinchi g\'oliblikdan chetlatildi.')
    unset_winner.short_description = 'Tanlanganlarni g\'oliblikdan chetlatish'
