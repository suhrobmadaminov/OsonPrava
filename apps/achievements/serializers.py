from rest_framework import serializers
from .models import Achievement, UserAchievement


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = [
            'id', 'key', 'name_uz', 'name_uz_cyr', 'name_ru',
            'desc_uz', 'desc_uz_cyr', 'desc_ru',
            'icon_url', 'condition', 'points', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement_name_uz = serializers.CharField(source='achievement.name_uz', read_only=True)
    achievement_icon_url = serializers.CharField(source='achievement.icon_url', read_only=True)
    achievement_points = serializers.IntegerField(source='achievement.points', read_only=True)

    class Meta:
        model = UserAchievement
        fields = ['id', 'user', 'achievement', 'achievement_name_uz', 'achievement_icon_url', 'achievement_points', 'unlocked_at']
        read_only_fields = ['id', 'unlocked_at']


class UserAchievementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAchievement
        fields = ['user', 'achievement']
