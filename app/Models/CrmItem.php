<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'board_id',
        'group_id',
        'name',
        'values',
        'status',
        'assignee_user_id',
    ];

    protected function casts(): array
    {
        return [
            'values' => 'array',
        ];
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(CrmBoard::class, 'board_id');
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(CrmGroup::class, 'group_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_user_id');
    }
}

