"""OsonPrava URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

# Swagger/OpenAPI documentation
schema_view = get_schema_view(
    openapi.Info(
        title="OsonPrava API",
        default_version='v1',
        description="O'zbekiston PDD o'quv platformasi API",
        terms_of_service="https://osonprava.uz/terms/",
        contact=openapi.Contact(email="contact@osonprava.uz"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),

    # Favicon
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.ico', permanent=True)),

    # API v1 - Auth & Users
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/users/', include('apps.users.urls')),

    # API v1 - Content Modules
    path('api/v1/questions/', include('apps.questions.urls')),
    path('api/v1/tickets/', include('apps.tickets.urls')),
    path('api/v1/tests/', include('apps.tests.urls')),
    path('api/v1/smart-test/', include('apps.smart_test.urls')),
    path('api/v1/octagon/', include('apps.octagon.urls')),
    path('api/v1/leaderboard/', include('apps.leaderboard.urls')),
    path('api/v1/achievements/', include('apps.achievements.urls')),
    path('api/v1/subscriptions/', include('apps.subscriptions.urls')),
    path('api/v1/blog/', include('apps.blog.urls')),
    path('api/v1/signs/', include('apps.signs.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/stats/', include('apps.stats.urls')),
    path('api/v1/admin/', include('apps.admin_panel.urls')),
    path('api/v1/health/', include('apps.health.urls')),
    path('api/v1/files/', include('apps.files_app.urls')),

    # Swagger documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
