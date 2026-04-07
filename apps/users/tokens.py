"""
Refresh Token Model
NestJS'dagi kabi opaque random token'lar uchun
"""
from django.db import models
from django.conf import settings
from django.utils import timezone


class RefreshTokenManager(models.Manager):
    """Refresh token manager"""
    
    def create_token(self, user, token, expires_at):
        """Create a new refresh token"""
        return self.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
    
    def is_valid(self, token):
        """Check if token exists and is not expired"""
        try:
            token_obj = self.get(token=token)
            if token_obj.expires_at < timezone.now():
                return None
            return token_obj
        except self.model.DoesNotExist:
            return None


class RefreshToken(models.Model):
    """
    Refresh Token model
    Equivalent to Prisma RefreshToken model
    Opaque random tokens (not JWT)
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
    
    objects = RefreshTokenManager()
    
    class Meta:
        db_table = 'refresh_tokens'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['user', 'expires_at']),
        ]
    
    def __str__(self):
        return f"RefreshToken for {self.user} (expires: {self.expires_at})"
    
    def is_expired(self):
        """Check if token is expired"""
        return timezone.now() > self.expires_at
