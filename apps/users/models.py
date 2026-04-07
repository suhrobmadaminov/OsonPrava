"""
Custom User Model for OsonPrava
NestJS Prisma schema'dan to'liq ko'chirilgan
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email=None, password=None, **extra_fields):
        """Create and return a regular user"""
        if not email and not extra_fields.get('telegram_id'):
            raise ValueError('User must have either email or telegram_id')
        
        if email:
            email = self.normalize_email(email)
        
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # This uses bcrypt internally
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser"""
        extra_fields.setdefault('role', User.Role.SUPER_ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('email_verified', True)
        
        if extra_fields.get('role') != User.Role.SUPER_ADMIN:
            raise ValueError('Superuser must have role=SUPER_ADMIN')
        
        return self.create_user(email, password, **extra_fields)
    
    def create_staff_user(self, email, password=None, **extra_fields):
        """Create and return a staff/admin user"""
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('email_verified', True)
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model
    Equivalent to Prisma User model
    """
    
    class Role(models.TextChoices):
        USER = 'USER', 'User'
        PREMIUM = 'PREMIUM', 'Premium'
        BANNED = 'BANNED', 'Banned'
        ADMIN = 'ADMIN', 'Admin'
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
    
    class Language(models.TextChoices):
        UZ_LATIN = 'UZ_LATIN', 'Uzbek Latin'
        UZ_CYRILLIC = 'UZ_CYRILLIC', 'Uzbek Cyrillic'
        RU = 'RU', 'Russian'
    
    # Fields
    telegram_id = models.BigIntegerField(
        unique=True, 
        null=True, 
        blank=True,
        db_index=True,
        help_text="Telegram user ID (can be very large)"
    )
    email = models.EmailField(
        unique=True, 
        null=True, 
        blank=True,
        db_index=True
    )
    # password field is provided by AbstractBaseUser as `password`
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, null=True, blank=True)
    email_verification_expires = models.DateTimeField(null=True, blank=True)
    reset_password_token = models.CharField(max_length=255, null=True, blank=True)
    reset_password_expires = models.DateTimeField(null=True, blank=True)
    login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    username = models.CharField(
        max_length=32, 
        unique=True, 
        null=True, 
        blank=True,
        db_index=True
    )
    first_name = models.CharField(max_length=64, null=True, blank=True)
    last_name = models.CharField(max_length=64, null=True, blank=True)
    avatar_url = models.CharField(max_length=500, null=True, blank=True)
    
    language = models.CharField(
        max_length=20,
        choices=Language.choices,
        default=Language.UZ_LATIN
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER
    )
    
    is_premium = models.BooleanField(default=False)
    premium_expires_at = models.DateTimeField(null=True, blank=True)
    
    streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_active_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Django required fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Use email as the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Email is not required because it can be null (Telegram auth)
    
    objects = UserManager()
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['telegram_id']),
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        if self.email:
            return self.email
        return f"User {self.id} (Telegram: {self.telegram_id})"
    
    def get_full_name(self):
        """Return user's full name"""
        names = [self.first_name, self.last_name]
        return ' '.join(filter(None, names)) or self.username or f"User {self.id}"
    
    def get_short_name(self):
        """Return user's short name"""
        return self.first_name or self.username or f"User {self.id}"
    
    def is_banned(self):
        """Check if user is banned"""
        return self.role == self.Role.BANNED
    
    def is_premium_active(self):
        """Check if premium is currently active"""
        if not self.is_premium:
            return False
        if self.premium_expires_at is None:
            return True  # Lifetime premium
        return self.premium_expires_at > timezone.now()
    
    def is_account_locked(self):
        """Check if account is locked due to failed login attempts"""
        if self.locked_until is None:
            return False
        return timezone.now() < self.locked_until
    
    def unlock_account(self):
        """Unlock the account"""
        self.locked_until = None
        self.login_attempts = 0
        self.save(update_fields=['locked_until', 'login_attempts'])
    
    def increment_login_attempts(self):
        """Increment login attempts and lock if necessary"""
        self.login_attempts += 1
        if self.login_attempts >= 5:
            self.locked_until = timezone.now() + timezone.timedelta(minutes=15)
        self.save(update_fields=['login_attempts', 'locked_until'])
    
    def reset_login_attempts(self):
        """Reset login attempts after successful login"""
        self.login_attempts = 0
        self.locked_until = None
        self.save(update_fields=['login_attempts', 'locked_until'])
    
    def update_last_active(self):
        """Update last active timestamp"""
        self.last_active_at = timezone.now()
        self.save(update_fields=['last_active_at'])