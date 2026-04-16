<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmColumn extends Model
{
    use HasFactory;

    public const TYPE_TEXT = 'text';
    public const TYPE_NUMBER = 'number';
    public const TYPE_DATE = 'date';
    public const TYPE_STATUS = 'status';

    public static function types(): array
    {
        return [
            self::TYPE_TEXT,
            self::TYPE_NUMBER,
            self::TYPE_DATE,
            self::TYPE_STATUS,
        ];
    }

    protected $fillable = [
        'board_id',
        'name',
        'key',
        'type',
        'options',
        'position',
        'is_required',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'is_required' => 'boolean',
            'position' => 'integer',
        ];
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(CrmBoard::class, 'board_id');
    }
}

