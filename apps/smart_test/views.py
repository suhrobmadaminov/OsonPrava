from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import UserQuestionStat
from .serializers import UserQuestionStatSerializer


class SmartTestViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def due_for_review(self, request):
        """Get questions due for review."""
        stats = UserQuestionStat.objects.filter(
            user=request.user,
            next_review_at__lte=timezone.now()
        ).select_related('question')[:20]
        
        serializer = UserQuestionStatSerializer(stats, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_stat(self, request):
        """Update spaced repetition statistics."""
        # SM-2 algorithm implementation
        question_id = request.data.get('question_id')
        is_correct = request.data.get('is_correct', False)
        
        stat, created = UserQuestionStat.objects.get_or_create(
            user=request.user,
            question_id=question_id
        )
        
        stat.times_answered += 1
        if is_correct:
            stat.times_correct += 1
            stat.consecutive_correct += 1
        else:
            stat.consecutive_correct = 0
            stat.ease_factor = max(1.3, stat.ease_factor - 0.8)
        
        # Update interval based on SM-2
        if stat.consecutive_correct == 0:
            stat.interval = 1
        elif stat.consecutive_correct == 1:
            stat.interval = 6
        else:
            stat.interval = round(stat.interval * stat.ease_factor)
        
        stat.next_review_at = timezone.now() + timedelta(days=stat.interval)
        stat.last_answered_at = timezone.now()
        stat.save()
        
        return Response({'status': 'updated', 'next_review': stat.next_review_at})
