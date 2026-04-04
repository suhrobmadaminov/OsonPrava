"""
User models for OsonPrava project.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta


class Language(models.TextChoices):
    UZ_LATIN = 'UZ_LATIN', 'O\'zbek (Lotin)'
    UZ_CYRILLIC = 'UZ_CYRILLIC', 'O\'zbek (Kirill)'
    RU = 'RU', 'Русский'


class Role(models.TextChoices):
    USER = 'USER', 'Foydalanuvchi'
    PREMIUM = 'PREMIUM', 'Premium'
    BANNED = 'BANNED', 'Banned'
    ADMIN = 'ADMIN', 'Admin'
    SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'


class User(AbstractUser):
    """Custom User model."""
    
    telegram_id = models.BigIntegerField(unique=True, null=True, blank=True, db_index=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, null=True, blank=True)
    email_verification_expires = models.DateTimeField(null=True, blank=True)
    reset_password_token = models.CharField(max_length=255, null=True, blank=True)
    reset_password_expires = models.DateTimeField(null=True, blank=True)
    login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=150, null=True, blank=True)
    last_name = models.CharField(max_length=150, null=True, blank=True)
    avatar_url = models.CharField(max_length=500, null=True, blank=True)
    
    language = models.CharField(
        max_length=20,
        choices=Language.choices,
        default=Language.UZ_LATIN
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER
    )
    
    is_premium = models.BooleanField(default=False)
    premium_expires_at = models.DateTimeField(null=True, blank=True)
    
    streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_active_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Foydalanuvchi'
        verbose_name_plural = 'Foydalanuvchilar'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.username or f"User #{self.id}"
    
    @property
    def is_locked(self):
        if self.locked_until and timezone.now() < self.locked_until:
            return True
        return False
    
    def increment_login_attempts(self):
        self.login_attempts += 1
        if self.login_attempts >= 5:
            self.locked_until = timezone.now() + timedelta(minutes=30)
        self.save(update_fields=['login_attempts', 'locked_until'])
    
    def reset_login_attempts(self):
        self.login_attempts = 0
        self.locked_until = None
        self.last_active_at = timezone.now()
        self.save(update_fields=['login_attempts', 'locked_until', 'last_active_at'])


class RefreshToken(models.Model):
    """Refresh token model."""
    
    token = models.CharField(max_length=500, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refresh_tokens')
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'refresh_tokens'
        verbose_name = 'Refresh Token'
        verbose_name_plural = 'Refresh Tokens'
    
    def __str__(self):
        return f"Token for {self.user.username}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
