<?php

namespace Database\Factories;

use App\Models\EventGuest;
use App\Models\Photo;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Photo> */ class PhotoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'event_guest_id' => EventGuest::factory(),
            'event_id' => fn (array $attrs) => EventGuest::find($attrs['event_guest_id'])->event_id,
            'original_name' => 'photo.jpg',
            'original_path' => 'events/test/originals/photo.jpg',
            'thumbnail_path' => 'events/test/thumbnails/photo.jpg',
            'preview_path' => 'events/test/previews/photo.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 100,
        ];
    }
}
