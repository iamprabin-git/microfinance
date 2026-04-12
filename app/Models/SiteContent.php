<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'subtitle',
        'body',
    ];

    public static function slugHome(): string
    {
        return 'home';
    }

    public static function slugs(): array
    {
        return ['home', 'about', 'contact', 'prices'];
    }
}
