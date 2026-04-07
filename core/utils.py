"""
Utility functions for OsonPrava
"""
import secrets
import hmac
import hashlib
import json
from datetime import timedelta
from django.utils import timezone
from django.conf import settings


def generate_secure_token(length=64):
    """
    Generate a secure random token
    Equivalent to NestJS randomBytes(64).toString('hex')
    """
    return secrets.token_hex(length)


def generate_telegram_webapp_secret_key(bot_token):
    """
    Generate Telegram WebApp secret key
    HMAC-SHA256("WebAppData", bot_token)
    """
    return hmac.new(
        b"WebAppData",
        bot_token.encode(),
        hashlib.sha256
    ).digest()


def verify_telegram_webapp_data(data, bot_token):
    """
    Verify Telegram WebApp data
    Equivalent to NestJS Telegram auth verification
    """
    if 'hash' not in data:
        return False
    
    received_hash = data['hash']
    data_check_string_parts = []
    
    # Sort all parameters alphabetically
    for key in sorted(data.keys()):
        if key != 'hash':
            data_check_string_parts.append(f"{key}={data[key]}")
    
    data_check_string = '\n'.join(data_check_string_parts)
    
    # Generate secret key
    secret_key = generate_telegram_webapp_secret_key(bot_token)
    
    # Calculate hash
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(calculated_hash, received_hash)


def is_telegram_webapp_fresh(auth_date, max_age_seconds=86400):
    """
    Check if Telegram WebApp auth_date is not older than 24 hours
    """
    try:
        auth_timestamp = int(auth_date)
        current_timestamp = int(timezone.now().timestamp())
        return (current_timestamp - auth_timestamp) <= max_age_seconds
    except (ValueError, TypeError):
        return False


def parse_expiry_string(expiry_str):
    """
    Parse expiry string like NestJS does
    Supports: '15m', '7d', '1h', '30s', '1y'
    Returns timedelta
    """
    if not expiry_str:
        return timedelta(days=7)  # Default
    
    units = {
        's': 'seconds',
        'm': 'minutes',
        'h': 'hours',
        'd': 'days',
        'w': 'weeks',
        'y': 'days',  # Will multiply below
    }
    
    unit = expiry_str[-1]
    if unit.isdigit():
        # No unit specified, assume days
        value = int(expiry_str)
        return timedelta(days=value)
    
    if unit not in units:
        return timedelta(days=7)
    
    value = int(expiry_str[:-1])
    
    if unit == 'y':
        return timedelta(days=value * 365)
    
    return timedelta(**{units[unit]: value})


def get_redis_client():
    """
    Get Redis client instance
    """
    import redis
    from django.conf import settings
    
    redis_url = getattr(settings, 'REDIS_URL', 'redis://127.0.0.1:6379/0')
    return redis.from_url(redis_url, decode_responses=True)


def cache_get(key):
    """
    Get value from cache (Redis)
    """
    from django.core.cache import cache
    return cache.get(key)


def cache_set(key, value, timeout=3600):
    """
    Set value in cache (Redis)
    Default timeout: 1 hour
    """
    from django.core.cache import cache
    cache.set(key, value, timeout)


def cache_delete(key):
    """
    Delete value from cache
    """
    from django.core.cache import cache
    cache.delete(key)


def serialize_user_for_cache(user):
    """
    Serialize user object for cache
    """
    return {
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'username': user.username,
        'role': user.role,
        'language': user.language,
        'is_premium': user.is_premium,
    }


def format_timedelta(td):
    """
    Format timedelta to human-readable string
    """
    days = td.days
    hours, remainder = divmod(td.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if seconds > 0:
        parts.append(f"{seconds}s")
    
    return ' '.join(parts) if parts else '0s'
