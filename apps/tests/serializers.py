from rest_framework import serializers
from .models import TestSession, TestAnswer


class TestAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestAnswer
        fields = '__all__'


class TestSessionSerializer(serializers.ModelSerializer):
    percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = TestSession
        fields = '__all__'
