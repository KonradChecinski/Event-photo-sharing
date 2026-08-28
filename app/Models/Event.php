<?php

namespace App\Models;

use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Event extends Model
{
    /** @use HasFactory<EventFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
        'starts_at',
        'ends_at',
        'welcome_title',
        'welcome_text',
        'hero_image',
        'welcome_image',
        'logo',
        'primary_color',
        'secondary_color',
        'text_color',
        'background_color',
    ];

    //    protected $hidden = ['uuid', 'slug'];

    protected $attributes = [
        'status' => 'draft',
        'primary_color' => '#6D28D9',
        'secondary_color' => '#EC4899',
        'text_color' => '#FFFFFF',
        'background_color' => '#1E1B4B',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {

        static::creating(function (self $event): void {
            $event->uuid = (string) Str::uuid();
            $event->slug = Str::slug($event->name).'-'.Str::lower(Str::random(6));
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function guests(): HasMany
    {
        return $this->hasMany(EventGuest::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class);
    }

    public function administrators(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    public function acceptsGuestUploads(): bool
    {
        return $this->status === 'active';
    }
}
