"""
Auth Views
All authentication endpoints
Equivalent to NestJS AuthController
"""
from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.exceptions import ValidationError
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django_ratelimit.decorators import ratelimit

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    VerifyEmailSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    RefreshTokenSerializer,
    AuthResponseSerializer,
)
from .service import AuthService
from core.exceptions import UnauthorizedException




@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(views.APIView):
    """
    POST /api/v1/auth/register/
    Register with email + password
    Rate limited: 5 requests/hour per IP
    """
    permission_classes = [AllowAny]
    
    @method_decorator(ratelimit(key='ip', rate='5/h', method='POST'))
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        result = AuthService.register(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        return Response(result, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(views.APIView):
    """
    POST /api/v1/auth/login/
    Login with email + password
    Rate limited: 10 requests/15 min per IP
    """
    permission_classes = [AllowAny]
    
    @method_decorator(ratelimit(key='ip', rate='10/15m', method='POST'))
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        tokens = AuthService.login(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        return Response(tokens, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class VerifyEmailView(views.APIView):
    """
    POST /api/v1/auth/verify-email/
    Verify email with token
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        result = AuthService.verify_email(serializer.validated_data['token'])
        
        return Response(result, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class ForgotPasswordView(views.APIView):
    """
    POST /api/v1/auth/forgot-password/
    Request password reset
    Rate limited: 3 requests/hour per email
    """
    permission_classes = [AllowAny]
    
    @method_decorator(ratelimit(key='ip', rate='3/h', method='POST'))
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        result = AuthService.forgot_password(serializer.validated_data['email'])
        
        return Response(result, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class ResetPasswordView(views.APIView):
    """
    POST /api/v1/auth/reset-password/
    Reset password with token
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        result = AuthService.reset_password(
            token=serializer.validated_data['token'],
            new_password=serializer.validated_data['new_password']
        )
        
        return Response(result, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class ResendVerifyView(views.APIView):
    """
    POST /api/v1/auth/resend-verify/
    Resend verification email
    Rate limited: 3 requests/hour per email
    """
    permission_classes = [AllowAny]
    
    @method_decorator(ratelimit(key='ip', rate='3/h', method='POST'))
    def post(self, request):
        email = request.data.get('email')
        if not email:
            raise ValidationError({'email': 'Email is required'})
        
        result = AuthService.resend_verification(email)
        
        return Response(result, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class RefreshView(views.APIView):
    """
    POST /api/v1/auth/refresh/
    Refresh access token
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        tokens = AuthService.refresh_access_token(serializer.validated_data['refresh_token'])
        
        return Response(tokens, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(views.APIView):
    """
    POST /api/v1/auth/logout/
    Logout and invalidate token
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        AuthService.logout(request.user.id, serializer.validated_data['refresh_token'])
        
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


class MeView(views.APIView):
    """
    GET /api/v1/auth/me/
    Get current user profile
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        return Response({
            'id': user.id,
            'email': user.email,
            'email_verified': user.email_verified,
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
            'created_at': user.created_at,
        })


