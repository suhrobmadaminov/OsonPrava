"""
Achievement models.
"""
from django.db import models
from django.conf import settings


class Achievement(models.Model):
    """Achievement model."""
    
    key = models.CharField(max_length=100, unique=True)
    name_uz = models.CharField(max_length=255)
    name_uz_cyr = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255)
    desc_uz = models.TextField()
    desc_uz_cyr = models.TextField()
    desc_ru = models.TextField()
    icon_url = models.CharField(max_length=500, null=True, blank=True)
    condition = models.JSONField()  # JSON condition for unlocking
    points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'achievements'
        verbose_name = 'Yutuq'
        verbose_name_plural = 'Yutuqlar'
    
    def __str__(self):
        return self.name_uz


class UserAchievement(models.Model):
    """User-Achievement relationship."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_achievements'
        verbose_name = 'Foydalanuvchi yutug\'i'
        verbose_name_plural = 'Foydalanuvchi yutuqlari'
        unique_together = ('user', 'achievement')
    
    def __str__(self):
        return f"{self.user.username} - {self.achievement.name_uz}"
