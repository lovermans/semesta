<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RootController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'start')->name('start');
Route::view('/offline-fallback', 'offline-fallback')->name('offline-fallback');
Route::get('/font-face.css', [RootController::class, 'createFontFaceCSS'])->name('css-font-face');
Route::post('/locale-setting', [RootController::class, 'setAppLocale'])->name('locale-setting');
Route::view('/page-need-javascript', 'page-need-javascript')->name('page-need-javascript');
Route::get('/pwa-manifest.json', [RootController::class, 'createPwaManifestJson'])->name('json-pwa-manifest');
Route::get('/register-service-worker.js', [RootController::class, 'registerServiceWorker'])->name('js-register-service-worker');
Route::get('/service-worker.js', [RootController::class, 'createServiceWorkerJs'])->name('js-service-worker');
Route::get('/websocket.js', [RootController::class, 'createWebSocketJs'])->name('js-websocket');

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
