<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmItemActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'board_id',
        'item_id',
        'actor_user_id',
        'event',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(CrmItem::class, 'item_id');
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(CrmBoard::class, 'board_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}

