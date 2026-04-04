"""
Question and Topic models.
"""
from django.db import models


class Difficulty(models.TextChoices):
    EASY = 'EASY', 'Oson'
    MEDIUM = 'MEDIUM', 'O\'rtacha'
    HARD = 'HARD', 'Qiyin'


class Topic(models.Model):
    """Topic model."""
    
    name_uz = models.CharField(max_length=255)
    name_uz_cyr = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    order_index = models.IntegerField(default=0)
    questions_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'topics'
        verbose_name = 'Mavzu'
        verbose_name_plural = 'Mavzular'
        ordering = ['order_index']
    
    def __str__(self):
        return self.name_uz
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update questions count
        self.questions_count = self.questions.filter(is_active=True).count()


class Question(models.Model):
    """Question model."""
    
    text_uz = models.TextField()
    text_uz_cyr = models.TextField()
    text_ru = models.TextField()
    image_url = models.CharField(max_length=500, null=True, blank=True)
    explanation_uz = models.TextField(null=True, blank=True)
    explanation_uz_cyr = models.TextField(null=True, blank=True)
    explanation_ru = models.TextField(null=True, blank=True)
    audio_url_uz = models.CharField(max_length=500, null=True, blank=True)
    audio_url_ru = models.CharField(max_length=500, null=True, blank=True)
    
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='questions')
    difficulty = models.CharField(
        max_length=10,
        choices=Difficulty.choices,
        default=Difficulty.MEDIUM
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'questions'
        verbose_name = 'Savol'
        verbose_name_plural = 'Savollar'
        ordering = ['id']
    
    def __str__(self):
        return f"Q#{self.id} - {self.text_uz[:50]}..."


class Answer(models.Model):
    """Answer model."""
    
    text_uz = models.CharField(max_length=500)
    text_uz_cyr = models.CharField(max_length=500)
    text_ru = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    order_index = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'answers'
        verbose_name = 'Javob'
        verbose_name_plural = 'Javoblar'
        ordering = ['order_index']
    
    def __str__(self):
        return f"{'✓' if self.is_correct else '✗'} {self.text_uz[:50]}"
