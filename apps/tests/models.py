"""
Test session models.
"""
from django.db import models
from django.conf import settings
from apps.questions.models import Question
from apps.tickets.models import Ticket
from apps.questions.models import Topic


class TestType(models.TextChoices):
    TICKET = 'TICKET', 'Chipta'
    TOPIC = 'TOPIC', 'Mavzu'
    EXAM = 'EXAM', 'Imtihon'
    MARATHON = 'MARATHON', 'Marafon'
    SMART = 'SMART', 'Aqlli test'
    MISTAKES = 'MISTAKES', 'Xatolar'


class TestSession(models.Model):
    """Test session model."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='test_sessions')
    type = models.CharField(max_length=20, choices=TestType.choices)
    ticket = models.ForeignKey(Ticket, on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True)
    total_questions = models.IntegerField()
    correct_answers = models.IntegerField(default=0)
    wrong_answers = models.IntegerField(default=0)
    skipped_answers = models.IntegerField(default=0)
    score = models.FloatField(default=0)
    is_passed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_spent_sec = models.IntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'test_sessions'
        verbose_name = 'Test sessiya'
        verbose_name_plural = 'Test sessiyalar'
        ordering = ['-started_at']
        indexes = [models.Index(fields=['user'])]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_type_display()} #{self.id}"
    
    @property
    def percentage(self):
        if self.total_questions == 0:
            return 0
        return (self.correct_answers / self.total_questions) * 100


class TestAnswer(models.Model):
    """Test answer model."""
    
    test_session = models.ForeignKey(TestSession, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.ForeignKey('questions.Answer', on_delete=models.SET_NULL, null=True, blank=True)
    is_correct = models.BooleanField(null=True, blank=True)
    time_spent_sec = models.IntegerField(null=True, blank=True)
    answered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'test_answers'
        verbose_name = 'Test javobi'
        verbose_name_plural = 'Test javoblari'
    
    def __str__(self):
        return f"Session #{self.test_session.id} - Question #{self.question.id}"
