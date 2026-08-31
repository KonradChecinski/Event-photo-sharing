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
