<?php

namespace App\Policies;

use App\Models\Photo;
use App\Models\User;

class PhotoPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('superadmin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasRole('event_admin');
    }

    public function view(User $user, Photo $photo): bool
    {
        return $user->managedEvents()->whereKey($photo->event_id)->exists();
    }

    public function delete(User $user, Photo $photo): bool
    {
        return $this->view($user, $photo);
    }
}
