"""
Stats views.
"""
from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta, date

from apps.tests.models import TestSession, TestAnswer
from apps.octagon.models import OctagonMatch
from apps.questions.models import Topic


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


class StatsOverviewView(APIView):
    """General statistics overview for the authenticated user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        total_tests = user.test_sessions.count()
        passed_tests = user.test_sessions.filter(is_passed=True).count()

        total_answered_qs = TestAnswer.objects.filter(test_session__user=user)
        total_answered = total_answered_qs.count()
        correct_answers = total_answered_qs.filter(is_correct=True).count()
        wrong_answers = total_answered_qs.filter(is_correct=False).count()

        if total_answered > 0:
            correct_percent = round((correct_answers / total_answered) * 100)
        else:
            correct_percent = 0

        return Response({
            'totalTests': total_tests,
            'passedTests': passed_tests,
            'totalAnswered': total_answered,
            'correctAnswers': correct_answers,
            'wrongAnswers': wrong_answers,
            'correctPercent': correct_percent,
            'streak': user.streak,
            'longestStreak': user.longest_streak,
        })


class StatsWeeklyView(APIView):
    """Last 7 days statistics."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        days = []
        total_correct = 0
        total_tests = 0
        total_time = 0

        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_start = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.min.time()))
            day_end = day_start + timedelta(days=1)

            day_sessions = user.test_sessions.filter(
                started_at__gte=day_start,
                started_at__lt=day_end
            )

            test_count = day_sessions.count()
            correct_count = day_sessions.aggregate(
                correct=Sum('correct_answers')
            )['correct'] or 0

            day_time = day_sessions.aggregate(
                time=Sum('time_spent_sec')
            )['time'] or 0

            total_correct += correct_count
            total_tests += test_count
            total_time += day_time

            days.append({
                'date': day.isoformat(),
                'testCount': test_count,
                'correctCount': correct_count,
            })

        return Response({
            'days': days,
            'weekSummary': {
                'totalTests': total_tests,
                'totalCorrect': total_correct,
                'totalTimeSec': total_time,
            }
        })


class StatsTopicsView(APIView):
    """Progress by topics."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get all test answers for this user, grouped by question topic
        topic_stats = []

        for topic in Topic.objects.filter(is_active=True):
            total_questions = topic.questions_count

            # Count how many times user answered questions from this topic
            answers = TestAnswer.objects.filter(
                test_session__user=user,
                question__topic=topic
            )

            times_answered = answers.count()
            times_correct = answers.filter(is_correct=True).count()

            if times_answered > 0:
                correct_percent = round((times_correct / times_answered) * 100)
            else:
                correct_percent = 0

            if total_questions > 0:
                progress = round((times_answered / total_questions) * 100)
            else:
                progress = 0

            topic_stats.append({
                'topicId': topic.id,
                'topicNameUz': topic.name_uz,
                'topicNameRu': topic.name_ru,
                'topicSlug': topic.slug,
                'answeredQuestions': times_answered,
                'totalQuestions': total_questions,
                'timesAnswered': times_answered,
                'timesCorrect': times_correct,
                'correctPercent': correct_percent,
                'progress': progress,
            })

        return Response(topic_stats)


class StatsStreakView(APIView):
    """Streak and activity statistics."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=29)

        # Get all completed test sessions in the last 30 days
        sessions = user.test_sessions.filter(
            completed_at__isnull=False,
            completed_at__gte=timezone.make_aware(
                timezone.datetime.combine(thirty_days_ago, timezone.datetime.min.time())
            )
        )

        # Get unique active days
        active_dates = set()
        for session in sessions:
            if session.completed_at:
                active_dates.add(session.completed_at.date())

        active_days_last_30 = len(active_dates)

        # Generate all ISO dates for the last 30 days
        all_dates = []
        for i in range(29, -1, -1):
            d = today - timedelta(days=i)
            all_dates.append({
                'date': d.isoformat(),
                'isActive': d in active_dates,
            })

        return Response({
            'currentStreak': user.streak,
            'longestStreak': user.longest_streak,
            'lastActiveAt': user.last_active_at.isoformat() if user.last_active_at else None,
            'activeDaysLast30': active_days_last_30,
            'activeDates': all_dates,
        })
