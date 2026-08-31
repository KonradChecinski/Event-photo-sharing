# Instrukcja Wdrożenia i Aktualizacji (Laravel + React + Docker na Windows)

## 📌 Jak wykonywać komendy w tym środowisku?

Ponieważ cała aplikacja PHP działa wewnątrz izolowanego kontenera Dockera (`laravel_app`), **nie wpisujesz** poleceń bezpośrednio w zwykłym oknie PowerShell.

- **Złe podejście:** `php artisan migrate` (PowerShell na serwerze nie wie, czym jest PHP, bo PHP żyje wewnątrz kontenera).
- **Dobrze (Właściwe podejście):** Przed każdą komendą Laravela musisz dopisać przedrostek wywołujący ją w kontenerze:

  ```powershell
  docker compose exec app php artisan [nazwa-komendy]
  ```

  *(Słowo `app` to nazwa naszej usługi PHP w pliku `docker-compose.yml`).*

Dla paczek Node.js / npm (które budujemy na Windowsie) komendy wykonujesz normalnie:

```powershell
npm install
npm run build
```

## CZĘŚĆ A: Pliki konfiguracyjne (Twój projekt lokalny)

W głównym folderze projektu na swoim komputerze (`D:\EventPix\`) utwórz lub upewnij się, że masz następujące pliki:

### 1. `docker/php/php.ini`

```ini
upload_max_filesize = 64M
post_max_size = 64M
memory_limit = 256M
max_execution_time = 300
```

### 2. `docker/php/Dockerfile`

```dockerfile
FROM php:8.5-fpm

# Instalacja bibliotek bazowych (w tym HEIF/HEIC dla Imagick)
RUN apt-get update && apt-get install -y \
    libheif-dev \
    heif-gdk-pixbuf \
    git \
    unzip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalacja rozszerzeń przez mlocati installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

RUN install-php-extensions \
    pdo_mysql \
    zip \
    opcache \
    gd \
    imagick \
    @composer

WORKDIR /var/www

EXPOSE 9000
CMD ["php-fpm"]
```

### 3. `docker/nginx/default.conf`

```nginx
server {
    listen 80;
    index index.php index.html;
    error_log  /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;
    root /var/www/public;

    client_max_body_size 64M;

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
        gzip_static on;
    }
}
```

### 4. `docker-compose.yml`

```yaml
services:
  app:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    container_name: laravel_app
    shm_size: '1gb'
    restart: unless-stopped
    volumes:
      - .:/var/www
      - ./docker/php/php.ini:/usr/local/etc/php/conf.d/custom.ini
    networks:
      - laravel_network

  web:
    image: nginx:alpine
    container_name: laravel_nginx
    restart: unless-stopped
    ports:
      - "8000:80"
    volumes:
      - .:/var/www
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    networks:
      - laravel_network

  db:
    image: mysql:8.0
    container_name: laravel_db
    restart: unless-stopped
    command: --default-authentication-plugin=mysql_native_password
    env_file:
      - .env
    environment:
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - dbdata:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - laravel_network

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: laravel_phpmyadmin
    restart: unless-stopped
    environment:
      PMA_HOST: db
      PMA_ARBITRARY: 0
      UPLOAD_LIMIT: 64M
    ports:
      - "8080:80"
    depends_on:
      - db
    networks:
      - laravel_network

networks:
  laravel_network:
    driver: bridge

volumes:
  dbdata:
    driver: local
```

### Wypchnij zmiany na GitHuba

```bash
git add .
git commit -m "Konfiguracja produkcyjna Docker"
git push origin main
```

## CZĘŚĆ B: Pierwsze uruchomienie na Serwerze

### 1. **Pobranie projektu**

Otwórz PowerShell na serwerze i pobierz kod:

```powershell
git clone git@github.com:twoj-user/twoje-repo.git .
```

### 2. **Konfiguracja pliku `.env`**

Skopiuj `.env.example` do `.env`.

**Ważne:** Jeśli Twoje hasło do bazy zawiera specjalne znaki lub chcesz uniknąć błędów parsowania, otocz je cudzysłowem:

```ini
APP_ENV=production
APP_DEBUG=false

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=event_photos
DB_USERNAME=root
DB_PASSWORD="Webitup123"
```

### 3. **Uruchomienie kontenerów**

```powershell
docker compose up -d --build
```

### 4. **Inicjalizacja środowiska wewnątrz Dockera**

Wykonaj te komendy krok po kroku:

```powershell
# Utworzenie katalogów tymczasowych
docker compose exec app mkdir -p bootstrap/cache storage/framework/sessions storage/framework/views storage/framework/cache storage/logs
docker compose exec app chmod -R 777 bootstrap/cache storage

# Instalacja paczek PHP
docker compose exec app composer install --optimize-autoloader --no-dev

# Klucz, link do storage i migracje
docker compose exec app php artisan key:generate
docker compose exec app php artisan storage:link
docker compose exec app php artisan wayfinder:generate
docker compose exec app php artisan migrate --force
```

### 5. **Budowanie frontendu (Natywnie na Windows)**

```powershell
npm install
npm run build
```

### 6. **Optymalizacja cache**

```powershell
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache
```

## CZĘŚĆ C: Jak przeprowadzać aktualizacje? (Skrypt `deploy.ps1`)

Gdy napiszesz nową funkcję na swoim komputerze i zrobisz `git push`, aktualizacja na serwerze sprowadza się do uruchomienia jednego skryptu.

Utwórz w głównym folderze projektu na serwerze plik o nazwie **`deploy.ps1`** i wklej do niego ten kod:

```powershell
Write-Host "1. Pobieranie nowosci z GitHuba..." -ForegroundColor Cyan
git pull origin main

Write-Host "2. Aktualizacja pakietow PHP (w Dockerze)..." -ForegroundColor Cyan
docker compose exec app composer install --optimize-autoloader --no-dev

Write-Host "3. Kompilacja Frontendu React/Vite (Natywnie na Windows)..." -ForegroundColor Cyan
npm install
npm run build

Write-Host "4. Uruchamianie migracji bazy danych..." -ForegroundColor Cyan
docker compose exec app php artisan wayfinder:generate
docker compose exec app php artisan migrate --force

Write-Host "5. Czyszczenie i optymalizacja Cache..." -ForegroundColor Cyan
docker compose exec app php artisan optimize:clear
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache

Write-Host "SUKCES! Aplikacja zostala zaktualizowana." -ForegroundColor Green
```

### Jak z niego korzystać?

Przy każdej przyszłej aktualizacji wchodzisz na serwer w PowerShell i wpisujesz po prostu:

```powershell
.\deploy.ps1
```
