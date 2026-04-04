from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import TestSession, TestAnswer
from .serializers import TestSessionSerializer, TestAnswerSerializer


class TestSessionViewSet(viewsets.ModelViewSet):
    serializer_class = TestSessionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['type', 'is_passed']
    
    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return TestSession.objects.all()
        return TestSession.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        """Submit test answer."""
        session = self.get_object()
        # Answer submission logic
        return Response({'status': 'ok'})
    
    @action(detail=True, methods=['post'])
    def finish(self, request, pk=None):
        """Finish test session."""
        session = self.get_object()
        # Finish logic
        return Response({'status': 'finished'})


class TestAnswerViewSet(viewsets.ModelViewSet):
    serializer_class = TestAnswerSerializer
    filterset_fields = ['test_session', 'is_correct']
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TestAnswer.objects.filter(test_session__user=self.request.user)
