"""
Auth Serializers
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.validators import validate_password_does_not_contain_email, validate_username_format

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    """
    Registration serializer
    POST /api/v1/auth/register/
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered')
        return value
    
    def validate(self, data):
        # Check passwords match
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError('Passwords do not match')
        
        # Check password doesn't contain email prefix
        validate_password_does_not_contain_email(data['password'], data['email'])
        
        return data


class LoginSerializer(serializers.Serializer):
    """
    Login serializer
    POST /api/v1/auth/login/
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class VerifyEmailSerializer(serializers.Serializer):
    """
    Verify email serializer
    POST /api/v1/auth/verify-email/
    """
    token = serializers.CharField()


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Forgot password serializer
    POST /api/v1/auth/forgot-password/
    """
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    """
    Reset password serializer
    POST /api/v1/auth/reset-password/
    """
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_new_password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError('Passwords do not match')
        
        return data


class RefreshTokenSerializer(serializers.Serializer):
    """
    Refresh token serializer
    POST /api/v1/auth/refresh/
    """
    refresh_token = serializers.CharField()


class TelegramAuthSerializer(serializers.Serializer):
    """
    Telegram WebApp auth serializer
    POST /api/v1/auth/telegram/
    """
    id = serializers.CharField()  # Telegram user ID as string
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    photo_url = serializers.CharField(required=False, allow_blank=True)
    auth_date = serializers.CharField()
    hash = serializers.CharField()


class TelegramBotAuthSerializer(serializers.Serializer):
    """
    Telegram bot auth serializer
    POST /api/v1/auth/telegram-bot/
    """
    telegram_id = serializers.IntegerField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)


class LinkEmailSerializer(serializers.Serializer):
    """
    Link email to Telegram account
    POST /api/v1/auth/link-email/
    """
    email = serializers.EmailField()


class AuthResponseSerializer(serializers.Serializer):
    """
    Standard auth response serializer
    """
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    expires_at = serializers.DateTimeField()
    user = serializers.DictField(required=False)
    message = serializers.CharField(required=False)
