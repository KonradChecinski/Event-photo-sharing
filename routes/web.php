<?php

use App\Http\Controllers\Admin\EventAdminController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\PhotoController as AdminPhotoController;
use App\Http\Controllers\GuestEventController;
use App\Http\Controllers\GuestPhotoController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('/e/{event}', [GuestEventController::class, 'show'])->name('events.show');
Route::get('/e/{event}/background', [GuestEventController::class, 'background'])->name('events.background');
Route::post('/e/{event}/photos', [GuestPhotoController::class, 'store'])->middleware('throttle:guest-upload')->name('guest.photos.store');
Route::delete('/e/{event}/photos/{photo}', [GuestPhotoController::class, 'destroy'])->middleware('throttle:guest-sensitive')->name('guest.photos.destroy');
Route::get('/photos/{photo}/thumbnail', [GuestPhotoController::class, 'file'])->defaults('variant', 'thumbnail')->name('guest.photos.thumbnail');
Route::get('/photos/{photo}/preview', [GuestPhotoController::class, 'file'])->defaults('variant', 'preview')->name('guest.photos.preview');
Route::get('/photos/{photo}/{variant}', [GuestPhotoController::class, 'file'])->whereIn('variant', ['thumbnail', 'preview', 'original'])->middleware('throttle:guest-sensitive')->name('guest.photos.file');

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/', [AdminEventController::class, 'index'])->name('events.index');
    Route::post('/events', [AdminEventController::class, 'store'])->name('events.store');
    Route::get('/events/{event}', [AdminEventController::class, 'show'])->name('events.show');
    Route::patch('/events/{event}', [AdminEventController::class, 'update'])->name('events.update');
    Route::get('/events/{event}/photos', [AdminPhotoController::class, 'index'])->name('photos.index');
    Route::get('/events/{event}/photos/{photo}/{variant}', [AdminPhotoController::class, 'file'])->whereIn('variant', ['thumbnail', 'preview', 'original'])->name('photos.file');
    Route::get('/events/{event}/photos/{photo}/download', [AdminPhotoController::class, 'download'])->name('photos.download');
    Route::delete('/events/{event}/photos/{photo}', [AdminPhotoController::class, 'destroy'])->name('photos.destroy');
    Route::post('/events/{event}/photos/zip', [AdminPhotoController::class, 'zip'])->name('photos.zip');
    Route::delete('/events/{event}/photos', [AdminPhotoController::class, 'destroySelected'])->name('photos.destroy-selected');
    Route::get('/event-admins', [EventAdminController::class, 'index'])->name('event-admins.index');
    Route::post('/event-admins', [EventAdminController::class, 'store'])->name('event-admins.store');
    Route::patch('/event-admins/{user}', [EventAdminController::class, 'update'])->name('event-admins.update');
});
Route::middleware(['auth', 'verified'])->get('/dashboard', [AdminEventController::class, 'dashboard'])->name('dashboard');
require __DIR__.'/settings.php';
