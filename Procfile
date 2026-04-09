# Procfile for Railway deployment (Django)

web: python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --log-level info
