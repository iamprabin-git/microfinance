<?php

namespace App\Filament\Company\Resources\MemberResource\Pages;

use App\Filament\Company\Resources\MemberResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateMember extends CreateRecord
{
    protected static string $resource = MemberResource::class;
}
