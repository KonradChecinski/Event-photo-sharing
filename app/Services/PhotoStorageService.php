<?php

namespace App\Services;

use App\Models\EventGuest;
use App\Models\Photo;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class PhotoStorageService
{
    private const THUMBNAIL_MAX_EDGE = 480;
    private const PREVIEW_MAX_EDGE = 1920;



    public function store(EventGuest $guest, UploadedFile $file): Photo
    {
        /** @var Filesystem $disk */
        $disk = Storage::disk(config('filesystems.default'));
        $extension = Str::lower($file->guessExtension() ?: $file->extension());
        $base = 'events/'.$guest->event->uuid;
        $originalPath = $file->storeAs($base.'/originals', Str::uuid().'.'.$extension, config('filesystems.default'));

        try {
            [$thumbnailPath, $previewPath, $width, $height] = $this->createDerivatives($disk, $file, $base);
        } catch (\Throwable $exception) {
            $disk->delete($originalPath);

            throw $exception;
        }

        return Photo::create([
            'event_id' => $guest->event_id,
            'event_guest_id' => $guest->id,
            'original_name' => Str::limit($file->getClientOriginalName(), 255, ''),
            'original_path' => $originalPath,
            'thumbnail_path' => $thumbnailPath,
            'preview_path' => $previewPath,
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'file_size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
        ]);
    }

    /** @return array{0: string, 1: string, 2: int, 3: int} */
    private function createDerivatives(Filesystem $disk, UploadedFile $file, string $base): array
    {
        $source = $this->isHeic($file) ? $this->imagickSource($file) : $this->gdSource($file);
        $width = imagesx($source);
        $height = imagesy($source);
        $name = (string) Str::uuid().'.jpg';
        $thumbnailPath = $base.'/thumbnails/'.$name;
        $previewPath = $base.'/previews/'.$name;

        try {
            $disk->put($thumbnailPath, $this->encodeJpeg($source, self::THUMBNAIL_MAX_EDGE, 82));
            $disk->put($previewPath, $this->encodeJpeg($source, self::PREVIEW_MAX_EDGE, 88));
        } finally {
            imagedestroy($source);
        }

        return [$thumbnailPath, $previewPath, $width, $height];
    }

    private function gdSource(UploadedFile $file): \GdImage
    {
        $contents = file_get_contents($file->getRealPath());
        $source = $contents === false ? false : @imagecreatefromstring($contents);

        if (! $source instanceof \GdImage) {
            throw new RuntimeException('Przesłany plik nie jest prawidłowym obrazem.');
        }

        return $source;
    }

    private function imagickSource(UploadedFile $file): \GdImage
    {
        if (! class_exists(\Imagick::class)) {
            throw new RuntimeException('Przesyłanie HEIC/HEIF wymaga rozszerzenia Imagick z obsługą libheif na serwerze.');
        }

        $image = new \Imagick($file->getRealPath());
        $image->setImageFormat('jpeg');
        $blob = $image->getImagesBlob();
        $image->clear();
        $image->clear();
        $source = imagecreatefromstring($blob);

        if (! $source instanceof \GdImage) {
            throw new RuntimeException('Nie udało się przekonwertować obrazu HEIC/HEIF.');
        }

        return $source;
    }

    private function isHeic(UploadedFile $file): bool
    {
        return in_array(Str::lower($file->guessExtension() ?: $file->extension()), ['heic', 'heif'], true);
    }

    private function encodeJpeg(\GdImage $source, int $maxEdge, int $quality): string
    {
        $width = imagesx($source);
        $height = imagesy($source);
        $scale = min(1, $maxEdge / max($width, $height));
        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));
        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
        $background = imagecolorallocate($canvas, 255, 255, 255);
        imagefill($canvas, 0, 0, $background);
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

        ob_start();
        imagejpeg($canvas, null, $quality);
        $encoded = ob_get_clean();
        imagedestroy($canvas);

        if (! is_string($encoded)) {
            throw new RuntimeException('Nie udało się wygenerować podglądu zdjęcia.');
        }

        return $encoded;
    }

    public function permanentlyDelete(Photo $photo): void
    {
        Storage::disk(config('filesystems.default'))->delete(array_filter([
            $photo->original_path,
            $photo->thumbnail_path,
            $photo->preview_path,
        ]));
        $photo->delete();
    }
}
