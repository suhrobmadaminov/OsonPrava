from rest_framework import serializers
from .models import UserQuestionStat


class UserQuestionStatSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    question_text = serializers.CharField(source='question.text', read_only=True)
    accuracy_rate = serializers.SerializerMethodField()

    class Meta:
        model = UserQuestionStat
        fields = [
            'id', 'user', 'user_username', 'question', 'question_text',
            'times_answered', 'times_correct', 'consecutive_correct',
            'ease_factor', 'interval', 'next_review_at', 'last_answered_at',
            'accuracy_rate'
        ]
        read_only_fields = ['id', 'last_answered_at']

    def get_accuracy_rate(self, obj):
        if obj.times_answered > 0:
            return round((obj.times_correct / obj.times_answered) * 100, 2)
        return 0.0


class UserQuestionStatCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuestionStat
        fields = [
            'user', 'question', 'times_answered', 'times_correct',
            'consecutive_correct', 'ease_factor', 'interval', 'next_review_at'
        ]
