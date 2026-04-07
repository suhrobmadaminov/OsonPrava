import os
import uuid
from pathlib import Path

from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import (
    FileUploadResponseSerializer,
    AvatarUploadResponseSerializer,
    FileDeleteResponseSerializer,
)

# Allowed image MIME types
ALLOWED_IMAGE_TYPES = {
    'image/jpeg',
    'image/png',
    'image/webp',
}

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}

# Max file size: 5MB
MAX_FILE_SIZE = 5 * 1024 * 1024


def _get_extension(filename: str) -> str:
    """Extract lowercase extension including dot from filename."""
    return Path(filename).suffix.lower()


def _is_s3_storage() -> bool:
    """Check if S3 storage is configured."""
    return hasattr(settings, 'AWS_ACCESS_KEY_ID') and settings.AWS_ACCESS_KEY_ID


def _save_to_local(file, upload_dir: Path, filename: str) -> Path:
    """Save file to local filesystem."""
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / filename
    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    return file_path


def _save_to_s3(file, filename: str) -> str:
    """Save file to S3 and return URL."""
    import boto3
    from botocore.exceptions import ClientError

    s3 = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=getattr(settings, 'AWS_S3_REGION_NAME', 'us-east-1'),
    )
    bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'osonprava-media')
    key = f'uploads/{filename}'

    try:
        s3.upload_fileobj(
            file,
            bucket_name,
            key,
            ExtraArgs={
                'ContentType': file.content_type,
                'ACL': 'public-read',
            },
        )
        if getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', None):
            return f'https://{settings.AWS_S3_CUSTOM_DOMAIN}/{key}'
        return f'https://{bucket_name}.s3.amazonaws.com/{key}'
    except ClientError as e:
        raise Exception(f'S3 upload failed: {e}')


def _delete_local_file(file_path: Path) -> bool:
    """Delete a file from local filesystem."""
    if file_path.exists():
        file_path.unlink()
        return True
    return False


def _delete_s3_file(filename: str) -> bool:
    """Delete a file from S3."""
    import boto3
    from botocore.exceptions import ClientError

    s3 = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=getattr(settings, 'AWS_S3_REGION_NAME', 'us-east-1'),
    )
    bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'osonprava-media')
    key = f'uploads/{filename}'

    try:
        s3.delete_object(Bucket=bucket_name, Key=key)
        return True
    except ClientError:
        return False


class FileUploadViewSet(viewsets.GenericViewSet):
    """
    ViewSet for handling file uploads.

    Actions:
    - upload: Upload an image file (JWT required)
    - avatar: Upload a user avatar (JWT required)
    - delete: Delete a file by filename (JWT required)
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def _validate_image(self, file):
        """Validate uploaded image file."""
        # Check file size
        if file.size > MAX_FILE_SIZE:
            return False, f'File size exceeds maximum allowed size of {MAX_FILE_SIZE // (1024 * 1024)}MB'

        # Check MIME type
        content_type = file.content_type
        if content_type not in ALLOWED_IMAGE_TYPES:
            return False, f'Unsupported file type: {content_type}. Allowed: JPEG, PNG, WebP'

        # Check extension
        ext = _get_extension(file.name)
        if ext not in ALLOWED_EXTENSIONS:
            return False, f'Unsupported file extension: {ext}. Allowed: .jpg, .jpeg, .png, .webp'

        return True, None

    def _build_file_url(self, filename: str) -> str:
        """Build the URL for an uploaded file."""
        if _is_s3_storage():
            if getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', None):
                return f'https://{settings.AWS_S3_CUSTOM_DOMAIN}/uploads/{filename}'
            bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'osonprava-media')
            return f'https://{bucket}.s3.amazonaws.com/uploads/{filename}'
        else:
            return f'{settings.MEDIA_URL}uploads/{filename}'

    @action(detail=False, methods=['post'])
    def upload(self, request):
        """
        Upload an image file.

        Accepts: JPEG, PNG, WebP images only.
        Max size: 5MB.
        Filename: UUID-based to prevent conflicts.
        """
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided. Use the "file" field.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_valid, error_msg = self._validate_image(file)
        if not is_valid:
            return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

        # Generate UUID-based filename
        ext = _get_extension(file.name)
        filename = f'{uuid.uuid4().hex}{ext}'

        try:
            if _is_s3_storage():
                url = _save_to_s3(file, filename)
            else:
                upload_dir = Path(settings.MEDIA_ROOT) / 'uploads'
                _save_to_local(file, upload_dir, filename)
                url = self._build_file_url(filename)
        except Exception as e:
            return Response(
                {'error': f'Failed to save file: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        response_data = {
            'url': url,
            'filename': filename,
            'size': file.size,
        }
        serializer = FileUploadResponseSerializer(data=response_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='avatar')
    def avatar(self, request):
        """
        Upload a user avatar.

        The avatar filename follows the pattern: user-{userId}-avatar{ext}
        Existing avatars for the user are overwritten.
        """
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided. Use the "file" field.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_valid, error_msg = self._validate_image(file)
        if not is_valid:
            return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

        # Build avatar filename: user-{userId}-avatar{ext}
        user_id = request.user.id
        ext = _get_extension(file.name)
        filename = f'user-{user_id}-avatar{ext}'

        try:
            if _is_s3_storage():
                url = _save_to_s3(file, filename)
            else:
                upload_dir = Path(settings.MEDIA_ROOT) / 'uploads'
                _save_to_local(file, upload_dir, filename)
                url = self._build_file_url(filename)
        except Exception as e:
            return Response(
                {'error': f'Failed to save avatar: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        response_data = {
            'url': url,
            'filename': filename,
        }
        serializer = AvatarUploadResponseSerializer(data=response_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete'], url_path='(?P<filename>[^/.]+)')
    def delete_file(self, request, filename=None):
        """
        Delete a file by its filename.

        Only the file owner or staff users can delete files.
        """
        if not filename:
            return Response(
                {'error': 'Filename is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Only allow deletion of files with allowed extensions
        ext = _get_extension(filename)
        if ext not in ALLOWED_EXTENSIONS:
            return Response(
                {'error': 'Invalid file type.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Non-staff users can only delete their own avatars
        if not request.user.is_staff:
            expected_prefix = f'user-{request.user.id}-avatar'
            if not filename.startswith(expected_prefix):
                return Response(
                    {'error': 'You can only delete your own files.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        try:
            if _is_s3_storage():
                deleted = _delete_s3_file(filename)
            else:
                file_path = Path(settings.MEDIA_ROOT) / 'uploads' / filename
                deleted = _delete_local_file(file_path)
        except Exception as e:
            return Response(
                {'error': f'Failed to delete file: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not deleted:
            return Response(
                {'error': 'File not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        response_data = {'detail': 'File deleted successfully.'}
        serializer = FileDeleteResponseSerializer(data=response_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
