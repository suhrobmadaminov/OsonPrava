"""
Notification views.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404

from .models import Notification
from .serializers import NotificationSerializer


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def get_object(self):
        """Override to ensure ownership validation."""
        queryset = self.get_queryset()
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = get_object_or_404(queryset, **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj

    def list(self, request, *args, **kwargs):
        """List notifications (paginated, JWT required)."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        """Count of unread notifications."""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unreadCount': count})

    @action(detail=False, methods=['patch'], url_path='read-all')
    def read_all(self, request):
        """Mark all notifications as read."""
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read', 'updatedCount': updated})

    @action(detail=True, methods=['patch'], url_path='read')
    def mark_read(self, request, pk=None):
        """Mark single notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Delete notification (ownership validated via get_object)."""
        notification = self.get_object()
        notification.delete()
        return Response({'status': 'notification deleted'}, status=status.HTTP_204_NO_CONTENT)


def create_notification(user, notification_type, title_uz, title_ru, body_uz, body_ru, data=None):
    """
    Helper function to create a notification.
    Other modules can import and use this function.

    Args:
        user: The user to notify.
        notification_type: Type/category of the notification.
        title_uz: Title in Uzbek.
        title_ru: Title in Russian.
        body_uz: Body text in Uzbek.
        body_ru: Body text in Russian.
        data: Optional JSON data.

    Returns:
        The created Notification instance.
    """
    return Notification.objects.create(
        user=user,
        type=notification_type,
        title_uz=title_uz,
        title_ru=title_ru,
        body_uz=body_uz,
        body_ru=body_ru,
        data=data
    )
