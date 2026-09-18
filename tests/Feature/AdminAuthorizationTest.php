<?php

use App\Models\Event;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('superadmin');
    Role::findOrCreate('event_admin');
});

it('limits an event admin to assigned events and dashboard statistics', function () {
    $assigned = Event::factory()->create();
    $other = Event::factory()->create();
    $admin = User::factory()->create();
    $admin->assignRole('event_admin');
    $assigned->administrators()->attach($admin);
    Photo::factory()->for($assigned)->create();
    Photo::factory()->for($other)->create();
    $this->actingAs($admin)->get(route('admin.events.index'))->assertOk()->assertSee($assigned->name)->assertDontSee($other->name);
    $this->actingAs($admin)->get(route('admin.events.show', $other))->assertForbidden();
    $this->actingAs($admin)->get(route('dashboard'))->assertOk()->assertSee('1');
});

it('only allows superadmins to finish an event', function () {
    $event = Event::factory()->create();
    $admin = User::factory()->create();
    $admin->assignRole('event_admin');
    $event->administrators()->attach($admin);
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    $data = ['status' => 'finished', 'primary_color' => '#111111', 'secondary_color' => '#222222', 'text_color' => '#ffffff', 'background_color_primary' => '#111111', 'background_color_secondary' => '#222222'];
    $this->actingAs($admin)->patch(route('admin.events.update', $event), $data)->assertSessionHasErrors('status');
    $this->actingAs($superadmin)->patch(route('admin.events.update', $event), $data)->assertRedirect();
    expect($event->fresh()->status)->toBe('finished');
});

it('restricts administrator management to superadmins and keeps many event assignments', function () {
    $first = Event::factory()->create();
    $second = Event::factory()->create();
    $manager = User::factory()->create();
    $manager->assignRole('event_admin');
    $eventAdmin = User::factory()->create();
    $eventAdmin->assignRole('event_admin');
    $eventAdmin->managedEvents()->sync([$first->id, $second->id]);

    $this->actingAs($manager)->get('/admin/event-admins')->assertForbidden();
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    $this->actingAs($superadmin)->get('/admin/event-admins')->assertOk()->assertSee($eventAdmin->email);

    expect($eventAdmin->managedEvents)->toHaveCount(2);
});

it('allows only a superadmin to create an event administrator', function () {
    Mail::fake();
    $event = Event::factory()->create();
    $manager = User::factory()->create();
    $manager->assignRole('event_admin');
    $data = ['name' => 'New Manager', 'email' => 'manager@example.test', 'event_ids' => [$event->id]];

    $this->actingAs($manager)->post('/admin/event-admins', $data)->assertForbidden();
    $superadmin = User::factory()->create();
    $superadmin->assignRole('superadmin');
    $this->actingAs($superadmin)->post('/admin/event-admins', $data)->assertRedirect();

    $created = User::where('email', $data['email'])->firstOrFail();
    expect($created->hasRole('event_admin'))->toBeTrue()->and($created->managedEvents)->toHaveCount(1);
});
