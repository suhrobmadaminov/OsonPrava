"""
Enhanced admin for Tickets and TicketQuestions.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Ticket, TicketQuestion


class TicketQuestionInline(admin.TabularInline):
    """Ticket questions inline."""
    model = TicketQuestion
    extra = 20
    fields = ('question', 'order_index')
    raw_id_fields = ('question',)
    ordering = ('order_index',)


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    """Ticket admin with inline questions."""
    
    list_display = (
        'id', 'number', 'name_uz', 'name_ru', 'questions_count',
        'is_active', 'created_at'
    )
    list_filter = ('is_active', 'created_at')
    search_fields = ('name_uz', 'name_uz_cyr', 'name_ru', 'number')
    readonly_fields = ('created_at',)
    list_editable = ('is_active',)
    inlines = [TicketQuestionInline]
    list_per_page = 50
    date_hierarchy = 'created_at'
    ordering = ('number',)
    
    fieldsets = (
        (_('Asosiy'), {
            'fields': ('number', 'name_uz', 'name_uz_cyr', 'name_ru')
        }),
        (_('Sozlamalar'), {
            'fields': ('questions_count', 'is_active')
        }),
        (_('Sana'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_tickets', 'deactivate_tickets']
    
    @admin.action(description='Tanlangan chiptalarni faollashtirish')
    def activate_tickets(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} chipta faollashtirildi.')
    
    @admin.action(description='Tanlangan chiptalarni o\'chirish')
    def deactivate_tickets(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} chipta o\'chirildi.')


@admin.register(TicketQuestion)
class TicketQuestionAdmin(admin.ModelAdmin):
    """Standalone TicketQuestion admin."""
    
    list_display = ('id', 'ticket', 'question', 'order_index')
    list_filter = ('ticket', 'question__topic')
    search_fields = ('ticket__name_uz', 'question__text_uz')
    raw_id_fields = ('question',)
    list_per_page = 100
    ordering = ('ticket', 'order_index')
    list_editable = ('order_index',)
