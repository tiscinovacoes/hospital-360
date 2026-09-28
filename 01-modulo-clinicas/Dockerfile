# STAGE 1: Builder / PHP-FPM 8.2 Otimizado
FROM php:8.2-fpm-alpine AS base

RUN apk add --no-libc6-compat nginx supervisor curl \
    libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev mariadb-client \
    && docker-php-ext-configure geometry --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql gd zip opcache

WORKDIR /var/www/html

# Hardening: Usuário não-root www-data
COPY --chown=www-data:www-data . /var/www/html

# Configuração Nginx & Supervisor
COPY config/nginx.conf /etc/nginx/nginx.conf
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8081/health || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
