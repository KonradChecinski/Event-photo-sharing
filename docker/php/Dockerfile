FROM php:8.5-fpm

# Instalacja Node.js (v20) i bibliotek systemowych (w tym HEIF)
RUN apt-get update && apt-get install -y \
    libheif-dev \
    heif-gdk-pixbuf \
    git \
    unzip \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Pobranie instalatora rozszerzeń
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# Instalacja rozszerzeń PHP
RUN install-php-extensions \
    pdo_mysql \
    zip \
    opcache \
    gd \
    imagick \
    @composer

WORKDIR /var/www

# Wewnętrzny port PHP-FPM
EXPOSE 9000
CMD ["php-fpm"]
