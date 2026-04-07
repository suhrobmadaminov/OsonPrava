"""
Enhanced admin for Questions, Topics, and Answers.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Topic, Question, Answer


class AnswerInline(admin.TabularInline):
    """Answer inline for Question admin."""
    model = Answer
    extra = 4
    fields = ('text_uz', 'text_uz_cyr', 'text_ru', 'is_correct', 'order_index')
    min_num = 4
    max_num = 4


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    """Topic admin with enhanced features."""
    
    list_display = (
        'id', 'name_uz', 'name_ru', 'slug', 'questions_count', 
        'order_index', 'is_active', 'created_at'
    )
    list_filter = ('is_active', 'created_at')
    search_fields = ('name_uz', 'name_uz_cyr', 'name_ru', 'slug')
    prepopulated_fields = {'slug': ('name_uz',)}
    readonly_fields = ('created_at', 'questions_count')
    list_editable = ('order_index', 'is_active')
    list_per_page = 100
    date_hierarchy = 'created_at'
    ordering = ('order_index',)
    
    fieldsets = (
        (_('Nomlar'), {
            'fields': ('name_uz', 'name_uz_cyr', 'name_ru', 'slug')
        }),
        (_('Tartib'), {
            'fields': ('order_index', 'questions_count', 'is_active')
        }),
        (_('Sana'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_topics', 'deactivate_topics']
    
    @admin.action(description='Tanlangan mavzularni faollashtirish')
    def activate_topics(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} mavzu faollashtirildi.')
    
    @admin.action(description='Tanlangan mavzularni o\'chirish')
    def deactivate_topics(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} mavzu o\'chirildi.')


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Question admin with inline answers."""
    
    list_display = (
        'id', 'topic', 'difficulty', 'is_active', 'text_short', 
        'answers_count', 'created_at', 'updated_at'
    )
    list_filter = ('difficulty', 'is_active', 'topic', 'created_at')
    search_fields = ('text_uz', 'text_uz_cyr', 'text_ru', 'explanation_uz')
    list_editable = ('difficulty', 'is_active')
    readonly_fields = ('created_at', 'updated_at', 'answers_count')
    inlines = [AnswerInline]
    list_per_page = 50
    date_hierarchy = 'created_at'
    raw_id_fields = ('topic',)
    ordering = ('-id',)
    
    fieldsets = (
        (_('Savol matni'), {
            'fields': ('text_uz', 'text_uz_cyr', 'text_ru')
        }),
        (_('Media'), {
            'fields': ('image_url', 'audio_url_uz', 'audio_url_ru'),
            'classes': ('collapse',)
        }),
        (_('Izoh'), {
            'fields': (
                'explanation_uz', 'explanation_uz_cyr', 'explanation_ru'
            ),
            'classes': ('collapse',)
        }),
        (_('Ma\'lumotlar'), {
            'fields': ('topic', 'difficulty', 'is_active', 'answers_count')
        }),
        (_('Sanalar'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = [
        'activate_questions', 'deactivate_questions', 
        'mark_as_easy', 'mark_as_medium', 'mark_as_hard'
    ]
    
    def text_short(self, obj):
        return f"{obj.text_uz[:50]}..."
    text_short.short_description = _('Savol')
    
    def answers_count(self, obj):
        return obj.answers.count()
    answers_count.short_description = _('Javoblar soni')
    
    @admin.action(description='Tanlangan savollarni faollashtirish')
    def activate_questions(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} savol faollashtirildi.')
    
    @admin.action(description='Tanlangan savollarni o\'chirish')
    def deactivate_questions(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} savol o\'chirildi.')
    
    @admin.action(description='Tanlangan savollarni OSON qilish')
    def mark_as_easy(self, request, queryset):
        updated = queryset.update(difficulty='EASY')
        self.message_user(request, f'{updated} savol OSON belgilandi.')
    
    @admin.action(description='Tanlangan savollarni O\'RTACHA qilish')
    def mark_as_medium(self, request, queryset):
        updated = queryset.update(difficulty='MEDIUM')
        self.message_user(request, f'{updated} savol O\'RTACHA belgilandi.')
    
    @admin.action(description='Tanlangan savollarni QIYIN qilish')
    def mark_as_hard(self, request, queryset):
        updated = queryset.update(difficulty='HARD')
        self.message_user(request, f'{updated} savol QIYIN belgilandi.')


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    """Standalone Answer admin."""
    
    list_display = (
        'id', 'question', 'text_uz', 'is_correct', 'order_index'
    )
    list_filter = ('is_correct', 'question__topic')
    search_fields = ('text_uz', 'text_uz_cyr', 'text_ru')
    list_editable = ('is_correct', 'order_index')
    raw_id_fields = ('question',)
    list_per_page = 100
    ordering = ('question', 'order_index')
    
    actions = ['mark_correct', 'mark_incorrect']
    
    @admin.action(description='Tanlangan javoblarni TO\'G\'RI belgilash')
    def mark_correct(self, request, queryset):
        updated = queryset.update(is_correct=True)
        self.message_user(request, f'{updated} javob TO\'G\'RI belgilandi.')
    
    @admin.action(description='Tanlangan javoblarni NOTO\'G\'RI belgilash')
    def mark_incorrect(self, request, queryset):
        updated = queryset.update(is_correct=False)
        self.message_user(request, f'{updated} javob NOTO\'G\'RI belgilandi.')
