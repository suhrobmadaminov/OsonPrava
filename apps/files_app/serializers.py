from rest_framework import serializers


class FileUploadResponseSerializer(serializers.Serializer):
    url = serializers.URLField()
    filename = serializers.CharField()
    size = serializers.IntegerField()


class AvatarUploadResponseSerializer(serializers.Serializer):
    url = serializers.URLField()
    filename = serializers.CharField()


class FileDeleteResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()
