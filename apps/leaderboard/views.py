from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Sum
from apps.tests.models import TestSession

User = get_user_model()


class LeaderboardViewSet(viewsets.ViewSet):
    """Leaderboard viewset."""
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['get'])
    def top_users(self, request):
        """Get top users by score."""
        limit = request.query_params.get('limit', 50)
        
        top_users = User.objects.annotate(
            total_tests=Count('test_sessions'),
            avg_score=Avg('test_sessions__score'),
            total_correct=Sum('test_sessions__correct_answers')
        ).filter(
            total_tests__gt=0
        ).order_by('-avg_score', '-total_correct')[:int(limit)]
        
        data = []
        for i, user in enumerate(top_users, 1):
            data.append({
                'rank': i,
                'user_id': user.id,
                'username': user.username,
                'avatar_url': user.avatar_url,
                'total_tests': user.total_tests,
                'avg_score': round(user.avg_score or 0, 2),
                'total_correct': user.total_correct or 0,
                'streak': user.streak,
                'is_premium': user.is_premium
            })
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def my_rank(self, request):
        """Get current user rank."""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        
        users = User.objects.annotate(
            total_tests=Count('test_sessions'),
            avg_score=Avg('test_sessions__score'),
            total_correct=Sum('test_sessions__correct_answers')
        ).filter(total_tests__gt=0).order_by('-avg_score', '-total_correct')
        
        for i, user in enumerate(users, 1):
            if user.id == request.user.id:
                return Response({
                    'rank': i,
                    'avg_score': round(user.avg_score or 0, 2),
                    'total_correct': user.total_correct or 0
                })
        
        return Response({'rank': None})
