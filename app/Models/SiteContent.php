<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SiteContent extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'subtitle',
        'body',
        'meta_description',
        'hero_image',
    ];

    public static function slugHome(): string
    {
        return 'home';
    }

    public static function slugs(): array
    {
        return ['home', 'about', 'contact', 'prices', 'features'];
    }

    /**
     * Public URL for the hero image, or null when unset.
     * Accepts absolute URLs or paths on the `public` disk (e.g. site-heroes/foo.jpg).
     */
    public function heroImagePublicUrl(): ?string
    {
        if ($this->hero_image === null || $this->hero_image === '') {
            return null;
        }

        if (filter_var($this->hero_image, FILTER_VALIDATE_URL)) {
            return $this->hero_image;
        }

        if (str_starts_with($this->hero_image, '/')) {
            return $this->hero_image;
        }

        return Storage::disk('public')->url($this->hero_image);
    }
}
