"""
Ticket models.
"""
from django.db import models
from apps.questions.models import Question


class Ticket(models.Model):
    """Ticket model."""
    
    number = models.IntegerField(unique=True)
    name_uz = models.CharField(max_length=255)
    name_uz_cyr = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255)
    questions_count = models.IntegerField(default=20)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'tickets'
        verbose_name = 'Chipta'
        verbose_name_plural = 'Chiptalar'
        ordering = ['number']
    
    def __str__(self):
        return f"Chipta #{self.number}"


class TicketQuestion(models.Model):
    """Ticket-Question relationship."""
    
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='ticket_questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    order_index = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'ticket_questions'
        verbose_name = 'Chipta savoli'
        verbose_name_plural = 'Chipta savollari'
        unique_together = ('ticket', 'question')
        ordering = ['order_index']
    
    def __str__(self):
        return f"Ticket #{self.ticket.number} - Question #{self.question.id}"
