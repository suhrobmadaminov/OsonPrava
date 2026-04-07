"""
Auth Models (if needed beyond User model)
"""
from django.db import models
from django.conf import settings
from django.utils import timezone


class RefreshToken(models.Model):
    """
    Refresh Token model
    """
    id = models.AutoField(primary_key=True)
    token = models.CharField(max_length=255, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='refresh_tokens',
        db_column='user_id'
    )
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'refresh_tokens'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['user', 'expires_at']),
        ]
    
    def is_expired(self):
        return timezone.now() > self.expires_at
