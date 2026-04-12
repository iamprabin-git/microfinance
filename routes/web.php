<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MarketingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MarketingController::class, 'home'])->name('home');

Route::get('/about', [MarketingController::class, 'about'])->name('marketing.about');
Route::get('/contact', [MarketingController::class, 'contact'])->name('marketing.contact');
Route::get('/pricing', [MarketingController::class, 'pricing'])->name('marketing.pricing');

Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
Route::middleware(['auth', 'verified', 'company.web'])->group(function () {
    Route::get('/reviews/create', [ReviewController::class, 'create'])->name('reviews.create');
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
});

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified', 'company.web'])
    ->name('dashboard');

Route::get('/groups', [GroupController::class, 'index'])
    ->middleware(['auth', 'verified', 'company.web'])
    ->name('groups.index');

Route::middleware(['auth', 'company.web'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
