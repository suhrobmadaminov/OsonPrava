from rest_framework import serializers
from .models import BlogPost


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            'id', 'slug', 'title_uz', 'title_uz_cyr', 'title_ru',
            'content_uz', 'content_uz_cyr', 'content_ru',
            'excerpt_uz', 'excerpt_uz_cyr', 'excerpt_ru',
            'image_url', 'category', 'tags', 'is_published',
            'published_at', 'view_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'view_count', 'created_at', 'updated_at']


class BlogPostListSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            'id', 'slug', 'title_uz', 'title_uz_cyr', 'title_ru',
            'excerpt_uz', 'excerpt_uz_cyr', 'excerpt_ru',
            'image_url', 'category', 'tags', 'is_published',
            'published_at', 'view_count', 'created_at'
        ]
        read_only_fields = fields


class BlogPostCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            'title_uz', 'title_uz_cyr', 'title_ru',
            'content_uz', 'content_uz_cyr', 'content_ru',
            'excerpt_uz', 'excerpt_uz_cyr', 'excerpt_ru',
            'image_url', 'category', 'tags', 'is_published', 'published_at'
        ]
