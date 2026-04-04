"""
UserQuestionStat model (Spaced Repetition - SM-2 Algorithm).
"""
from django.db import models
from django.conf import settings
from apps.questions.models import Question


class UserQuestionStat(models.Model):
    """User question statistics for spaced repetition."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='question_stats')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    times_answered = models.IntegerField(default=0)
    times_correct = models.IntegerField(default=0)
    consecutive_correct = models.IntegerField(default=0)
    ease_factor = models.FloatField(default=2.5)
    interval = models.IntegerField(default=1)
    next_review_at = models.DateTimeField(auto_now_add=True)
    last_answered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_question_stats'
        verbose_name = 'Foydalanuvchi savol statistikasi'
        verbose_name_plural = 'Foydalanuvchi savol statistikalari'
        unique_together = ('user', 'question')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['next_review_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - Question #{self.question.id}"
