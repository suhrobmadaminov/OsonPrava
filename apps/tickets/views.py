from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Ticket, TicketQuestion
from .serializers import TicketSerializer, TicketQuestionSerializer


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


class TicketQuestionViewSet(viewsets.ModelViewSet):
    queryset = TicketQuestion.objects.select_related('ticket', 'question')
    serializer_class = TicketQuestionSerializer
    filterset_fields = ['ticket']
    
    def get_permissions(self):
        return [permissions.IsAdminUser()]
