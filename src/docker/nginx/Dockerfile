FROM nginx:latest

RUN apt-get update && apt-get install -y openssl \
    && mkdir -p /etc/nginx/ssl \
    && openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/localhost.key \
        -out /etc/nginx/ssl/localhost.crt \
        -subj "/C=EG/ST=Cairo/L=Cairo/O=WaterManagement/OU=Dev/CN=localhost/UID=water_management" \
    && rm -rf /var/lib/apt/lists/*

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY ./src/docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy frontend static files
COPY ./src/frontend /usr/share/nginx/html

