<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGuestPhotosRequest;
use App\Models\Event;
use App\Models\Photo;
use App\Services\EventGuestIdentity;
use App\Services\PhotoStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GuestPhotoController extends Controller
{
    public function store(StoreGuestPhotosRequest $request, Event $event, EventGuestIdentity $identity, PhotoStorageService $storage)
    {
        [$guest,$cookie] = $identity->resolve($request, $event);
        $photos = [];

        foreach ($request->validated('photos') as $file) {
            try {
                $photos[] = $storage->store($guest->load('event'), $file)->uuid;
            } catch (\Throwable $exception) {
                report($exception);
            }
        } $response = back()->with('success', count($photos).' zdjęć zostało dodanych.');
        if ($cookie) {
            $response->withCookie($cookie);
        }

        return $response;
    }

    public function destroy(Request $request, Event $event, Photo $photo, EventGuestIdentity $identity)
    {
        [$guest] = $identity->resolve($request, $event);
        abort_unless($photo->event_id === $event->id && $photo->event_guest_id === $guest->id, 403);
        $photo->update(['deleted_at' => now()]);

        return back()->with('success', 'Zdjęcie zostało usunięte z Twojej galerii.');
    }

    public function file(Request $request, Photo $photo, EventGuestIdentity $identity, string $variant)
    {
        [$guest] = $identity->resolve($request, $photo->event);
        abort_unless($photo->event_guest_id === $guest->id, 403);
        $path = match ($variant) {
            'thumbnail' => $photo->thumbnail_path ?: $photo->original_path,
            'preview' => $photo->preview_path ?: $photo->original_path,default => $photo->original_path
        };
        abort_unless(Storage::disk(config('filesystems.default'))->exists($path), 404);

        $mimeType = in_array($variant, ['thumbnail', 'preview'], true) ? 'image/jpeg' : $photo->mime_type;

        return Storage::disk(config('filesystems.default'))->response($path, null, ['Content-Type' => $mimeType]);
    }
}
