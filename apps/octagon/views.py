from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import OctagonMatch, OctagonPlayer
from .serializers import OctagonMatchSerializer, OctagonPlayerSerializer


class OctagonMatchViewSet(viewsets.ModelViewSet):
    serializer_class = OctagonMatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return OctagonMatch.objects.filter(players__user=self.request.user).distinct()
    
    @action(detail=False, methods=['post'])
    def create_match(self, request):
        """Create new 1v1 match."""
        # Match creation logic
        return Response({'status': 'match_created'})


class OctagonPlayerViewSet(viewsets.ModelViewSet):
    serializer_class = OctagonPlayerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return OctagonPlayer.objects.filter(user=self.request.user)
