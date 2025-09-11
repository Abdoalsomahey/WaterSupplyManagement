FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=water_website.settings

WORKDIR /water_app

COPY ./backend/requirements.txt /water_app/

RUN apt-get update && apt-get install -y \
    netcat-traditional gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt


COPY ./backend /water_app/


COPY ./docker/backend_docker/entrypoint.sh /water_app/entrypoint.sh
RUN chmod +x /water_app/entrypoint.sh


ENTRYPOINT ["/water_app/entrypoint.sh"]
