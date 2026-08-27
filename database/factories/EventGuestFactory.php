<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventGuest;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<EventGuest> */ class EventGuestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'token_hash' => hash('sha256', fake()->uuid())
        ];
    }
}
