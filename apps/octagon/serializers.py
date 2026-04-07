from rest_framework import serializers
from .models import OctagonMatch, OctagonPlayer


class OctagonPlayerSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = OctagonPlayer
        fields = ['id', 'match', 'user', 'user_username', 'score', 'correct_count', 'avg_time_sec', 'is_winner']
        read_only_fields = ['id']


class OctagonMatchSerializer(serializers.ModelSerializer):
    players = OctagonPlayerSerializer(many=True, read_only=True)
    winner_username = serializers.CharField(source='winner.username', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = OctagonMatch
        fields = [
            'id', 'status', 'status_display', 'questions_count', 'question_ids',
            'started_at', 'completed_at', 'winner', 'winner_username',
            'created_at', 'is_active', 'players'
        ]
        read_only_fields = ['id', 'created_at']


class OctagonMatchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OctagonMatch
        fields = ['questions_count', 'question_ids']
