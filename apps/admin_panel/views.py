from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta

from apps.tests.models import TestSession
from apps.questions.models import Question, Answer
from apps.tickets.models import Ticket, TicketQuestion
from apps.subscriptions.models import Subscription

User = get_user_model()


class IsAdminUser(permissions.BasePermission):
    """Custom permission to only allow ADMIN and SUPER_ADMIN roles."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in [User.Role.ADMIN, User.Role.SUPER_ADMIN]
        )


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'limit'
    max_page_size = 100


class AdminDashboardView(APIView):
    """GET /api/v1/admin/dashboard/ - Dashboard statistics (Admin/SuperAdmin only)"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        users_count = User.objects.count()
        questions_count = Question.objects.filter(is_active=True).count()
        active_subscriptions_count = Subscription.objects.filter(
            status='ACTIVE',
            expires_at__gt=now
        ).count()
        today_sessions = TestSession.objects.filter(
            started_at__gte=today_start
        ).count()

        return Response({
            'usersCount': users_count,
            'questionsCount': questions_count,
            'activeSubscriptionsCount': active_subscriptions_count,
            'todaySessions': today_sessions,
        })


class AdminUserListAPIView(APIView):
    """GET /api/v1/admin/users/ - List users (paginated, search)"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = User.objects.all().order_by('-created_at')

        # Search by firstName, lastName, username, email (case-insensitive)
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(username__icontains=search) |
                Q(email__icontains=search)
            )

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)

        users_data = []
        for user in page:
            users_data.append({
                'id': user.id,
                'telegram_id': str(user.telegram_id) if user.telegram_id is not None else None,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'avatar_url': user.avatar_url,
                'language': user.language,
                'role': user.role,
                'is_premium': user.is_premium,
                'premium_expires_at': user.premium_expires_at,
                'streak': user.streak,
                'longest_streak': user.longest_streak,
                'last_active_at': user.last_active_at,
                'created_at': user.created_at,
                'updated_at': user.updated_at,
            })

        return paginator.get_paginated_response(users_data)


class AdminBanUserAPIView(APIView):
    """PATCH /api/v1/admin/users/{id}/ban/ - Ban user"""
    permission_classes = [IsAdminUser]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.role == User.Role.SUPER_ADMIN:
            return Response(
                {'error': 'Cannot ban a Super Admin'},
                status=status.HTTP_403_FORBIDDEN
            )

        user.role = User.Role.BANNED
        user.is_premium = False
        user.premium_expires_at = None
        user.save(update_fields=['role', 'is_premium', 'premium_expires_at'])

        return Response({
            'id': user.id,
            'role': user.role,
            'is_premium': user.is_premium,
            'message': 'User has been banned',
        })


class AdminUnbanUserAPIView(APIView):
    """PATCH /api/v1/admin/users/{id}/unban/ - Unban user"""
    permission_classes = [IsAdminUser]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.role != User.Role.BANNED:
            return Response(
                {'error': 'User is not banned'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.role = User.Role.USER
        user.save(update_fields=['role'])

        return Response({
            'id': user.id,
            'role': user.role,
            'message': 'User has been unbanned',
        })


class AdminAnswerSerializer:
    """Helper serializer for Answer data (nested in Question)."""

    @staticmethod
    def to_representation(answer):
        return {
            'id': answer.id,
            'text_uz': answer.text_uz,
            'text_uz_cyr': answer.text_uz_cyr,
            'text_ru': answer.text_ru,
            'is_correct': answer.is_correct,
            'order_index': answer.order_index,
        }


class AdminQuestionListAPIView(APIView):
    """GET /api/v1/admin/questions/ - List questions (paginated)"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = Question.objects.all().prefetch_related('answers').select_related('topic').order_by('-created_at')

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)

        questions_data = []
        for question in page:
            answers = [AdminAnswerSerializer.to_representation(a) for a in question.answers.all()]
            questions_data.append({
                'id': question.id,
                'text_uz': question.text_uz,
                'text_uz_cyr': question.text_uz_cyr,
                'text_ru': question.text_ru,
                'image_url': question.image_url,
                'explanation_uz': question.explanation_uz,
                'explanation_uz_cyr': question.explanation_uz_cyr,
                'explanation_ru': question.explanation_ru,
                'audio_url_uz': question.audio_url_uz,
                'audio_url_ru': question.audio_url_ru,
                'topic_id': question.topic_id,
                'topic_name': question.topic.name_uz if question.topic else None,
                'difficulty': question.difficulty,
                'is_active': question.is_active,
                'answers': answers,
                'created_at': question.created_at,
                'updated_at': question.updated_at,
            })

        return paginator.get_paginated_response(questions_data)


class AdminQuestionCreateAPIView(APIView):
    """POST /api/v1/admin/questions/ - Create question (with answers)"""
    permission_classes = [IsAdminUser]

    def post(self, request):
        data = request.data

        # Validate required fields
        required_fields = ['text_uz', 'text_uz_cyr', 'text_ru', 'topic_id', 'difficulty', 'answers']
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'Missing required field: {field}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Validate answers
        answers_data = data.get('answers', [])
        if not isinstance(answers_data, list) or len(answers_data) == 0:
            return Response(
                {'error': 'At least one answer is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check that at least one answer is correct
        has_correct = any(a.get('is_correct', False) for a in answers_data)
        if not has_correct:
            return Response(
                {'error': 'At least one answer must be marked as correct'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create question
        question = Question.objects.create(
            text_uz=data['text_uz'],
            text_uz_cyr=data['text_uz_cyr'],
            text_ru=data['text_ru'],
            image_url=data.get('image_url'),
            explanation_uz=data.get('explanation_uz'),
            explanation_uz_cyr=data.get('explanation_uz_cyr'),
            explanation_ru=data.get('explanation_ru'),
            audio_url_uz=data.get('audio_url_uz'),
            audio_url_ru=data.get('audio_url_ru'),
            topic_id=data['topic_id'],
            difficulty=data['difficulty'],
            is_active=data.get('is_active', True),
        )

        # Create answers
        created_answers = []
        for idx, ans_data in enumerate(answers_data):
            ans = Answer.objects.create(
                question=question,
                text_uz=ans_data.get('text_uz', ''),
                text_uz_cyr=ans_data.get('text_uz_cyr', ''),
                text_ru=ans_data.get('text_ru', ''),
                is_correct=ans_data.get('is_correct', False),
                order_index=ans_data.get('order_index', idx),
            )
            created_answers.append(AdminAnswerSerializer.to_representation(ans))

        # Handle ticketQuestion links if provided
        ticket_ids = data.get('ticket_ids', [])
        if ticket_ids and isinstance(ticket_ids, list):
            order_index = 0
            for ticket_id in ticket_ids:
                try:
                    ticket = Ticket.objects.get(id=ticket_id)
                    TicketQuestion.objects.create(
                        ticket=ticket,
                        question=question,
                        order_index=order_index,
                    )
                    order_index += 1
                except Ticket.DoesNotExist:
                    pass

        response_data = {
            'id': question.id,
            'text_uz': question.text_uz,
            'text_uz_cyr': question.text_uz_cyr,
            'text_ru': question.text_ru,
            'image_url': question.image_url,
            'explanation_uz': question.explanation_uz,
            'explanation_uz_cyr': question.explanation_uz_cyr,
            'explanation_ru': question.explanation_ru,
            'audio_url_uz': question.audio_url_uz,
            'audio_url_ru': question.audio_url_ru,
            'topic_id': question.topic_id,
            'difficulty': question.difficulty,
            'is_active': question.is_active,
            'answers': created_answers,
            'created_at': question.created_at,
            'updated_at': question.updated_at,
        }

        return Response(response_data, status=status.HTTP_201_CREATED)


class AdminQuestionDetailAPIView(APIView):
    """
    PATCH /api/v1/admin/questions/{id}/ - Update question
    DELETE /api/v1/admin/questions/{id}/ - Delete question
    """
    permission_classes = [IsAdminUser]

    def _get_question(self, question_id):
        try:
            return Question.objects.prefetch_related('answers').get(id=question_id)
        except Question.DoesNotExist:
            return None

    def _serialize_question(self, question):
        answers = [AdminAnswerSerializer.to_representation(a) for a in question.answers.all()]
        return {
            'id': question.id,
            'text_uz': question.text_uz,
            'text_uz_cyr': question.text_uz_cyr,
            'text_ru': question.text_ru,
            'image_url': question.image_url,
            'explanation_uz': question.explanation_uz,
            'explanation_uz_cyr': question.explanation_uz_cyr,
            'explanation_ru': question.explanation_ru,
            'audio_url_uz': question.audio_url_uz,
            'audio_url_ru': question.audio_url_ru,
            'topic_id': question.topic_id,
            'difficulty': question.difficulty,
            'is_active': question.is_active,
            'answers': answers,
            'created_at': question.created_at,
            'updated_at': question.updated_at,
        }

    def patch(self, request, question_id):
        question = self._get_question(question_id)
        if question is None:
            return Response(
                {'error': 'Question not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        data = request.data

        # Update question fields
        update_fields = []
        text_fields = [
            'text_uz', 'text_uz_cyr', 'text_ru',
            'image_url', 'explanation_uz', 'explanation_uz_cyr', 'explanation_ru',
            'audio_url_uz', 'audio_url_ru',
        ]
        for field in text_fields:
            if field in data:
                setattr(question, field, data[field])
                update_fields.append(field)

        if 'topic_id' in data:
            question.topic_id = data['topic_id']
            update_fields.append('topic_id')

        if 'difficulty' in data:
            question.difficulty = data['difficulty']
            update_fields.append('difficulty')

        if 'is_active' in data:
            question.is_active = data['is_active']
            update_fields.append('is_active')

        if update_fields:
            question.save(update_fields=update_fields)

        # If answers are provided, delete old and create new
        if 'answers' in data:
            answers_data = data['answers']
            if not isinstance(answers_data, list):
                return Response(
                    {'error': 'Answers must be a list'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Delete old answers
            question.answers.all().delete()

            # Create new answers
            created_answers = []
            for idx, ans_data in enumerate(answers_data):
                ans = Answer.objects.create(
                    question=question,
                    text_uz=ans_data.get('text_uz', ''),
                    text_uz_cyr=ans_data.get('text_uz_cyr', ''),
                    text_ru=ans_data.get('text_ru', ''),
                    is_correct=ans_data.get('is_correct', False),
                    order_index=ans_data.get('order_index', idx),
                )
                created_answers.append(AdminAnswerSerializer.to_representation(ans))

        return Response(self._serialize_question(question))

    def delete(self, request, question_id):
        question = self._get_question(question_id)
        if question is None:
            return Response(
                {'error': 'Question not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        question.delete()
        return Response(
            {'message': 'Question deleted successfully'},
            status=status.HTTP_200_OK
        )


class AdminSubscriptionListAPIView(APIView):
    """GET /api/v1/admin/subscriptions/ - List subscriptions (paginated)"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = Subscription.objects.all().select_related('user').order_by('-created_at')

        # Optional filter by status
        status_filter = request.query_params.get('status', '').strip()
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)

        subs_data = []
        for sub in page:
            subs_data.append({
                'id': sub.id,
                'user': {
                    'id': sub.user.id,
                    'telegram_id': str(sub.user.telegram_id) if sub.user.telegram_id is not None else None,
                    'email': sub.user.email,
                    'username': sub.user.username,
                    'first_name': sub.user.first_name,
                    'last_name': sub.user.last_name,
                },
                'plan': sub.plan,
                'status': sub.status,
                'starts_at': sub.starts_at,
                'expires_at': sub.expires_at,
                'payment_provider': sub.payment_provider,
                'payment_id': sub.payment_id,
                'amount': sub.amount,
                'currency': sub.currency,
                'created_at': sub.created_at,
            })

        return paginator.get_paginated_response(subs_data)
