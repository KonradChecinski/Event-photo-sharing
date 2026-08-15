<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventGuest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventGuestIdentity
{
    public function resolve(Request $request, Event $event): array
    {
        $key = 'event_guest_'.$event->uuid;
        $token = $request->cookie($key);
        $guest = $token ? EventGuest::where('event_id', $event->id)->where('token_hash', hash('sha256', $token))->first() : null;
        if ($guest) {
            return [$guest, null];
        } $token = Str::random(80);

        return [EventGuest::create(['event_id' => $event->id, 'token_hash' => hash('sha256', $token)]), cookie($key, $token, 60 * 24 * 365, null, null, $request->isSecure(), true, false, 'lax')];
    }
}
