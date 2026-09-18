<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Photo;
use App\Services\PhotoStorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class PhotoController extends Controller
{
    public function index(Request $request, Event $event)
    {
        $this->authorize('view', $event);

        return inertia('admin/photos/index',
            [
                'event' => $event,
                'photos' => $event->photos()->with('guest:id,uuid')
                    ->orderBy('created_at', $request->string('sort')->value() === 'oldest' ? 'asc' : 'desc')
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
        $data = $request->validate([
            'photos' => ['nullable', 'array'],
            'photos.*' => ['uuid'],
            'include_guest_deleted' => ['nullable', 'boolean'],
            'all' => ['nullable', 'boolean'],
        ]);
        $all = (bool) ($data['all'] ?? false);
        $ids = $data['photos'] ?? [];
        abort_unless($all || count($ids) > 0, 422, 'Wybierz co najmniej jedno zdjęcie.');
        $photos = $event->photos()
            ->when(! $all, fn ($query) => $query->whereIn('uuid', $ids))
            ->when($all && ! ($data['include_guest_deleted'] ?? false), fn ($query) => $query->whereNull('deleted_at'))
            ->get();
        abort_if($photos->isEmpty(), 422, 'Brak zdjęć do pobrania.');
        $zipPath = tempnam(sys_get_temp_dir(), 'event-').'.zip';
        $zip = new ZipArchive;
        abort_unless($zip->open($zipPath, ZipArchive::CREATE) === true, 500);
        foreach ($photos as $index => $photo) {
            $stream = Storage::disk(config('filesystems.default'))->readStream($photo->original_path);
            if ($stream) {
                $extension = pathinfo($photo->original_name, PATHINFO_EXTENSION);
                $filename = sprintf('%03d-%s.%s', $index + 1, str($photo->uuid)->substr(0, 12), $extension ?: 'file');
                $zip->addFromString($filename, stream_get_contents($stream));
                fclose($stream);
            }
        } $zip->close();

        return response()->download($zipPath, 'event-'.$event->uuid.'.zip')->deleteFileAfterSend();
    }

    public function destroySelected(Request $request, Event $event, PhotoStorageService $storage): RedirectResponse
    {
        $this->authorize('view', $event);
        $ids = $request->validate(['photos' => ['required', 'array', 'min:1'], 'photos.*' => ['uuid']])['photos'];
        $photos = $event->photos()->whereIn('uuid', $ids)->get();

        foreach ($photos as $photo) {
            $this->authorize('delete', $photo);
            $storage->permanentlyDelete($photo);
        }

        return back()->with('success', 'Wybrane zdjęcia usunięto trwale.');
    }
}
