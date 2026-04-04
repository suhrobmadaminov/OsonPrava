from rest_framework.decorators import APIView, permission_classes
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Avg
from apps.tests.models import TestSession
from apps.questions.models import Question, Topic
from apps.tickets.models import Ticket
from apps.subscriptions.models import Subscription

User = get_user_model()


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        stats = {
            'users': {
                'total': User.objects.count(),
                'active_today': User.objects.filter(last_active_at__gte=timezone.now() - timedelta(days=1)).count(),
                'premium': User.objects.filter(is_premium=True).count(),
            },
            'content': {
                'questions': Question.objects.count(),
                'topics': Topic.objects.count(),
                'tickets': Ticket.objects.count(),
            },
            'tests': {
                'total_sessions': TestSession.objects.count(),
                'avg_score': TestSession.objects.aggregate(Avg('score'))['score__avg'] or 0,
            },
            'revenue': {
                'active_subscriptions': Subscription.objects.filter(status='ACTIVE').count(),
                'total_revenue': Subscription.objects.aggregate(Sum('amount'))['amount__sum'] or 0,
            }
        }
        return Response(stats)


from django.utils import timezone
from datetime import timedelta
