<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventAppearanceRequest;
use App\Models\Event;
use App\Models\EventGuest;
use App\Models\Photo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function dashboard(): Response
    {
        $this->authorize('viewAny', Event::class);
        $events = $this->accessibleEvents();

        return Inertia::render('dashboard', [
            'stats' => [
                'events' => (clone $events)->count(),
                'activeEvents' => (clone $events)->where('status', 'active')->count(),
                'photos' => Photo::query()->whereIn('event_id', $events->select('id'))->count(),
                'guests' => EventGuest::query()->whereIn('event_id', $events->select('id'))->count(),
                'guestDeletedPhotos' => Photo::query()->whereIn('event_id', $events->select('id'))->whereNotNull('deleted_at')->count(),
            ],
        ]);
    }

    public function index(): Response
    {
        $this->authorize('viewAny', Event::class);
        $events = $this->accessibleEvents()->withCount(['photos', 'guests', 'photos as deleted_photos_count' => fn ($q) => $q->whereNotNull('deleted_at')])->latest()->get();

        return Inertia::render('admin/events/index',
            [
                'events' => $events,
            ]
        );
    }

    private function accessibleEvents(): Builder
    {
        return Event::query()->when(! auth()->user()->hasRole('superadmin'), fn ($query) => $query->whereHas('administrators', fn ($users) => $users->whereKey(auth()->id())));
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $file = $request->file('image');

        // defensive: if validated data contains image but no uploaded file, remove it so we don't overwrite DB
        if (! $file && array_key_exists('image', $data)) {
            unset($data['image']);
        }

        // remove file from mass-assigned data as it needs special handling
        if ($file) {
            unset($data['image']);
        }

        $event = Event::create($data);

        if ($file) {
            $extension = Str::lower($file->guessExtension() ?: $file->extension());
            $path = $file->storeAs('events/'.$event->uuid.'/settings_images', Str::uuid().'.'.$extension, config('filesystems.default'));
            $event->update(['image' => $path]);
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
                'backgroundUrl' => route('events.background', $event),
            ]
        );
    }

    public function update(UpdateEventAppearanceRequest $request, Event $event): RedirectResponse
    {
        $data = $request->validated();
        $file = $request->file('image');

        // defensive: if validated data contains image but no uploaded file, remove it so we don't overwrite DB
        if (! $file && array_key_exists('image', $data)) {
            unset($data['image']);
        }

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $extension = Str::lower($file->guessExtension() ?: $file->extension());
            $path = $file->storeAs('events/'.$event->uuid.'/settings_images', Str::uuid().'.'.$extension, config('filesystems.default'));
            $data['image'] = $path;
        }

        $event->update($data);

        return back()->with('success', 'Konfiguracja wydarzenia zapisana.');
    }
}
