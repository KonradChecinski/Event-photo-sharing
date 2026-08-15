<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventAppearanceRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::query()->when(! auth()->user()->hasRole('superadmin'), fn ($q) => $q->whereHas('administrators', fn ($users) => $users->whereKey(auth()->id())))->withCount(['photos', 'guests', 'photos as deleted_photos_count' => fn ($q) => $q->whereNotNull('deleted_at')])->latest()->get();

        return Inertia::render('admin/events/index',
            [
                'events' => $events
            ]
        );
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $event = Event::create($request->validated());

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
                    'deletedPhotos' => $event->photos()->whereNotNull('deleted_at')->count()
                ],
                'eventUrl' => route('events.show', $event)
            ]
        );
    }

    public function update(UpdateEventAppearanceRequest $request, Event $event): RedirectResponse
    {
        $event->update($request->validated());

        return back()->with('success', 'Konfiguracja wydarzenia zapisana.');
    }
}
