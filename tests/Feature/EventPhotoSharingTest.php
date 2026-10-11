<?php

use App\Models\Event;
use App\Models\EventGuest;
use App\Models\Photo;
use App\Models\User;
use App\Services\PhotoStorageService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

function guestCookie(Event $event, EventGuest $guest, string $token): array
{
    $guest->update(['token_hash' => hash('sha256', $token)]);

    return ['event_guest_'.$event->uuid => $token];
}

it('isolates a guest gallery and guest file access', function () {
    $event = Event::factory()->create();
    $guestA = EventGuest::factory()->for($event)->create();
    $guestB = EventGuest::factory()->for($event)->create();
    $photoA = Photo::factory()->for($event)->for($guestA, 'guest')->create();
    $photoB = Photo::factory()->for($event)->for($guestB, 'guest')->create();
    $token = 'guest-a-token';

    $this->withCookies(guestCookie($event, $guestA, $token))->get(route('events.show', $event))
        ->assertSuccessful()
        ->assertSee($photoA->uuid)
        ->assertDontSee($photoB->uuid);

    $this->withCookies(guestCookie($event, $guestA, $token))->get(route('guest.photos.preview', $photoB))->assertForbidden();
});

it('creates a guest identity cookie on the first visit', function () {
    $event = Event::factory()->create();

    $this->get(route('events.show', $event))
        ->assertSuccessful()
        ->assertCookie('event_guest_'.$event->uuid);
});

it('allows a guest to soft delete only their photo', function () {
    $event = Event::factory()->create();
    $guestA = EventGuest::factory()->for($event)->create();
    $guestB = EventGuest::factory()->for($event)->create();
    $own = Photo::factory()->for($event)->for($guestA, 'guest')->create();
    $foreign = Photo::factory()->for($event)->for($guestB, 'guest')->create();
    $cookies = guestCookie($event, $guestA, 'guest-a-token');

    $this->withCookies($cookies)->delete(route('guest.photos.destroy', [$event, $own]))->assertRedirect();
    expect($own->fresh()->deleted_at)->not->toBeNull();
    $this->withCookies($cookies)->delete(route('guest.photos.destroy', [$event, $foreign]))->assertForbidden();
});

it('blocks uploads after an event is finished', function () {
    $event = Event::factory()->finished()->create();
    $file = UploadedFile::fake()->image('photo.jpg');

    $this->post(route('guest.photos.store', $event), ['photos' => [$file]])->assertForbidden();
});

it('creates reduced JPEG thumbnail and preview files without replacing the original', function () {
    Storage::fake(config('filesystems.default'));
    $guest = EventGuest::factory()->for(Event::factory())->create();
    $file = UploadedFile::fake()->image('landscape.png', 2400, 1600);

    $photo = app(PhotoStorageService::class)->store($guest->load('event'), $file);
    $thumbnail = getimagesizefromstring(Storage::disk(config('filesystems.default'))->get($photo->thumbnail_path));
    $preview = getimagesizefromstring(Storage::disk(config('filesystems.default'))->get($photo->preview_path));

    Storage::disk(config('filesystems.default'))->assertExists($photo->original_path);
    expect($photo->original_path)->toEndWith('.png')
        ->and($photo->thumbnail_path)->toEndWith('.jpg')
        ->and($photo->preview_path)->toEndWith('.jpg')
        ->and(max($thumbnail[0], $thumbnail[1]))->toBeLessThanOrEqual(480)
        ->and(max($preview[0], $preview[1]))->toBeLessThanOrEqual(1920);
});

it('isolates event admins and gives superadmins access to all events', function () {
    Role::findOrCreate('event_admin');
    Role::findOrCreate('superadmin');
    $first = Event::factory()->create();
    $second = Event::factory()->create();
    $manager = User::factory()->create();
    $manager->assignRole('event_admin');
    $first->administrators()->attach($manager);
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');

    $this->actingAs($manager)->get(route('admin.events.show', $first))->assertSuccessful();
    $this->actingAs($manager)->get(route('admin.events.show', $second))->assertForbidden();
    $this->actingAs($superadmin)->get(route('admin.events.show', $second))->assertSuccessful();
});

it('shows all event photos in the admin gallery with their gallery attributes', function () {
    Role::findOrCreate('superadmin');
    $event = Event::factory()->create();
    $admin = User::factory()->create();
    $admin->assignRole('superadmin');
    $createdPhotos = collect(range(1, 37))
        ->map(fn () => Photo::factory()->for($event)->create());
    $expectedUuids = $createdPhotos->pluck('uuid')->sort()->values()->all();

    $this->actingAs($admin)
        ->get(route('admin.photos.index', $event))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/photos/index')
            ->where('photos', function (Collection $photos) use ($expectedUuids): bool {
                $actualUuids = $photos->pluck('uuid')->sort()->values()->all();
                $expectedAttributes = ['uuid', 'thumbnail', 'preview', 'deletedAt', 'createdAt', 'guest'];

                return $photos->count() === 37
                    && $actualUuids === $expectedUuids
                    && $photos->every(fn (array $photo): bool => array_keys($photo) === $expectedAttributes);
            }),
        );
});

it('permanently deletes photo files for an authorized administrator', function () {
    Storage::fake(config('filesystems.default'));
    Role::findOrCreate('superadmin');
    $event = Event::factory()->create();
    $photo = Photo::factory()->for($event)->create();
    Storage::disk(config('filesystems.default'))->put($photo->original_path, 'original');
    Storage::disk(config('filesystems.default'))->put($photo->thumbnail_path, 'thumbnail');
    Storage::disk(config('filesystems.default'))->put($photo->preview_path, 'preview');
    $admin = User::factory()->create();
    $admin->assignRole('superadmin');

    $this->actingAs($admin)->delete(route('admin.photos.destroy', [$event, $photo]))->assertRedirect();
    $this->assertModelMissing($photo);
    Storage::disk(config('filesystems.default'))->assertMissing($photo->original_path);
    Storage::disk(config('filesystems.default'))->assertMissing($photo->thumbnail_path);
    Storage::disk(config('filesystems.default'))->assertMissing($photo->preview_path);
});
