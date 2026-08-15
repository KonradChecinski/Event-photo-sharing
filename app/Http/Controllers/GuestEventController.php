<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Photo;
use App\Services\EventGuestIdentity;
use Illuminate\Http\Request;
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
}
