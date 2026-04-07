"""
Enhanced admin for Test Sessions and Answers.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import TestSession, TestAnswer


class TestAnswerInline(admin.TabularInline):
    """Test answers inline."""
    model = TestAnswer
    extra = 0
    raw_id_fields = ('question', 'selected_answer')
    readonly_fields = ('answered_at', 'is_correct')
    fields = ('question', 'selected_answer', 'is_correct', 'time_spent_sec', 'answered_at')
    ordering = ('answered_at',)
    max_num = 0
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(TestSession)
class TestSessionAdmin(admin.ModelAdmin):
    """Test Session admin with statistics and inline answers."""
    
    list_display = (
        'id', 'user', 'type', 'total_questions', 'correct_answers',
        'wrong_answers', 'score_display', 'is_passed', 'started_at',
        'completed_at', 'time_spent_display'
    )
    list_filter = ('type', 'is_passed', 'started_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = (
        'started_at', 'completed_at', 'percentage', 'time_spent_display'
    )
    raw_id_fields = ('user', 'ticket', 'topic')
    inlines = [TestAnswerInline]
    list_per_page = 50
    date_hierarchy = 'started_at'
    ordering = ('-started_at',)
    
    fieldsets = (
        (_('Foydalanuvchi'), {
            'fields': ('user',)
        }),
        (_('Test turi'), {
            'fields': ('type', 'ticket', 'topic')
        }),
        (_('Natijalar'), {
            'fields': (
                'total_questions', 'correct_answers', 'wrong_answers',
                'skipped_answers', 'score', 'percentage', 'is_passed'
            )
        }),
        (_('Vaqt'), {
            'fields': ('started_at', 'completed_at', 'time_spent_sec'),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'mark_as_passed', 'mark_as_failed', 'export_selected_sessions'
    ]
    
    def score_display(self, obj):
        return f"{obj.score:.1f}%"
    score_display.short_description = _('Ball')
    score_display.admin_order_field = 'score'
    
    def percentage(self, obj):
        return f"{obj.percentage:.1f}%"
    percentage.short_description = _('Foiz')
    
    def time_spent_display(self, obj):
        if obj.time_spent_sec:
            minutes = obj.time_spent_sec // 60
            seconds = obj.time_spent_sec % 60
            return f"{minutes}m {seconds}s"
        return '-'
    time_spent_display.short_description = _('Sarflangan vaqt')
    
    @admin.action(description='Tanlangan testlarni TOPSHIRILGAN belgilash')
    def mark_as_passed(self, request, queryset):
        updated = queryset.update(is_passed=True)
        self.message_user(request, f'{updated} test TOPSHIRILGAN belgilandi.')
    
    @admin.action(description='Tanlangan testlarni TOPSHIRILMAGAN belgilash')
    def mark_as_failed(self, request, queryset):
        updated = queryset.update(is_passed=False)
        self.message_user(request, f'{updated} test TOPSHIRILMAGAN belgilandi.')
    
    @admin.action(description='Tanlangan testlarni eksport qilish')
    def export_selected_sessions(self, request, queryset):
        # CSV export funksiyasi
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="test_sessions.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'User', 'Type', 'Total', 'Correct', 'Score', 'Passed'])
        
        for session in queryset:
            writer.writerow([
                session.id, session.user.username, session.type,
                session.total_questions, session.correct_answers,
                f"{session.score:.1f}%", session.is_passed
            ])
        
        return response


@admin.register(TestAnswer)
class TestAnswerAdmin(admin.ModelAdmin):
    """Test Answer admin."""
    
    list_display = (
        'id', 'test_session', 'question', 'is_correct',
        'time_spent_sec', 'answered_at'
    )
    list_filter = ('is_correct', 'test_session__type')
    search_fields = ('question__text_uz', 'test_session__user__username')
    raw_id_fields = ('test_session', 'question', 'selected_answer')
    readonly_fields = ('answered_at',)
    list_per_page = 100
    date_hierarchy = 'answered_at'
    ordering = ('-answered_at',)
