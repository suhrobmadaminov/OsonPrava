"""
Road Sign models.
"""
from django.db import models


class SignCategory(models.TextChoices):
    WARNING = 'WARNING', 'Ogohlantiruvchi'
    PRIORITY = 'PRIORITY', 'Imtiyoz'
    PROHIBITION = 'PROHIBITION', 'Taqiqlovchi'
    MANDATORY = 'MANDATORY', 'Majburiy'
    SPECIAL = 'SPECIAL', 'Maxsus'
    INFORMATION = 'INFORMATION', 'Ma\'lumot'
    SERVICE = 'SERVICE', 'Xizmat'
    ADDITIONAL = 'ADDITIONAL', 'Qo\'shimcha'


class RoadSign(models.Model):
    """Road sign model."""
    
    code = models.CharField(max_length=50, unique=True)
    name_uz = models.CharField(max_length=255)
    name_uz_cyr = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255)
    desc_uz = models.TextField()
    desc_uz_cyr = models.TextField()
    desc_ru = models.TextField()
    image_url = models.CharField(max_length=500)
    category = models.CharField(max_length=20, choices=SignCategory.choices)
    order_index = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'road_signs'
        verbose_name = 'Yo\'l belgisi'
        verbose_name_plural = 'Yo\'l belgilari'
        ordering = ['order_index']
    
    def __str__(self):
        return f"{self.code} - {self.name_uz}"
