<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Photo;
use App\Services\PhotoStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class PhotoController extends Controller
{
    public function index(Event $event)
    {
        $this->authorize('view', $event);

        return inertia('admin/photos/index',
            [
                'event' => $event,
                'photos' => $event->photos()->with('guest:id,uuid')
                    ->latest()
                    ->paginate(36)
                    ->through(fn ($photo) => [
                        'uuid' => $photo->uuid,
                        'thumbnail' => route('admin.photos.file', [$event, $photo, 'thumbnail']),
                        'preview' => route('admin.photos.file', [$event, $photo, 'preview']),
                        'deletedAt' => $photo->deleted_at?->toIso8601String(),
                        'createdAt' => $photo->created_at->toIso8601String(),
                        'guest' => $photo->guest->uuid,
                    ]
                    ),
            ]
        );
    }

    public function file(Event $event, Photo $photo, string $variant)
    {
        $this->authorize('view', $photo);
        abort_unless($photo->event_id === $event->id, 404);
        $path = match ($variant) {
            'thumbnail' => $photo->thumbnail_path ?: $photo->original_path,
            'preview' => $photo->preview_path ?: $photo->original_path,default => $photo->original_path
        };

        return Storage::disk(config('filesystems.default'))->response($path, null, ['Content-Type' => $photo->mime_type]);
    }

    public function download(Event $event, Photo $photo)
    {
        $this->authorize('view', $photo);
        abort_unless($photo->event_id === $event->id, 404);

        return Storage::disk(config('filesystems.default'))->download($photo->original_path, $photo->original_name);
    }

    public function destroy(Event $event, Photo $photo, PhotoStorageService $storage)
    {
        $this->authorize('delete', $photo);
        abort_unless($photo->event_id === $event->id, 404);
        $storage->permanentlyDelete($photo);

        return back()->with('success', 'Zdjęcie usunięte trwale.');
    }

    public function zip(Request $request, Event $event)
    {
        $this->authorize('view', $event);
        $ids = $request->validate(['photos' => ['nullable', 'array'], 'photos.*' => ['uuid']])['photos'] ?? [];
        $photos = $event->photos()->when($ids, fn ($q) => $q->whereIn('uuid', $ids))->get();
        abort_if($photos->isEmpty(), 422, 'Brak zdjęć do pobrania.');
        $zipPath = tempnam(sys_get_temp_dir(), 'event-').'.zip';
        $zip = new ZipArchive;
        abort_unless($zip->open($zipPath, ZipArchive::CREATE) === true, 500);
        foreach ($photos as $photo) {
            $stream = Storage::disk(config('filesystems.default'))->readStream($photo->original_path);
            if ($stream) {
                $zip->addFromString($photo->original_name, stream_get_contents($stream));
                fclose($stream);
            }
        } $zip->close();

        return response()->download($zipPath, 'event-'.$event->uuid.'.zip')->deleteFileAfterSend();
    }
}
