from rest_framework import serializers
from .models import RoadSign


class RoadSignSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = RoadSign
        fields = [
            'id', 'code', 'name_uz', 'name_uz_cyr', 'name_ru',
            'desc_uz', 'desc_uz_cyr', 'desc_ru',
            'image_url', 'category', 'category_display', 'order_index'
        ]
        read_only_fields = ['id']


class RoadSignListSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = RoadSign
        fields = [
            'id', 'code', 'name_uz', 'name_uz_cyr', 'name_ru',
            'image_url', 'category', 'category_display', 'order_index'
        ]
        read_only_fields = fields
