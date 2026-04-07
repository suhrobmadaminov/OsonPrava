"""
Custom Validators for OsonPrava
NestJS'dagi @IsPasswordStrong() va boshqa validatorlarning Django versiyasi
"""
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class PasswordStrengthValidator:
    """
    Password strength validator
    Equivalent to NestJS @IsPasswordStrong() decorator
    Requirements:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    """
    
    def __init__(self, min_length=8):
        self.min_length = min_length
    
    def validate(self, password, user=None):
        # Check minimum length
        if len(password) < self.min_length:
            raise ValidationError(
                _(f'Password must be at least {self.min_length} characters long.'),
                code='password_too_short'
            )
        
        # Check for uppercase
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _('Password must contain at least one uppercase letter.'),
                code='password_no_uppercase'
            )
        
        # Check for lowercase
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                _('Password must contain at least one lowercase letter.'),
                code='password_no_lowercase'
            )
        
        # Check for digit
        if not re.search(r'[0-9]', password):
            raise ValidationError(
                _('Password must contain at least one number.'),
                code='password_no_digit'
            )
    
    def get_help_text(self):
        return _(
            f'Your password must be at least {self.min_length} characters long '
            'and contain at least one uppercase letter, one lowercase letter, '
            'and one number.'
        )


def validate_password_does_not_contain_email(password, email):
    """
    Validate that password does not contain email prefix
    Equivalent to NestJS validation in register and reset-password
    """
    if not email:
        return
    
    email_prefix = email.split('@')[0].lower()
    if email_prefix and email_prefix in password.lower():
        raise ValidationError(
            _('Password cannot contain your email prefix.'),
            code='password_contains_email'
        )


def validate_username_format(username):
    """
    Validate username format
    - 3-32 characters
    - Alphanumeric and underscores only
    """
    if not re.match(r'^[a-zA-Z0-9_]{3,32}$', username):
        raise ValidationError(
            _('Username must be 3-32 characters long and contain only '
              'letters, numbers, and underscores.'),
            code='invalid_username_format'
        )
