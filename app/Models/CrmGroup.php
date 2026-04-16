<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'board_id',
        'name',
        'position',
        'is_collapsed',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'is_collapsed' => 'boolean',
        ];
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(CrmBoard::class, 'board_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(CrmItem::class, 'group_id');
    }
}

