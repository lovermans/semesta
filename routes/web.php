<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RootController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'start')->name('start');
Route::view('/page-need-javascript', 'page-need-javascript')->name('page-need-javascript');
Route::get('/pwa-manifest.json', [RootController::class, 'createPwaManifestJson'])->name('pwa-manifest');
Route::get('/service-worker.js', [RootController::class, 'createServiceWorkerJs'])->name('service-worker');

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
