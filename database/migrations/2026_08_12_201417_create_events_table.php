<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('slug')->nullable()->unique();
            $table->text('description')->nullable();
            $table->string('status')->default('draft')->index();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->string('title')->nullable();
            $table->text('text')->nullable();
            $table->string('welcome_title')->nullable();
            $table->text('welcome_text')->nullable();
            $table->string('image')->nullable();
            $table->string('primary_color', 7)->default('#6D28D9');
            $table->string('secondary_color', 7)->default('#EC4899');
            $table->string('text_color', 7)->default('#FFFFFF');
            $table->string('background_color_primary', 7)->default('#1E1B4B');
            $table->string('background_color_secondary', 7)->default('#2D3748');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
