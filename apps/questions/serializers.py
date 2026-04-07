from rest_framework import serializers
from .models import Topic, Question, Answer


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    topic_name = serializers.CharField(source='topic.name_uz', read_only=True)
    
    class Meta:
        model = Question
        fields = '__all__'


class TopicSerializer(serializers.ModelSerializer):
    questions_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Topic
        fields = '__all__'
