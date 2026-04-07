"""
Blog models.
"""
from django.db import models
from django.utils.text import slugify


class BlogPost(models.Model):
    """Blog post model."""
    
    slug = models.SlugField(max_length=255, unique=True)
    title_uz = models.CharField(max_length=500)
    title_uz_cyr = models.CharField(max_length=500)
    title_ru = models.CharField(max_length=500)
    content_uz = models.TextField()
    content_uz_cyr = models.TextField()
    content_ru = models.TextField()
    excerpt_uz = models.TextField(null=True, blank=True)
    excerpt_uz_cyr = models.TextField(null=True, blank=True)
    excerpt_ru = models.TextField(null=True, blank=True)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    category = models.CharField(max_length=100)
    tags = models.JSONField(default=list)  # Array of tags
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'blog_posts'
        verbose_name = 'Blog post'
        verbose_name_plural = 'Blog postlar'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title_uz
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title_uz)
        super().save(*args, **kwargs)
    
    def increment_views(self):
        self.view_count += 1
        self.save(update_fields=['view_count'])
