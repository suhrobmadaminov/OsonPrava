from rest_framework import serializers
from .models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    plan_display = serializers.CharField(source='get_plan_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_provider_display = serializers.CharField(source='get_payment_provider_display', read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id', 'user', 'user_username', 'plan', 'plan_display',
            'status', 'status_display', 'starts_at', 'expires_at',
            'payment_provider', 'payment_provider_display', 'payment_id',
            'amount', 'currency', 'created_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at']


class SubscriptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['user', 'plan', 'starts_at', 'expires_at', 'payment_provider', 'payment_id', 'amount', 'currency']


class SubscriptionPlanSerializer(serializers.Serializer):
    """Serializer for plan information."""
    plan = serializers.CharField()
    plan_display = serializers.CharField()
    price = serializers.IntegerField()
    duration_days = serializers.IntegerField()
    currency = serializers.CharField(default='UZS')


class CreateSubscriptionSerializer(serializers.Serializer):
    """Serializer for creating a subscription."""
    plan = serializers.ChoiceField(choices=[
        ('MONTHLY', 'MONTHLY'),
        ('QUARTERLY', 'QUARTERLY'),
        ('YEARLY', 'YEARLY'),
        ('LIFETIME', 'LIFETIME'),
    ])
    payment_provider = serializers.ChoiceField(choices=[
        ('CLICK', 'CLICK'),
        ('PAYME', 'PAYME'),
        ('UZUM', 'UZUM'),
        ('TELEGRAM_STARS', 'TELEGRAM_STARS'),
        ('MANUAL', 'MANUAL'),
    ])


class ClickCallbackSerializer(serializers.Serializer):
    """Serializer for Click payment callback."""
    transaction_id = serializers.CharField()
    user_id = serializers.IntegerField(required=False)
    amount = serializers.IntegerField()
    status = serializers.CharField()


class PaymeCallbackSerializer(serializers.Serializer):
    """Base serializer for Payme callback requests."""
    id = serializers.CharField()
    method = serializers.CharField()
    params = serializers.DictField()


class TelegramStarsSerializer(serializers.Serializer):
    """Serializer for Telegram Stars payment."""
    plan = serializers.ChoiceField(choices=[
        ('MONTHLY', 'MONTHLY'),
        ('QUARTERLY', 'QUARTERLY'),
        ('YEARLY', 'YEARLY'),
        ('LIFETIME', 'LIFETIME'),
    ])
    telegram_payment_charge_id = serializers.CharField(required=False)
