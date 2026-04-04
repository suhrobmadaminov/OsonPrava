from django.urls import path, include

urlpatterns = [
    # Auth
    path('auth/', include('apps.accounts.urls')),
    
    # Users
    path('', include('apps.users.urls')),
    
    # Content
    path('', include('apps.questions.urls')),
    path('', include('apps.tickets.urls')),
    
    # Tests
    path('', include('apps.tests.urls')),
    path('', include('apps.smart_test.urls')),
    
    # Octagon
    path('octagon/', include('apps.octagon.urls')),
    
    # Stats & Leaderboard
    path('', include('apps.stats.urls')),
    path('', include('apps.leaderboard.urls')),
    
    # Achievements
    path('', include('apps.achievements.urls')),
    
    # Subscriptions
    path('', include('apps.subscriptions.urls')),
    
    # Blog
    path('', include('apps.blog.urls')),
    
    # Road Signs
    path('', include('apps.signs.urls')),
    
    # Notifications
    path('', include('apps.notifications.urls')),
    
    # Admin Panel API
    path('admin/', include('apps.admin_panel.urls')),
]
