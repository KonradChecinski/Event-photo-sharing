<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventAppearanceRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::query()->when(! auth()->user()->hasRole('superadmin'), fn ($q) => $q->whereHas('administrators', fn ($users) => $users->whereKey(auth()->id())))->withCount(['photos', 'guests', 'photos as deleted_photos_count' => fn ($q) => $q->whereNotNull('deleted_at')])->latest()->get();

        return Inertia::render('admin/events/index',
            [
                'events' => $events,
            ]
        );
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $file = $request->file('welcome_image');

        // remove file from mass-assigned data as it needs special handling
        if ($file) {
            unset($data['welcome_image']);
        }

        $event = Event::create($data);

        if ($file) {
            $extension = Str::lower($file->guessExtension() ?: $file->extension());
            $path = $file->storeAs('events/'.$event->uuid.'/settings_images', Str::uuid().'.'.$extension, config('filesystems.default'));
            $event->update(['welcome_image' => $path]);
        }

        return to_route('admin.events.index')->with('success', 'Wydarzenie utworzone.');
    }

    public function show(Event $event): Response
    {
        $this->authorize('view', $event);

        return Inertia::render('admin/events/show',
            [
                'event' => $event,
                'stats' => [
                    'photos' => $event->photos()->count(),
                    'guests' => $event->guests()->count(),
                    'deletedPhotos' => $event->photos()->whereNotNull('deleted_at')->count(),
                ],
                'eventUrl' => route('events.show', $event),
            ]
        );
    }

    public function update(UpdateEventAppearanceRequest $request, Event $event): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('welcome_image')) {
            $file = $request->file('welcome_image');
            $extension = Str::lower($file->guessExtension() ?: $file->extension());
            $path = $file->storeAs('events/'.$event->uuid.'/settings_images', Str::uuid().'.'.$extension, config('filesystems.default'));
            $data['welcome_image'] = $path;
        }

        $event->update($data);

        return back()->with('success', 'Konfiguracja wydarzenia zapisana.');
    }
}
