from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
import random as random_module
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
        if self.action in ['list', 'retrieve', 'random', 'search']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Redis caching for individual questions
        cache_key = f'question:{instance.id}'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        serializer = self.get_serializer(instance)
        # Cache for 1 hour
        cache.set(cache_key, serializer.data, timeout=3600)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def random(self, request):
        """Get random questions (default: 1)"""
        try:
            limit = int(request.query_params.get('limit', 1))
        except (ValueError, TypeError):
            limit = 1
        
        limit = min(limit, 50)  # Max 50 random questions
        
        # Use random offset or order by '?' for true randomness
        queryset = self.filter_queryset(self.get_queryset())
        count = queryset.count()
        
        if count == 0:
            return Response([])
        
        if count <= limit:
            # If less than limit, return all
            queryset = queryset[:count]
        else:
            # Random selection using offset
            offset = random_module.randint(0, max(0, count - limit))
            queryset = queryset[offset:offset + limit]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Full-text search across questions"""
        query = request.query_params.get('q', '')
        
        if not query:
            return Response([])
        
        # Search in all language fields
        queryset = self.get_queryset().filter(
            text_uz__icontains=query
        ) | self.get_queryset().filter(
            text_ru__icontains=query
        ) | self.get_queryset().filter(
            text_uz_cyr__icontains=query
        )
        
        # Limit results
        queryset = queryset[:50]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.select_related('question')
    serializer_class = AnswerSerializer
    filterset_fields = ['question', 'is_correct']
    
    def get_permissions(self):
        return [permissions.IsAdminUser()]
