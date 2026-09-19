<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventAdminController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasRole('superadmin'), 403);

        return Inertia::render('admin/event-admins/index', [
            'admins' => User::query()
                ->whereHas('roles', fn ($query) => $query->whereIn('name', ['event_admin', 'superadmin']))
                ->with(['managedEvents:events.id,uuid,name', 'roles:id,name'])
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'is_active']),
            'events' => Event::orderBy('name')->get(['id', 'uuid', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole('superadmin'), 403);
        $data = $this->validated($request);
        $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => Str::password(32), 'is_active' => true, 'email_verified_at' => now()]);
        $user->assignRole($data['role']);
        $user->managedEvents()->sync($data['role'] === 'event_admin' ? $data['event_ids'] : []);
        Password::sendResetLink(['email' => $user->email]);

        return back()->with('success', 'Administrator utworzony. Wysłano link do ustawienia hasła.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()?->hasRole('superadmin') && ($user->hasRole('event_admin') || $user->hasRole('superadmin')), 403);
        $data = $this->validated($request, $user);
        $user->update(['name' => $data['name'], 'email' => $data['email'], 'is_active' => $data['is_active']]);
        $user->syncRoles([$data['role']]);
        $user->managedEvents()->sync($data['role'] === 'event_admin' ? $data['event_ids'] : []);

        return back()->with('success', 'Dane administratora zaktualizowane.');
    }

    /** @return array{name: string, email: string, role: string, is_active: bool, event_ids: array<int, int>} */
    private function validated(Request $request, ?User $user = null): array
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.($user?->id ?? 'NULL')],
            'role' => ['required', 'in:event_admin,superadmin'],
            'is_active' => ['sometimes', 'boolean'],
            'event_ids' => ['nullable', 'array'],
            'event_ids.*' => ['integer', 'exists:events,id'],
        ]);

        $validator->sometimes('event_ids', ['required', 'array', 'min:1'], fn (object $input): bool => $input->role === 'event_admin');

        return $validator->validate() + ['is_active' => true, 'event_ids' => []];
    }
}
