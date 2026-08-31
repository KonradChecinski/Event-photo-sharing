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
        'title',
        'text',
        'welcome_title',
        'welcome_text',
        'image',
        'primary_color',
        'secondary_color',
        'text_color',
        'background_color_primary',
        'background_color_secondary',
    ];

    //    protected $hidden = ['uuid', 'slug'];

    protected $attributes = [
        'status' => 'draft',
        'primary_color' => '#6D28D9',
        'secondary_color' => '#EC4899',
        'text_color' => '#FFFFFF',
        'background_color_primary' => '#1E1B4B',
        'background_color_secondary' => '#2D3748',
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
        if ($this->status !== 'active') {
            return false;
        }

        $now = now();

        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }

        if ($this->ends_at && $now->gt($this->ends_at)) {
            return false;
        }

        return true;
    }
}
