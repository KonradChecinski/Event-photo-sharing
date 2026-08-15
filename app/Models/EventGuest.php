<?php

namespace App\Models;

use Database\Factories\EventGuestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class EventGuest extends Model
{
    /** @use HasFactory<EventGuestFactory> */
    use HasFactory;

    protected $fillable = [
        'event_id',
        'token_hash',
    ];

    protected $hidden = [
        'token_hash',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $guest): void {
            $guest->uuid ??= (string) Str::uuid();
        });
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class);
    }
}
