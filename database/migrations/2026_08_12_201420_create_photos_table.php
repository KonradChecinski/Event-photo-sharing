<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photos', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_guest_id')->constrained()->cascadeOnDelete();
            $table->string('original_name');
            $table->string('original_path');
            $table->string('thumbnail_path')->nullable();
            $table->string('preview_path')->nullable();
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('file_size');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->timestamp('deleted_at')->nullable()->index();
            $table->timestamps();
            $table->index(['event_id', 'created_at']);
            $table->index(['event_guest_id', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photos');
    }
};
