from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q, Avg, Count
from .models import UserQuestionStat
from .serializers import UserQuestionStatSerializer
from apps.tests.models import TestSession
from apps.questions.models import Question


class SmartTestViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def start(self, request):
        """
        Start a smart test session.
        - Fetch questions due for review (next_review_at <= now), ordered by ease_factor ASC, limit 20
        - If < 20 questions, fill with unanswered questions
        - Create a TestSession with type='SMART'
        """
        now = timezone.now()
        user = request.user

        # Step 1: Get questions due for review, ordered by ease_factor ASC
        due_questions = list(
            UserQuestionStat.objects.filter(
                user=user,
                next_review_at__lte=now
            )
            .order_by('ease_factor')[:20]
            .select_related('question')
        )

        due_question_ids = [stat.question_id for stat in due_questions]

        # Step 2: If < 20, fill with unanswered questions
        questions_needed = 20 - len(due_questions)
        if questions_needed > 0:
            # Get questions the user has never answered
            answered_question_ids = UserQuestionStat.objects.filter(
                user=user
            ).values_list('question_id', flat=True)

            unanswered_questions = list(
                Question.objects.filter(
                    is_active=True
                )
                .exclude(id__in=answered_question_ids)
                .exclude(id__in=due_question_ids)
                .order_by('?')[:questions_needed]
            )

            # Create UserQuestionStat entries for unanswered questions
            for question in unanswered_questions:
                stat = UserQuestionStat(
                    user=user,
                    question=question,
                    ease_factor=2.5,
                    interval=1,
                    next_review_at=now,
                    last_answered_at=now
                )
                due_questions.append(stat)

        if not due_questions:
            return Response(
                {'error': 'No questions available for smart test'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 3: Create TestSession
        total_questions = len(due_questions)
        test_session = TestSession.objects.create(
            user=user,
            type='SMART',
            total_questions=total_questions
        )

        # Step 4: Serialize questions for response
        # Build question data manually for unanswered questions
        questions_data = []
        for stat in due_questions:
            question = stat.question
            questions_data.append({
                'id': question.id,
                'text_uz': question.text_uz,
                'text_uz_cyr': question.text_uz_cyr,
                'text_ru': question.text_ru,
                'image_url': question.image_url,
                'difficulty': question.difficulty,
                'stat_id': stat.id if hasattr(stat, 'id') else None,
                'ease_factor': stat.ease_factor,
                'interval': stat.interval,
            })

        return Response({
            'session_id': test_session.id,
            'type': 'SMART',
            'total_questions': total_questions,
            'questions': questions_data,
            'created_at': test_session.started_at
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get smart test statistics.
        Returns: totalTracked, totalQuestions, avgEaseFactor, dueForReview, mastered, recentSessions
        """
        user = request.user
        now = timezone.now()

        # Total questions tracked (UserQuestionStat entries)
        total_tracked = UserQuestionStat.objects.filter(user=user).count()

        # Total unique questions answered
        total_questions = UserQuestionStat.objects.filter(
            user=user,
            times_answered__gt=0
        ).count()

        # Average ease factor
        ease_factor_data = UserQuestionStat.objects.filter(
            user=user
        ).aggregate(avg_ease=Avg('ease_factor'))
        avg_ease_factor = round(ease_factor_data['avg_ease'] or 2.5, 2)

        # Due for review
        due_for_review = UserQuestionStat.objects.filter(
            user=user,
            next_review_at__lte=now
        ).count()

        # Mastered questions (interval >= 21 and ease_factor >= 2.5)
        mastered = UserQuestionStat.objects.filter(
            user=user,
            interval__gte=21,
            ease_factor__gte=2.5
        ).count()

        # Recent sessions (last 10 SMART test sessions)
        recent_sessions_qs = TestSession.objects.filter(
            user=user,
            type='SMART'
        ).order_by('-started_at')[:10]

        recent_sessions = []
        for session in recent_sessions_qs:
            recent_sessions.append({
                'id': session.id,
                'total_questions': session.total_questions,
                'correct_answers': session.correct_answers,
                'wrong_answers': session.wrong_answers,
                'skipped_answers': session.skipped_answers,
                'score': session.score,
                'is_passed': session.is_passed,
                'started_at': session.started_at,
                'completed_at': session.completed_at,
                'time_spent_sec': session.time_spent_sec,
            })

        return Response({
            'totalTracked': total_tracked,
            'totalQuestions': total_questions,
            'avgEaseFactor': avg_ease_factor,
            'dueForReview': due_for_review,
            'mastered': mastered,
            'recentSessions': recent_sessions
        })

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
