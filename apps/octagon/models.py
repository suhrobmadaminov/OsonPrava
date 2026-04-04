"""
Octagon 1v1 Battle models.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone


class OctagonStatus(models.TextChoices):
    WAITING = 'WAITING', 'Kutilmoqda'
    IN_PROGRESS = 'IN_PROGRESS', 'Jarayonda'
    COMPLETED = 'COMPLETED', 'Tugallangan'
    CANCELLED = 'CANCELLED', 'Bekor qilingan'


class OctagonMatch(models.Model):
    """1v1 Battle match."""
    
    status = models.CharField(
        max_length=20,
        choices=OctagonStatus.choices,
        default=OctagonStatus.WAITING
    )
    questions_count = models.IntegerField(default=10)
    question_ids = models.JSONField()  # Array of question IDs
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='won_matches'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'octagon_matches'
        verbose_name = 'Battle match'
        verbose_name_plural = 'Battle matchlar'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Match #{self.id} - {self.get_status_display()}"
    
    @property
    def is_active(self):
        return self.status == OctagonStatus.IN_PROGRESS
    
    def start(self):
        self.status = OctagonStatus.IN_PROGRESS
        self.started_at = timezone.now()
        self.save(update_fields=['status', 'started_at'])
    
    def complete(self, winner=None):
        self.status = OctagonStatus.COMPLETED
        self.completed_at = timezone.now()
        self.winner = winner
        self.save(update_fields=['status', 'completed_at', 'winner'])


class OctagonPlayer(models.Model):
    """Player in a match."""
    
    match = models.ForeignKey(OctagonMatch, on_delete=models.CASCADE, related_name='players')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)
    avg_time_sec = models.FloatField(null=True, blank=True)
    is_winner = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'octagon_players'
        verbose_name = 'Battle o\'yinchi'
        verbose_name_plural = 'Battle o\'yinchilar'
        unique_together = ('match', 'user')
    
    def __str__(self):
        return f"{self.user.username} in Match #{self.match.id}"
