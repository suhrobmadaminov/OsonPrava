from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token obtain pair view."""
    pass


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """Register new user."""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response({
        'user_id': user.id,
        'username': user.username,
        'message': 'User created successfully'
    }, status=status.HTTP_201_CREATED)
