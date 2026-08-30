FROM php:8.5-fpm

# 1. Instalacja Node.js (v20) oraz bibliotek bazowych dla HEIF/HEIC
RUN apt-get update && apt-get install -y \
    libheif-dev \
    heif-gdk-pixbuf \
    git \
    unzip \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 2. Pobranie niezawodnego instalatora rozszerzeń PHP (Standard Branżowy)
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# 3. Instalacja WSZYSTKICH wymaganych rozszerzeń i Composera jednym poleceniem!
# Narzędzie to samo pobierze libpng-dev, libjpeg-dev, libmagickwand-dev,
# skonfiguruje GD pod Freetype/JPEG, zbuduje Imagick i włączy Opcache.
RUN install-php-extensions \
    pdo_mysql \
    zip \
    opcache \
    gd \
    imagick \
    @composer

WORKDIR /var/www

# Wystawiamy port 8000 dla Twojego Nginx Proxy Managera
EXPOSE 8000

# Uruchamiamy serwer HTTP wbudowany w Laravela
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
