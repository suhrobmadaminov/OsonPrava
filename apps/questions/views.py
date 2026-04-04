from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Topic, Question, Answer
from .serializers import TopicSerializer, QuestionSerializer, AnswerSerializer


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.filter(is_active=True)
    serializer_class = TopicSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['order_index', 'created_at']
    ordering = ['order_index']
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.filter(is_active=True).prefetch_related('answers')
    serializer_class = QuestionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['topic', 'difficulty', 'is_active']
    search_fields = ['text_uz', 'text_ru']
    ordering_fields = ['created_at', 'difficulty']
    ordering = ['id']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.select_related('question')
    serializer_class = AnswerSerializer
    filterset_fields = ['question', 'is_correct']
    
    def get_permissions(self):
        return [permissions.IsAdminUser()]
