<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(): Response
    {
        if (! Schema::hasTable('reviews')) {
            return Inertia::render('Marketing/Reviews', [
                'reviews' => ['data' => []],
            ]);
        }

        $reviews = Review::query()
            ->approved()
            ->with('user:id,name')
            ->latest()
            ->paginate(15)
            ->through(fn (Review $review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'title' => $review->title,
                'body' => $review->body,
                'author' => $review->user->name,
                'created_at' => $review->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Marketing/Reviews', [
            'reviews' => $reviews,
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        return Inertia::render('Marketing/ReviewForm');
    }

    public function store(Request $request): RedirectResponse
    {
        if (! Schema::hasTable('reviews')) {
            abort(503, 'Reviews are not available yet.');
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string', 'min:10', 'max:5000'],
        ]);

        $request->user()->reviews()->create([
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'body' => $validated['body'],
            'is_approved' => false,
        ]);

        return redirect()
            ->route('reviews.index')
            ->with('status', 'Thanks! Your review will appear after an administrator approves it.');
    }
}
