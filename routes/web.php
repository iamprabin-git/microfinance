<?php

use App\Http\Controllers\CompanyPortalUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinancialStatementController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\LoanRepaymentController;
use App\Http\Controllers\MarketingController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MonthlyDepositController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MarketingController::class, 'home'])->name('home');

Route::get('/about', [MarketingController::class, 'about'])->name('marketing.about');
Route::get('/contact', [MarketingController::class, 'contact'])->name('marketing.contact');
Route::get('/pricing', [MarketingController::class, 'pricing'])->name('marketing.pricing');
Route::get('/features', [MarketingController::class, 'features'])->name('marketing.features');

Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
Route::middleware(['auth', 'verified', 'company.web'])->group(function () {
    Route::get('/reviews/create', [ReviewController::class, 'create'])->name('reviews.create');
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
});

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified', 'company.web'])
    ->name('dashboard');

Route::middleware(['auth', 'verified', 'company.web'])->group(function () {
    Route::get('/company/users/create', [CompanyPortalUserController::class, 'create'])
        ->name('company.users.create');
    Route::post('/company/users', [CompanyPortalUserController::class, 'store'])
        ->name('company.users.store');
});

Route::get('/groups', [GroupController::class, 'index'])
    ->middleware(['auth', 'verified', 'company.web'])
    ->name('groups.index');

Route::middleware(['auth', 'verified', 'company.web'])->group(function () {
    Route::get('/financial-statements', [FinancialStatementController::class, 'index'])
        ->name('financial-statements.index');
    Route::get('members/{member}/end-user/create', [MemberController::class, 'createEndUser'])
        ->name('members.end-user.create');
    Route::post('members/{member}/end-user', [MemberController::class, 'storeEndUser'])
        ->name('members.end-user.store');
    Route::resource('members', MemberController::class)->except(['show']);
    Route::resource('savings', MonthlyDepositController::class)
        ->except(['show'])
        ->parameters(['savings' => 'saving']);
    Route::resource('loans', LoanController::class)->except(['show']);
    Route::post('loans/{loan}/repayments', [LoanRepaymentController::class, 'store'])
        ->name('loans.repayments.store');
});

Route::middleware(['auth', 'company.web'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
