#!/bin/sh
set -e

echo "Waiting for Postgres..."
while ! nc -z $POSTGRES_HOST 5432; do
  sleep 0.1
done
echo "Postgres is up"

# Apply migrations and collect static files
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

# Create admin if not exists
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

# Start Gunicorn server
exec gunicorn water_website.wsgi:application --bind 0.0.0.0:8000
