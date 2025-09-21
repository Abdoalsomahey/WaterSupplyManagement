#!/bin/sh
set -e

# ----------------------------------
# Wait for Postgres
# ----------------------------------
echo "Waiting for Postgres at $POSTGRES_HOST:5432..."
while ! nc -z $POSTGRES_HOST 5432; do
  sleep 0.1
done
echo "Postgres is up!"

# ----------------------------------
# Wait for Redis (optional)
# ----------------------------------
echo "Waiting for Redis at $REDIS_HOST:6379..."
while ! nc -z $REDIS_HOST 6379; do
  sleep 0.1
done
echo "Redis is up!"

# ----------------------------------
# Apply migrations & collect static files
# ----------------------------------
echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

# ----------------------------------
# Create superuser if not exists
# ----------------------------------
python - <<END
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'water_website.settings')
django.setup()
from django.contrib.auth import get_user_model

User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        role='admin'
    )
    print("Superuser 'admin' created.")
else:
    print("Superuser 'admin' already exists.")
END

# ----------------------------------
# Execute the command passed to container
# (web: gunicorn, worker: celery worker, beat: celery beat)
# ----------------------------------
exec "$@"