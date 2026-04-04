"""
Subscription models.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone


class SubscriptionPlan(models.TextChoices):
    MONTHLY = 'MONTHLY', 'Oylik'
    QUARTERLY = 'QUARTERLY', 'Choraklik'
    YEARLY = 'YEARLY', 'Yillik'
    LIFETIME = 'LIFETIME', 'Umrbod'


class SubStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Faol'
    EXPIRED = 'EXPIRED', 'Tugagan'
    CANCELLED = 'CANCELLED', 'Bekor qilingan'


class PaymentProvider(models.TextChoices):
    CLICK = 'CLICK', 'Click'
    PAYME = 'PAYME', 'Payme'
    UZUM = 'UZUM', 'Uzum'
    TELEGRAM_STARS = 'TELEGRAM_STARS', 'Telegram Stars'
    MANUAL = 'MANUAL', 'Qo\'lda'


class Subscription(models.Model):
    """Subscription model."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.CharField(max_length=20, choices=SubscriptionPlan.choices)
    status = models.CharField(max_length=20, choices=SubStatus.choices, default=SubStatus.ACTIVE)
    starts_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    payment_provider = models.CharField(max_length=30, choices=PaymentProvider.choices)
    payment_id = models.CharField(max_length=255, null=True, blank=True)
    amount = models.IntegerField()
    currency = models.CharField(max_length=10, default='UZS')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'subscriptions'
        verbose_name = 'Obuna'
        verbose_name_plural = 'Obunalar'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_plan_display()}"
    
    @property
    def is_active(self):
        return self.status == SubStatus.ACTIVE and timezone.now() < self.expires_at
