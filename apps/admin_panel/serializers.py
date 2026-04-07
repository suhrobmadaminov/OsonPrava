from rest_framework import serializers
from apps.questions.models import Answer


class AdminAnswerSerializer(serializers.ModelSerializer):
    """Serializer for Answer in admin panel."""

    class Meta:
        model = Answer
        fields = ['id', 'text_uz', 'text_uz_cyr', 'text_ru', 'is_correct', 'order_index']
        read_only_fields = ['id']


class AdminAnswerCreateSerializer(serializers.Serializer):
    """Serializer for creating/updating answers nested in Question."""
    text_uz = serializers.CharField(max_length=500, required=True)
    text_uz_cyr = serializers.CharField(max_length=500, required=True)
    text_ru = serializers.CharField(max_length=500, required=True)
    is_correct = serializers.BooleanField(default=False)
    order_index = serializers.IntegerField(default=0)
