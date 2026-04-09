FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only Python project files (no Node.js)
COPY config/ config/
COPY core/ core/
COPY apps/__init__.py apps/__init__.py
COPY apps/api_urls.py apps/api_urls.py
COPY apps/accounts/ apps/accounts/
COPY apps/achievements/ apps/achievements/
COPY apps/admin_panel/ apps/admin_panel/
COPY apps/blog/ apps/blog/
COPY apps/files_app/ apps/files_app/
COPY apps/health/ apps/health/
COPY apps/leaderboard/ apps/leaderboard/
COPY apps/notifications/ apps/notifications/
COPY apps/octagon/ apps/octagon/
COPY apps/questions/ apps/questions/
COPY apps/signs/ apps/signs/
COPY apps/smart_test/ apps/smart_test/
COPY apps/stats/ apps/stats/
COPY apps/subscriptions/ apps/subscriptions/
COPY apps/tests/ apps/tests/
COPY apps/tickets/ apps/tickets/
COPY apps/users/ apps/users/
COPY manage.py .
COPY scripts/ scripts/

# Create necessary directories
RUN mkdir -p staticfiles media logs static templates

# Collect static files
RUN SECRET_KEY=build-placeholder python manage.py collectstatic --noinput 2>/dev/null || true

# Expose port (Railway sets PORT env variable)
EXPOSE ${PORT:-8000}

# Start command - Railway provides PORT env variable
CMD python manage.py migrate --noinput && \
    (python scripts/ensure_superuser.py || true) && \
    gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 4 --threads 2 --log-level info
