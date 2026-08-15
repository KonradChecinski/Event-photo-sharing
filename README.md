# Event Photo Sharing

Laravel 13 + Inertia React application for collecting event photos without guest accounts.

## Start

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run dev
```

Use `php artisan serve` in a separate terminal. The seeded accounts are `admin@example.test` and `event-admin@example.test`; change the seeded development passwords before deploying.

## Architecture and security

- Guests enter `/e/{event-uuid}`. A new device receives a random HttpOnly, SameSite=Lax cookie; only its SHA-256 hash is stored in `event_guests`.
- `events`, `event_guests`, and `photos` use UUID route identifiers. UUIDs are never used as authorization.
- All media are stored on the configured default Laravel disk under `events/{event-uuid}` and streamed through authorized controller endpoints. Nothing is exposed through `/storage`.
- Guests can only list, stream, or soft-delete their own photos. Event admins are scoped with the `event_user` pivot; superadmins use Spatie roles and permissions.
- Guest uploads are limited to 20 MB per file, up to 50 per request, with MIME/extension validation and route rate limits. Finished/inactive events cannot accept uploads.
- Original files are retained; thumbnail/preview copies are created. Production HEIC/HEIF preview conversion requires an image processor with HEIC support (for example Imagick/libheif); configure it at server level before enabling this format for browser previews.

## Commands

```bash
php artisan test --compact
php artisan wayfinder:generate --with-form --no-interaction
npm run build
```

For MySQL/MariaDB set the usual `DB_*` values in `.env`; local development may use the included SQLite database. Ensure PHP has ZipArchive enabled for multi-photo ZIP downloads and that the configured storage disk is private and writable.
