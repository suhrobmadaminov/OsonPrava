from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import FileUploadViewSet

app_name = 'files'

router = DefaultRouter()
router.register(r'', FileUploadViewSet, basename='file')

urlpatterns = [
    path('upload/', FileUploadViewSet.as_view({'post': 'upload'}), name='file-upload'),
    path('avatar/', FileUploadViewSet.as_view({'post': 'avatar'}), name='file-avatar'),
    path('<str:filename>/', FileUploadViewSet.as_view({'delete': 'delete_file'}), name='file-delete'),
]
