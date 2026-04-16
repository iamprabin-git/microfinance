<?php

namespace App\Http\Controllers;

use App\Enums\ProductType;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureCanView($request);

        $companyId = (int) $request->user()->company_id;

        $products = Product::query()
            ->forCompany($companyId)
            ->orderBy('type')
            ->orderBy('code')
            ->get()
            ->map(fn (Product $p) => [
                'id' => $p->id,
                'type' => $p->type->value,
                'code' => $p->code,
                'name' => $p->name,
                'description' => $p->description,
                'is_active' => (bool) $p->is_active,
            ])
            ->all();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'can_manage' => (bool) $request->user()?->isCompanyAdmin(),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->ensureCanManage($request);

        return Inertia::render('Products/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->ensureCanManage($request);

        $companyId = (int) $request->user()->company_id;
        $validated = $this->validateProduct($request, $companyId);

        $validated['company_id'] = $companyId;
        $validated['code'] = $validated['code'] !== null && trim((string) $validated['code']) !== ''
            ? $this->normalizeCode((string) $validated['code'])
            : $this->nextAutoCode($companyId, ProductType::from((string) $validated['type']));

        Product::query()->create($validated);

        return redirect()
            ->route('products.index')
            ->with('status', 'Product created.');
    }

    public function edit(Request $request, Product $product): Response
    {
        $this->ensureProductAccess($request, $product);

        return Inertia::render('Products/Edit', [
            'product' => [
                'id' => $product->id,
                'type' => $product->type->value,
                'code' => $product->code,
                'name' => $product->name,
                'description' => $product->description,
                'is_active' => (bool) $product->is_active,
            ],
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $this->ensureProductAccess($request, $product);

        $companyId = (int) $request->user()->company_id;
        $validated = $this->validateProduct($request, $companyId, $product);

        if (isset($validated['code'])) {
            $validated['code'] = $this->normalizeCode((string) $validated['code']);
        }

        $product->update($validated);

        return redirect()
            ->route('products.index')
            ->with('status', 'Product updated.');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->ensureProductAccess($request, $product);

        $product->delete();

        return redirect()
            ->route('products.index')
            ->with('status', 'Product removed.');
    }

    /**
     * @return array{type: string, code?: string|null, name: string, description?: string|null, is_active: bool}
     */
    private function validateProduct(Request $request, int $companyId, ?Product $product = null): array
    {
        return $request->validate([
            'type' => ['required', 'string', Rule::in(array_map(fn ($e) => $e->value, ProductType::cases()))],
            'code' => [
                'nullable',
                'string',
                'max:32',
                Rule::unique('products', 'code')
                    ->where(fn ($q) => $q->where('company_id', $companyId))
                    ->ignore($product?->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['required', 'boolean'],
        ]);
    }

    private function normalizeCode(string $code): string
    {
        $code = trim($code);
        $code = preg_replace('/\s+/', '', $code) ?? $code;
        $code = strtoupper($code);

        return $code;
    }

    private function nextAutoCode(int $companyId, ProductType $type): string
    {
        $prefix = match ($type) {
            ProductType::Savings => 'S/SAV/',
            ProductType::Loan => 'L/LON/',
        };

        $existing = Product::query()
            ->forCompany($companyId)
            ->where('type', $type->value)
            ->where('code', 'like', $prefix.'%')
            ->pluck('code')
            ->all();

        $max = 0;
        foreach ($existing as $code) {
            $suffix = substr((string) $code, strlen($prefix));
            if ($suffix === false) {
                continue;
            }
            if (! ctype_digit($suffix)) {
                continue;
            }
            $n = (int) $suffix;
            $max = max($max, $n);
        }

        $next = $max + 1;

        return $prefix.str_pad((string) $next, 2, '0', STR_PAD_LEFT);
    }

    private function ensureCanManage(Request $request): void
    {
        abort_unless($request->user()?->isCompanyAdmin(), 403);
    }

    private function ensureCanView(Request $request): void
    {
        abort_unless($request->user()?->canManageCompanyOperationalData(), 403);
    }

    private function ensureProductAccess(Request $request, Product $product): void
    {
        $this->ensureCanManage($request);

        abort_unless((int) $product->company_id === (int) $request->user()?->company_id, 404);
    }
}

