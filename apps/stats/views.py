from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Sum, Avg
from apps.tests.models import TestSession
from apps.octagon.models import OctagonMatch


class UserStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        stats = {
            'test_sessions': {
                'total': user.test_sessions.count(),
                'passed': user.test_sessions.filter(is_passed=True).count(),
                'avg_score': user.test_sessions.aggregate(Avg('score'))['score__avg'] or 0,
                'total_correct': user.test_sessions.aggregate(Sum('correct_answers'))['correct_answers__sum'] or 0,
            },
            'battles': {
                'total': OctagonMatch.objects.filter(players__user=user).count(),
                'won': OctagonMatch.objects.filter(winner=user).count(),
            },
            'streak': user.streak,
            'longest_streak': user.longest_streak,
        }
        
        return Response(stats)
