from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import RoadSign
from .serializers import RoadSignSerializer


class RoadSignViewSet(viewsets.ModelViewSet):
    queryset = RoadSign.objects.all()
    serializer_class = RoadSignSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category']
    ordering_fields = ['order_index', 'code']
    ordering = ['order_index']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
