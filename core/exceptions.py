"""
Custom Exception Handlers for OsonPrava
Equivalent to NestJS filters and exception handling
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError


def custom_exception_handler(exc, context):
    """
    Custom exception handler
    Provides consistent error response format
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Add status code and error details
        custom_response_data = {
            'statusCode': response.status_code,
            'message': response.data.get('detail', str(response.data)) if isinstance(response.data, dict) else response.data,
            'error': response.status_text,
        }
        
        # Add validation errors if present
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            if isinstance(response.data, dict):
                # Field validation errors
                errors = {}
                for field, messages in response.data.items():
                    if field not in ['detail', 'statusCode', 'message', 'error']:
                        if isinstance(messages, list):
                            errors[field] = ' '.join([str(m) for m in messages])
                        else:
                            errors[field] = str(messages)
                
                if errors:
                    custom_response_data['message'] = errors
                    custom_response_data['errors'] = errors
        
        response.data = custom_response_data
    
    return response


from rest_framework.exceptions import APIException

class BusinessException(APIException):
    """
    Base class for business logic exceptions
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Bad request'
    
    def __init__(self, detail=None, code=None):
        self.detail = detail or self.default_detail
        super().__init__(self.detail, code)


class ConflictException(BusinessException):
    """
    Resource conflict (e.g., duplicate email/username)
    HTTP 409
    """
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Conflict'


class NotFoundException(BusinessException):
    """
    Resource not found
    HTTP 404
    """
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Not found'


class UnauthorizedException(BusinessException):
    """
    Authentication required
    HTTP 401
    """
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Unauthorized'


class ForbiddenException(BusinessException):
    """
    Access forbidden
    HTTP 403
    """
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Forbidden'


class RateLimitExceededException(BusinessException):
    """
    Rate limit exceeded
    HTTP 429
    """
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_detail = 'Rate limit exceeded'


class EmailNotVerifiedException(BusinessException):
    """
    Email not verified
    HTTP 403
    """
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Email not verified'


class AccountLockedException(BusinessException):
    """
    Account locked due to too many failed attempts
    HTTP 403
    """
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Account locked'
