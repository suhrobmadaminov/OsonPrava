"""
Notification models.
"""
from django.db import models
from django.conf import settings


class Notification(models.Model):
    """Notification model."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=100)
    title_uz = models.CharField(max_length=500)
    title_ru = models.CharField(max_length=500)
    body_uz = models.TextField()
    body_ru = models.TextField()
    is_read = models.BooleanField(default=False)
    data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Bildirishnoma'
        verbose_name_plural = 'Bildirishnomalar'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'is_read'])]
    
    def __str__(self):
        return f"{self.user.username} - {self.title_uz}"
