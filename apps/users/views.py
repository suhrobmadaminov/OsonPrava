"""
User Views
"""
from rest_framework import generics, status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta

from .serializers import (
    UserSerializer, 
    UpdateProfileSerializer, 
    ChangeLanguageSerializer,
    UserStatsSerializer
)

User = get_user_model()


class GetProfileView(generics.RetrieveAPIView):
    """
    GET /api/v1/users/profile/
    Get current user profile
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class UpdateProfileView(generics.UpdateAPIView):
    """
    PATCH /api/v1/users/profile/
    Update current user profile
    """
    serializer_class = UpdateProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return updated profile
        user_serializer = UserSerializer(instance)
        return Response(user_serializer.data)


class ChangeLanguageView(views.APIView):
    """
    PATCH /api/v1/users/language/
    Change user language
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        serializer = ChangeLanguageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.language = serializer.validated_data['language']
        user.save(update_fields=['language'])
        
        return Response({
            'id': user.id,
            'language': user.language
        })


class UserStatsView(views.APIView):
    """
    GET /api/v1/users/stats/
    Get user test statistics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Import here to avoid circular imports
        from apps.tests.models import TestSession
        
        # Get test session stats
        test_sessions = TestSession.objects.filter(user=user)
        
        total_tests = test_sessions.count()
        passed_tests = test_sessions.filter(is_passed=True).count()
        total_questions = test_sessions.aggregate(
            total=Sum('total_questions')
        )['total'] or 0
        correct_answers = test_sessions.aggregate(
            total=Sum('correct_answers')
        )['total'] or 0
        
        return Response(UserStatsSerializer({
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'total_questions': total_questions,
            'correct_answers': correct_answers,
            'streak': user.streak,
            'longest_streak': user.longest_streak,
        }).data)


class DeleteAccountView(views.APIView):
    """
    DELETE /api/v1/users/account/
    Delete current user account
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        user = request.user
        user.delete()
        return Response(
            {'message': 'Account deleted successfully'},
            status=status.HTTP_200_OK
        )
