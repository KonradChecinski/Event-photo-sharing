<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Event> */ class EventFactory extends Factory
{
    public function definition(): array
    {
        return ['name' => fake()->sentence(3), 'description' => fake()->paragraph(), 'status' => 'active', 'welcome_title' => 'Witaj!', 'welcome_text' => 'Podziel się swoimi zdjęciami.'];
    }

    public function finished(): static
    {
        return $this->state(['status' => 'finished']);
    }
}
