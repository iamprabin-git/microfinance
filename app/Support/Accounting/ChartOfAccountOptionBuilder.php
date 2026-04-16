<?php

namespace App\Support\Accounting;

use App\Enums\ChartOfAccountType;
use App\Models\ChartOfAccount;

class ChartOfAccountOptionBuilder
{
    /**
     * @return array<int, string> Ordered COA type keys.
     */
    public static function typeOrder(): array
    {
        return [
            ChartOfAccountType::Asset->value,
            ChartOfAccountType::Liability->value,
            ChartOfAccountType::Capital->value,
            ChartOfAccountType::Income->value,
            ChartOfAccountType::Expense->value,
        ];
    }

    public static function statementTitleForType(string $typeValue): string
    {
        return in_array($typeValue, [
            ChartOfAccountType::Asset->value,
            ChartOfAccountType::Liability->value,
            ChartOfAccountType::Capital->value,
        ], true)
            ? 'Balance sheet'
            : (in_array($typeValue, [
                ChartOfAccountType::Income->value,
                ChartOfAccountType::Expense->value,
            ], true) ? 'Profit & loss' : 'Financial statements');
    }

    public static function typeLabelForType(string $typeValue): string
    {
        return ChartOfAccountType::tryFrom($typeValue)?->label() ?? $typeValue;
    }

    /**
     * Headings only (Financial Statement title + COA heading).
     *
     * @return array{statement_title: string, type: string, type_label: string}
     */
    public static function heading(string $typeValue): array
    {
        return [
            'statement_title' => self::statementTitleForType($typeValue),
            'type' => $typeValue,
            'type_label' => self::typeLabelForType($typeValue),
        ];
    }

    /**
     * @return array<int, array{statement_title: string, type: string, type_label: string}>
     */
    public static function headings(): array
    {
        return array_map(fn (string $t) => self::heading($t), self::typeOrder());
    }

    /**
     * Build a normalized option payload for account pickers (Journal Entry Dr/Cr).
     *
     * @return array{
     *   id:int,
     *   type:string,
     *   type_label:string|null,
     *   statement_title:string,
     *   label:string,
     *   display_label:string
     * }
     */
    public static function option(ChartOfAccount $a): array
    {
        $typeValue = $a->type instanceof ChartOfAccountType ? $a->type->value : (string) $a->type;
        $typeLabel = $a->type instanceof ChartOfAccountType
            ? $a->type->label()
            : self::typeLabelForType($typeValue);
        $statement = self::statementTitleForType($typeValue);

        $label = trim($a->code.' — '.$a->name);
        $displayLabel = implode(' · ', array_values(array_filter([
            $statement,
            $typeLabel,
            $label,
        ], fn ($v) => is_string($v) && $v !== '')));

        return [
            'id' => (int) $a->id,
            'type' => $typeValue,
            'type_label' => $typeLabel,
            'statement_title' => $statement,
            'label' => $label,
            'display_label' => $displayLabel,
        ];
    }
}

