"""
User Serializers
Equivalent to NestJS DTOs
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.validators import validate_password_does_not_contain_email, validate_username_format

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Basic user serializer for reading
    """
    telegram_id = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'telegram_id', 'email', 'email_verified', 
            'username', 'first_name', 'last_name', 'full_name',
            'avatar_url', 'language', 'role', 
            'is_premium', 'premium_expires_at',
            'streak', 'longest_streak', 'last_active_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'email_verified', 'role', 'is_premium',
            'premium_expires_at', 'streak', 'longest_streak',
            'last_active_at', 'created_at', 'updated_at'
        ]
    
    def get_telegram_id(self, obj):
        """Convert BigInt telegram_id to string"""
        return str(obj.telegram_id) if obj.telegram_id else None
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class UserDetailSerializer(UserSerializer):
    """
    Detailed user serializer
    """
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['login_attempts', 'locked_until']


class UpdateProfileSerializer(serializers.ModelSerializer):
    """
    Update profile serializer
    Equivalent to NestJS UpdateProfileDto
    """
    first_name = serializers.CharField(
        max_length=64, 
        min_length=1, 
        required=False,
        allow_null=True
    )
    last_name = serializers.CharField(
        max_length=64, 
        min_length=1, 
        required=False,
        allow_null=True
    )
    username = serializers.CharField(
        max_length=32, 
        min_length=3, 
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username']
    
    def validate_username(self, value):
        if value:
            validate_username_format(value)
            
            # Check uniqueness (exclude current user)
            user = self.context['request'].user
            if User.objects.exclude(id=user.id).filter(username=value).exists():
                raise serializers.ValidationError('Username is already taken')
        
        return value
    
    def validate_first_name(self, value):
        if value is not None and len(value.strip()) == 0:
            raise serializers.ValidationError('First name cannot be empty')
        return value.strip() if value else value
    
    def validate_last_name(self, value):
        if value is not None and len(value.strip()) == 0:
            raise serializers.ValidationError('Last name cannot be empty')
        return value.strip() if value else value


class ChangeLanguageSerializer(serializers.Serializer):
    """
    Change language serializer
    """
    language = serializers.ChoiceField(choices=User.Language.choices)


class UserStatsSerializer(serializers.Serializer):
    """
    User statistics serializer
    """
    total_tests = serializers.IntegerField()
    passed_tests = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    correct_answers = serializers.IntegerField()
    streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
