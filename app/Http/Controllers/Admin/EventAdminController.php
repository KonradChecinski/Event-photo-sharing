<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventAdminController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasRole('superadmin'), 403);

        return Inertia::render('admin/event-admins/index', [
            'admins' => User::role('event_admin')->with('managedEvents:events.id,uuid,name')->orderBy('name')->get(['id', 'name', 'email', 'is_active']),
            'events' => Event::orderBy('name')->get(['id', 'uuid', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole('superadmin'), 403);
        $data = $this->validated($request);
        $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => Str::password(32), 'is_active' => true, 'email_verified_at' => now()]);
        $user->assignRole('event_admin');
        $user->managedEvents()->sync($data['event_ids']);
        Password::sendResetLink(['email' => $user->email]);

        return back()->with('success', 'Administrator utworzony. Wysłano link do ustawienia hasła.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()?->hasRole('superadmin') && $user->hasRole('event_admin'), 403);
        $data = $this->validated($request, $user);
        $user->update(['name' => $data['name'], 'email' => $data['email'], 'is_active' => $data['is_active']]);
        $user->managedEvents()->sync($data['event_ids']);

        return back()->with('success', 'Dane administratora zaktualizowane.');
    }

    /** @return array{name: string, email: string, is_active: bool, event_ids: array<int, int>} */
    private function validated(Request $request, ?User $user = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.($user?->id ?? 'NULL')],
            'is_active' => ['sometimes', 'boolean'],
            'event_ids' => ['required', 'array', 'min:1'],
            'event_ids.*' => ['integer', 'exists:events,id'],
        ]) + ['is_active' => true];
    }
}
