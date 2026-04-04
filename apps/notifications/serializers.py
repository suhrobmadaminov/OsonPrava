from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'user_username', 'type',
            'title_uz', 'title_ru', 'body_uz', 'body_ru',
            'is_read', 'data', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['user', 'type', 'title_uz', 'title_ru', 'body_uz', 'body_ru', 'data']
