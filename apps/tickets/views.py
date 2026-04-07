from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from django.db.models import Avg
from .models import Ticket, TicketQuestion
from .serializers import TicketSerializer, TicketQuestionSerializer
from apps.tests.models import TestSession


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.filter(is_active=True)
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_active']
    ordering_fields = ['number', 'created_at']
    ordering = ['number']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def list(self, request, *args, **kwargs):
        """Get all tickets with optional user progress"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # If user is authenticated, add progress data
        user = request.user if request.user.is_authenticated else None
        
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        
        if user:
            # Get all test sessions for this user
            user_sessions = TestSession.objects.filter(
                user=user,
                type='TICKET',
                ticket__isnull=False
            ).values('ticket_id').annotate(
                best_score=Avg('score')
            )
            
            sessions_dict = {s['ticket_id']: s['best_score'] for s in user_sessions}
            
            # Add progress to each ticket
            for ticket_data in data:
                ticket_id = ticket_data['id']
                ticket_data['progress'] = {
                    'lastAttempt': None,
                    'bestScore': sessions_dict.get(ticket_id),
                    'isPassed': sessions_dict.get(ticket_id, 0) >= 90 if sessions_dict.get(ticket_id) else False
                }
        
        return Response(data)

    def retrieve(self, request, *args, **kwargs):
        """Get single ticket with all questions (with caching)"""
        instance = self.get_object()
        
        # Redis caching for ticket questions
        cache_key = f'ticket:{instance.id}:questions'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Get ticket with all questions
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Get ticket questions
        ticket_questions = TicketQuestion.objects.filter(
            ticket=instance
        ).select_related('question').prefetch_related(
            'question__answers'
        ).order_by('order_index')
        
        from apps.questions.serializers import QuestionSerializer
        questions = [tq.question for tq in ticket_questions]
        questions_serializer = QuestionSerializer(questions, many=True)
        data['questions'] = questions_serializer.data
        
        # Cache for 1 hour
        cache.set(cache_key, data, timeout=3600)
        
        return Response(data)


class TicketQuestionViewSet(viewsets.ModelViewSet):
    queryset = TicketQuestion.objects.select_related('ticket', 'question')
    serializer_class = TicketQuestionSerializer
    filterset_fields = ['ticket']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get all questions for a specific ticket (cached)"""
        ticket = self.get_object()
        
        # Redis caching
        cache_key = f'ticket:{ticket.id}:questions'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Get questions
        ticket_questions = TicketQuestion.objects.filter(
            ticket=ticket
        ).select_related('question').prefetch_related(
            'question__answers'
        ).order_by('order_index')
        
        from apps.questions.serializers import QuestionSerializer
        questions = [tq.question for tq in ticket_questions]
        serializer = QuestionSerializer(questions, many=True)
        
        # Cache for 1 hour
        cache.set(cache_key, serializer.data, timeout=3600)
        
        return Response(serializer.data)
