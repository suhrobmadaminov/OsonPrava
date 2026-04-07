from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from .models import TestSession, TestAnswer
from .serializers import TestSessionSerializer, TestAnswerSerializer
from apps.questions.models import Question, Answer
from apps.tickets.models import TicketQuestion
from apps.smart_test.models import UserQuestionStat
from django.db.models import F


class TestSessionViewSet(viewsets.ModelViewSet):
    serializer_class = TestSessionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['type', 'is_passed']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return TestSession.objects.all()
        return TestSession.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def start(self, request):
        """Start a new test session"""
        test_type = request.data.get('type')
        ticket_id = request.data.get('ticket_id')
        topic_id = request.data.get('topic_id')
        
        if not test_type:
            return Response(
                {'error': 'Test type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        questions = []
        
        if test_type == 'TICKET':
            if not ticket_id:
                return Response({'error': 'ticket_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            ticket_questions = TicketQuestion.objects.filter(
                ticket_id=ticket_id
            ).select_related('question').order_by('order_index')
            questions = [tq.question for tq in ticket_questions]
            
        elif test_type == 'TOPIC':
            if not topic_id:
                return Response({'error': 'topic_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            questions = list(Question.objects.filter(topic_id=topic_id, is_active=True))
            
        elif test_type == 'EXAM':
            questions = list(Question.objects.filter(is_active=True).order_by('?')[:20])
            
        elif test_type == 'MARATHON':
            questions = list(Question.objects.filter(is_active=True).order_by('id'))
            
        elif test_type == 'MISTAKES':
            user_stats = UserQuestionStat.objects.filter(
                user=request.user,
                consecutive_correct=0
            ).select_related('question')
            questions = [stat.question for stat in user_stats]
            
        elif test_type == 'SMART':
            now = timezone.now()
            due_stats = UserQuestionStat.objects.filter(
                user=request.user,
                next_review_at__lte=now
            ).select_related('question').order_by('ease_factor')[:20]
            questions = [stat.question for stat in due_stats]
            
            if len(questions) < 20:
                answered_ids = UserQuestionStat.objects.filter(
                    user=request.user
                ).values_list('question_id', flat=True)
                
                remaining = 20 - len(questions)
                new_questions = list(Question.objects.filter(
                    is_active=True
                ).exclude(id__in=answered_ids).order_by('id')[:remaining])
                questions.extend(new_questions)
        else:
            return Response({'error': f'Invalid test type: {test_type}'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not questions:
            return Response({'error': 'No questions available'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            session = TestSession.objects.create(
                user=request.user,
                type=test_type,
                ticket_id=ticket_id if test_type == 'TICKET' else None,
                topic_id=topic_id if test_type == 'TOPIC' else None,
                total_questions=len(questions),
                correct_answers=0,
                wrong_answers=0,
                skipped_answers=0,
                score=0.0,
                is_passed=False
            )
        
        from apps.questions.serializers import QuestionSerializer
        questions_data = QuestionSerializer(questions, many=True).data
        
        return Response({
            'session': TestSessionSerializer(session).data,
            'questions': questions_data,
            'totalQuestions': len(questions)
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def answer(self, request, pk=None):
        """Submit answer for a question"""
        session = self.get_object()
        
        if session.completed_at:
            return Response({'error': 'Test already completed'}, status=status.HTTP_400_BAD_REQUEST)
        
        question_id = request.data.get('question_id')
        selected_answer_id = request.data.get('answer_id')
        time_spent = request.data.get('time_spent_sec')
        
        if not question_id or not selected_answer_id:
            return Response({'error': 'question_id and answer_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            question = Question.objects.get(id=question_id, is_active=True)
            selected_answer = Answer.objects.get(id=selected_answer_id, question=question)
        except (Question.DoesNotExist, Answer.DoesNotExist):
            return Response({'error': 'Invalid question or answer'}, status=status.HTTP_400_BAD_REQUEST)
        
        is_correct = selected_answer.is_correct
        
        with transaction.atomic():
            test_answer = TestAnswer.objects.create(
                test_session=session,
                question=question,
                selected_answer=selected_answer,
                is_correct=is_correct,
                time_spent_sec=time_spent
            )
            
            if is_correct:
                session.correct_answers = F('correct_answers') + 1
            else:
                session.wrong_answers = F('wrong_answers') + 1
            
            session.save()
            session.refresh_from_db()
        
        self._update_user_question_stat(question, is_correct)
        
        correct_answer = Answer.objects.filter(question=question, is_correct=True).first()
        
        return Response({
            'isCorrect': is_correct,
            'correctAnswerId': correct_answer.id if correct_answer else None,
            'explanation_uz': question.explanation_uz,
            'explanation_ru': question.explanation_ru,
            'testAnswer': TestAnswerSerializer(test_answer).data,
            'sessionStats': {
                'correctAnswers': session.correct_answers,
                'wrongAnswers': session.wrong_answers,
                'skippedAnswers': session.skipped_answers,
                'totalQuestions': session.total_questions
            }
        })

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete test session"""
        session = self.get_object()
        
        if session.completed_at:
            return Response({'error': 'Test already completed'}, status=status.HTTP_400_BAD_REQUEST)
        
        total = session.total_questions
        correct = session.correct_answers
        
        answered_count = TestAnswer.objects.filter(test_session=session).count()
        session.skipped_answers = total - answered_count
        
        session.score = round((correct / total) * 100, 2) if total > 0 else 0
        session.is_passed = session.score >= 90
        
        session.completed_at = timezone.now()
        time_delta = session.completed_at - session.started_at
        session.time_spent_sec = int(time_delta.total_seconds())
        
        self._update_user_streak(request.user)
        
        session.save()
        
        return Response({
            'session': TestSessionSerializer(session).data,
            'result': {
                'score': session.score,
                'isPassed': session.is_passed,
                'correctAnswers': session.correct_answers,
                'wrongAnswers': session.wrong_answers,
                'skippedAnswers': session.skipped_answers,
                'totalQuestions': session.total_questions,
                'timeSpentSec': session.time_spent_sec
            }
        })

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get test history (paginated)"""
        queryset = self.get_queryset().filter(
            completed_at__isnull=False
        ).order_by('-completed_at')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def _update_user_question_stat(self, question, is_correct):
        """Update UserQuestionStat with SM-2 algorithm"""
        user = self.request.user
        
        stat, created = UserQuestionStat.objects.get_or_create(
            user=user,
            question=question,
            defaults={
                'times_answered': 0,
                'times_correct': 0,
                'consecutive_correct': 0,
                'ease_factor': 2.5,
                'interval': 1,
                'next_review_at': timezone.now()
            }
        )
        
        stat.times_answered += 1
        if is_correct:
            stat.times_correct += 1
        
        if is_correct:
            stat.consecutive_correct += 1
            
            if stat.consecutive_correct == 1:
                stat.interval = 1
            elif stat.consecutive_correct == 2:
                stat.interval = 6
            else:
                stat.interval = int(stat.interval * stat.ease_factor)
            
            stat.ease_factor = max(1.3, stat.ease_factor + 0.1)
        else:
            stat.consecutive_correct = 0
            stat.interval = 1
            stat.ease_factor = max(1.3, stat.ease_factor - 0.2)
        
        stat.next_review_at = timezone.now() + timedelta(days=stat.interval)
        stat.last_answered_at = timezone.now()
        stat.save()

    def _update_user_streak(self, user):
        """Update user streak"""
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        
        if user.last_active_at:
            last_active_date = user.last_active_at.date()
            
            if last_active_date == today:
                pass
            elif last_active_date == yesterday:
                user.streak += 1
            else:
                user.streak = 1
        else:
            user.streak = 1
        
        user.longest_streak = max(user.longest_streak, user.streak)
        user.last_active_at = timezone.now()
        user.save()


class TestAnswerViewSet(viewsets.ModelViewSet):
    serializer_class = TestAnswerSerializer
    filterset_fields = ['test_session', 'is_correct']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TestAnswer.objects.filter(test_session__user=self.request.user)
