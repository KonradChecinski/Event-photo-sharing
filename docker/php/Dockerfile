FROM php:8.5-fpm

# Instalacja zależności systemowych, w tym bibliotek pod Imagick (z obsługą formatów HEIF/HEIC z urządzeń Apple)
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libmagickwand-dev \
    libheif-dev \
    heif-gdk-pixbuf \
    unzip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalacja Node.js (v20) do budowania assetów React/Vite wewnątrz kontenera
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Instalacja i włączenie rozszerzeń PHP (Imagick, GD, PDO MySQL, Zip, OPcache)
RUN pecl install imagick \
    && docker-php-ext-enable imagick \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql gd zip opcache

# Instalacja Composera
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
