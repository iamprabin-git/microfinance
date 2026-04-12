<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\SiteContent;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class MarketingController extends Controller
{
    public function home(): Response
    {
        $home = Schema::hasTable('site_contents')
            ? SiteContent::query()->where('slug', SiteContent::slugHome())->first()
            : null;

        $reviews = collect();

        if (Schema::hasTable('reviews')) {
            $reviews = Review::query()
                ->approved()
                ->with('user:id,name')
                ->latest()
                ->take(8)
                ->get()
                ->map(fn (Review $review) => [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'title' => $review->title,
                    'body' => $review->body,
                    'author' => $review->user->name,
                    'created_at' => $review->created_at?->toIso8601String(),
                ]);
        }

        return Inertia::render('Marketing/Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'page' => $home ? [
                'title' => $home->title,
                'subtitle' => $home->subtitle,
                'body' => $home->body,
            ] : null,
            'reviews' => $reviews,
        ]);
    }

    public function page(string $slug): Response
    {
        if (! Schema::hasTable('site_contents')) {
            abort(503, 'Site content is not available yet. Run migrations and seed.');
        }

        $content = SiteContent::query()->where('slug', $slug)->firstOrFail();

        return Inertia::render('Marketing/Page', [
            'page' => [
                'slug' => $content->slug,
                'title' => $content->title,
                'subtitle' => $content->subtitle,
                'body' => $content->body,
            ],
        ]);
    }

    public function about(): Response
    {
        return $this->page('about');
    }

    public function contact(): Response
    {
        return $this->page('contact');
    }

    public function pricing(): Response
    {
        return $this->page('prices');
    }
}
