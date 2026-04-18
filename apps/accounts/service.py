"""
Auth Service
Business logic for authentication
Equivalent to NestJS AuthService
"""
import secrets
from datetime import timedelta
from typing import Optional, Dict, Any

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken as JWTToken
from rest_framework.exceptions import (
    AuthenticationFailed, 
    PermissionDenied, 
    ValidationError,
    APIException
)
from rest_framework import status

from core.utils import (
    generate_secure_token,
    parse_expiry_string
)
from core.exceptions import (
    ConflictException,
    UnauthorizedException,
    ForbiddenException,
    EmailNotVerifiedException,
    AccountLockedException
)
from .models import RefreshToken

User = get_user_model()


class AuthService:
    """
    Authentication service
    Handles all auth-related business logic
    """
    
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION_MINUTES = 15
    
    @classmethod
    def get_jwt_tokens(cls, user) -> Dict[str, Any]:
        """
        Generate JWT access and refresh tokens
        Returns dict with access_token, refresh_token, expires_at
        """
        jwt_token = JWTToken.for_user(user)
        
        access_token = str(jwt_token.access_token)
        refresh_token = str(jwt_token)
        
        # Calculate expiry
        access_token_lifetime = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
        expires_at = timezone.now() + access_token_lifetime
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_at': expires_at
        }
    
    @classmethod
    def get_refresh_tokens(cls, user) -> Dict[str, Any]:
        """
        Generate opaque refresh tokens (like NestJS)
        Stores in database for rotation
        """
        # Generate opaque refresh token
        refresh_token_str = generate_secure_token(64)  # 128 char hex
        
        # Parse expiry from settings
        refresh_lifetime = settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
        expires_at = timezone.now() + refresh_lifetime
        
        # Create JWT refresh token for actual token
        jwt_token = JWTToken.for_user(user)
        access_token = str(jwt_token.access_token)
        jwt_refresh = str(jwt_token)
        
        # Store opaque token in DB
        RefreshToken.objects.create(
            user=user,
            token=refresh_token_str,
            expires_at=expires_at
        )
        
        return {
            'access_token': access_token,
            'refresh_token': jwt_refresh,  # Return JWT refresh for compatibility
            'expires_at': expires_at
        }
    
    
    @classmethod
    def register(cls, email: str, password: str) -> Dict[str, Any]:
        """
        Register new user with email/password
        Returns tokens and user data
        """
        # Check if email already registered
        if User.objects.filter(email=email).exists():
            raise ConflictException('Email already registered')

        # Check if auto-verify is enabled (development/no email backend)
        from django.conf import settings
        auto_verify = getattr(settings, 'AUTO_VERIFY_EMAIL', True)

        # Create user
        verification_token = generate_secure_token(32) if not auto_verify else None
        verification_expires = timezone.now() + timedelta(hours=24) if not auto_verify else None

        user = User.objects.create(
            email=email,
            password=make_password(password),
            email_verified=auto_verify,  # Auto-verify if enabled
            email_verification_token=verification_token,
            email_verification_expires=verification_expires,
        )

        # Generate tokens
        tokens = cls.get_refresh_tokens(user)

        # Send verification email only if auto-verify is disabled
        if not auto_verify:
            cls._send_verification_email(user.email, verification_token, user.language)

        return {
            **tokens,
            'user': {
                'id': user.id,
                'email': user.email,
                'email_verified': user.email_verified,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'language': user.language,
                'role': user.role,
            },
            'message': 'Registration successful' if auto_verify else 'Verification email sent. Please check your inbox.'
        }
    
    @classmethod
    def login(cls, email: str, password: str) -> Dict[str, Any]:
        """
        Login with email/password
        Implements brute-force protection
        """
        # Find user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed('Invalid credentials')

        # Check account lockout
        if user.is_account_locked():
            remaining = (user.locked_until - timezone.now()).total_seconds() / 60
            raise AccountLockedException(f'Account locked. Try again in {remaining:.0f} minutes')

        # Validate password
        if not check_password(password, user.password):
            user.increment_login_attempts()
            raise AuthenticationFailed('Invalid credentials')

        # Success - reset attempts
        user.reset_login_attempts()

        # Check email verified (skip if auto-verify is enabled)
        from django.conf import settings
        auto_verify = getattr(settings, 'AUTO_VERIFY_EMAIL', True)
        if not auto_verify and not user.email_verified:
            raise EmailNotVerifiedException('Email not verified. Please verify your email first.')

        # Check banned
        if user.is_banned():
            raise ForbiddenException('Account is banned')

        # Update last active
        user.update_last_active()

        # Generate tokens
        tokens = cls.get_refresh_tokens(user)
        return {
            **tokens,
            'user': cls._format_user_response(user)
        }
    
    @classmethod
    def verify_email(cls, token: str) -> Dict[str, Any]:
        """
        Verify email with token
        """
        try:
            user = User.objects.get(
                email_verification_token=token,
                email_verification_expires__gt=timezone.now()
            )
        except User.DoesNotExist:
            raise ValidationError('Invalid or expired token')
        
        # Mark as verified
        user.email_verified = True
        user.email_verification_token = None
        user.email_verification_expires = None
        user.save(update_fields=['email_verified', 'email_verification_token', 'email_verification_expires'])
        
        # Send welcome email
        cls._send_welcome_email(user.email, user.first_name, user.language)
        
        return {
            'verified': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'email_verified': user.email_verified,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'language': user.language,
            }
        }
    
    @classmethod
    def forgot_password(cls, email: str) -> Dict[str, str]:
        """
        Request password reset
        Always returns success (timing-safe)
        """
        try:
            user = User.objects.get(email=email)
            
            # Generate reset token
            reset_token = generate_secure_token(32)
            reset_expires = timezone.now() + timedelta(hours=1)
            
            user.reset_password_token = reset_token
            user.reset_password_expires = reset_expires
            user.save(update_fields=['reset_password_token', 'reset_password_expires'])
            
            # Send reset email (should be Celery task)
            cls._send_password_reset_email(user.email, reset_token, user.language)
        except User.DoesNotExist:
            pass  # Always return success
        
        return {
            'success': True,
            'message': 'If the email exists, a reset link has been sent'
        }
    
    @classmethod
    def reset_password(cls, token: str, new_password: str) -> Dict[str, str]:
        """
        Reset password with token
        Invalidates all refresh tokens
        """
        try:
            user = User.objects.get(
                reset_password_token=token,
                reset_password_expires__gt=timezone.now()
            )
        except User.DoesNotExist:
            raise ValidationError('Invalid or expired token')
        
        # Validate password strength
        validate_password_does_not_contain_email(new_password, user.email)
        
        # Update password and clear tokens
        user.password = make_password(new_password)
        user.reset_password_token = None
        user.reset_password_expires = None
        user.login_attempts = 0
        user.locked_until = None
        user.save(update_fields=[
            'password', 'reset_password_token', 'reset_password_expires',
            'login_attempts', 'locked_until'
        ])
        
        # Delete ALL refresh tokens (force re-login)
        RefreshToken.objects.filter(user=user).delete()
        
        return {
            'success': True,
            'message': 'Password reset successfully'
        }
    
    @classmethod
    def resend_verification(cls, email: str) -> Dict[str, str]:
        """
        Resend verification email
        Always returns success (timing-safe)
        """
        try:
            user = User.objects.get(email=email, email_verified=False)
            
            # Generate new token
            verification_token = generate_secure_token(32)
            verification_expires = timezone.now() + timedelta(hours=24)
            
            user.email_verification_token = verification_token
            user.email_verification_expires = verification_expires
            user.save(update_fields=['email_verification_token', 'email_verification_expires'])
            
            # Send email
            cls._send_verification_email(user.email, verification_token, user.language)
        except User.DoesNotExist:
            pass  # Always return success
        
        return {
            'success': True,
            'message': 'Verification email sent'
        }
    
    @classmethod
    def refresh_access_token(cls, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh access token using refresh token
        Implements token rotation
        """
        try:
            # Find refresh token in DB
            token_obj = RefreshToken.objects.get(token=refresh_token)
        except RefreshToken.DoesNotExist:
            raise AuthenticationFailed('Invalid refresh token')
        
        # Check expiry
        if token_obj.is_expired():
            token_obj.delete()
            raise AuthenticationFailed('Refresh token expired')
        
        # Check user not banned
        user = token_obj.user
        if user.is_banned():
            raise ForbiddenException('Account is banned')
        
        # Delete old token (rotation)
        token_obj.delete()
        
        # Generate new tokens
        return cls.get_refresh_tokens(user)
    
    @classmethod
    def logout(cls, user_id: int, refresh_token: str):
        """
        Logout and invalidate refresh token
        """
        try:
            token_obj = RefreshToken.objects.get(
                token=refresh_token,
                user_id=user_id
            )
            token_obj.delete()
        except RefreshToken.DoesNotExist:
            pass  # Token already deleted or invalid
    
    
    @classmethod
    def _send_verification_email(cls, email: str, token: str, lang: str):
        """
        Send verification email
        Should be async (Celery task) in production
        """
        # TODO: Implement Celery task
        from django.core.mail import send_mail
        from django.conf import settings
        
        try:
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            verify_url = f"{frontend_url}/verify-email?token={token}"
            
            send_mail(
                subject='Verify your email - OsonPrava',
                message=f'Click here to verify: {verify_url}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,  # Silent failure like NestJS
            )
        except Exception:
            pass  # Silent failure
    
    @classmethod
    def _send_password_reset_email(cls, email: str, token: str, lang: str):
        """
        Send password reset email
        Should be async (Celery task) in production
        """
        # TODO: Implement Celery task
        from django.core.mail import send_mail
        from django.conf import settings
        
        try:
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            reset_url = f"{frontend_url}/reset-password?token={token}"
            
            send_mail(
                subject='Reset your password - OsonPrava',
                message=f'Click here to reset: {reset_url}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )
        except Exception:
            pass
    
    @classmethod
    def _send_welcome_email(cls, email: str, first_name: str, lang: str):
        """
        Send welcome email
        Should be async (Celery task) in production
        """
        # TODO: Implement Celery task
        from django.core.mail import send_mail
        from django.conf import settings
        
        try:
            name = first_name or 'User'
            send_mail(
                subject='Welcome to OsonPrava!',
                message=f'Welcome {name}! Start learning PDD now.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )
        except Exception:
            pass


    @classmethod
    def _format_user_response(cls, user) -> Dict[str, Any]:
        """
        Format user data for API response
        """
        return {
            'id': str(user.id),
            'email': user.email,
            'emailVerified': user.email_verified,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'username': user.username,
            'photoUrl': user.avatar_url,
            'role': user.role,
            'language': user.language,
            'isPremium': user.is_premium,
            'streak': user.streak,
        }


# Import validators
from core.validators import validate_password_does_not_contain_email
