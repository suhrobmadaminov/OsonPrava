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
