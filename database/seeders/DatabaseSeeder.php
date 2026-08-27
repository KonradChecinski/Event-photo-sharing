<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
//    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $permissions = ['events.create', 'events.delete'];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }
        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        $superadmin = Role::findOrCreate('superadmin');
        $eventAdmin = Role::findOrCreate('event_admin');
        $superadmin->syncPermissions($permissions);

        app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.test'],
            [
                'name' => 'Superadmin',
                'password' => Hash::make('ChangeMe!2026')
            ]
        );
        $admin->assignRole($superadmin);


        $manager = User::firstOrCreate(
            ['email' => 'event-admin@example.test'],
            [
                'name' => 'Event Admin',
                'password' => Hash::make('ChangeMe!2026')
            ]
        );
        $manager->assignRole($eventAdmin);

        $event = Event::firstOrCreate(
            ['name' => 'Przykładowe wydarzenie'],
            [
                'status' => 'active',
                'welcome_title' => 'Witaj na wydarzeniu!',
                'welcome_text' => 'Dodaj swoje najlepsze kadry.'
            ]
        );
        $event->administrators()->syncWithoutDetaching([$manager->id]);
    }
}
