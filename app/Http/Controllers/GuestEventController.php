<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Photo;
use App\Services\EventGuestIdentity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class GuestEventController extends Controller
{
    public function show(Request $request, Event $event, EventGuestIdentity $identity): Response
    {
        abort_unless($event->status !== 'draft', 404);

        [$guest, $cookie] = $identity->resolve($request, $event);

        $response = Inertia::render('event/show', [
            'event' => [
                'uuid' => $event->uuid,
                'name' => $event->name,
                'status' => $event->status,
                'welcomeTitle' => $event->welcome_title ?: 'Witaj!',
                'welcomeText' => $event->welcome_text ?: 'Podziel się zdjęciami z tego wyjątkowego wydarzenia.',
                'colors' => [
                    'primary' => $event->primary_color,
                    'secondary' => $event->secondary_color,
                    'text' => $event->text_color,
                    'background' => $event->background_color,
                ],
                'images' => [
//                    'hero' => $event->hero_image ? route('events.hero', $event) : null,
                    'welcome' => $event->welcome_image ? route('events.welcome', $event) : null,
//                    'logo' => $event->logo ? route('events.logo', $event) : null,
                ],
            ],
            'photos' => Inertia::scroll(
                $guest->photos()
                    ->whereNull('deleted_at')
                    ->latest()
                    ->paginate(24)
                    ->through(fn (Photo $photo): array => $this->photoData($photo)),
            ),
        ])->toResponse($request);

        if ($cookie) {
            $response->headers->setCookie($cookie);
        }

        return $response;
    }

    /** @return array{uuid: string, thumbnail: string, preview: string, createdAt: string} */
    private function photoData(Photo $photo): array
    {
        return [
            'uuid' => $photo->uuid,
            'thumbnail' => route('guest.photos.thumbnail', $photo),
            'preview' => route('guest.photos.preview', $photo),
            'createdAt' => $photo->created_at->toIso8601String(),
        ];
    }

    public function welcome(Request $request, Event $event, EventGuestIdentity $identity)
    {
        // ensure the event is visible to guests
        abort_unless($event->status !== 'draft', 404);

        // resolve guest identity (ensures access and may set a cookie)
        [$guest, $cookie] = $identity->resolve($request, $event);

        // ensure we have a welcome image path
        abort_unless($event->welcome_image, 404);

        $disk = Storage::disk(config('filesystems.default'));
        $path = $event->welcome_image;

        abort_unless($disk->exists($path), 404);

        $mimeType = null;
        try {
            $mimeType = $disk->mimeType($path);
        } catch (\Throwable $e) {
            // ignore and fallback
        }

        $response = $disk->response($path, null, ['Content-Type' => $mimeType ?? 'image/jpeg']);

        if ($cookie) {
            $response->headers->setCookie($cookie);
        }

        return $response;
    }
}
