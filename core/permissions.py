"""
Custom Permissions for OsonPrava
"""
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied


class IsAdminUser(permissions.BasePermission):
    """
    Permission check for admin users
    Equivalent to NestJS AdminGuard
    """
    message = 'Admin privileges required.'
    
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated
            and hasattr(request.user, 'role')
            and request.user.role in ['ADMIN', 'SUPER_ADMIN']
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners to edit
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user


class IsNotBanned(permissions.BasePermission):
    """
    Check if user is not banned
    Equivalent to NestJS JWT guard banned check
    """
    message = 'Banned users cannot access this endpoint.'
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role != 'BANNED'


class IsEmailVerifiedOrReadOnly(permissions.BasePermission):
    """
    Allow read access to anyone, but require email verification for write operations
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.email_verified
