import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { HeadingIcon } from '@/components/ui/heading-icon';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import type { ProductRow } from '@/types/models';
import { Head, Link, usePage } from '@inertiajs/react';
import { Package } from 'lucide-react';

type IndexProps = {
    products: ProductRow[];
    can_manage: boolean;
};

export default function Index({ products, can_manage }: IndexProps) {
    const { companyPortal } = usePage().props as any;
    const canManage = Boolean(can_manage ?? companyPortal?.canApproveRecords);

    return (
        <AppLayout title="Products" titleIcon={Package}>
            <Head title="Products" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground max-w-xl text-sm">
                    Define savings and loan products. Codes can be auto-generated
                    (example: <span className="font-mono">S/SAV/01</span>).
                </p>
                {canManage ? (
                    <Link
                        href={route('products.create')}
                        className={cn(buttonVariants())}
                    >
                        Add product
                    </Link>
                ) : null}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={Package} size="sm" />
                        Products
                    </CardTitle>
                    <CardDescription>
                        Active and inactive product definitions for your company.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                    {products.length === 0 ? (
                        <p className="text-muted-foreground px-4 text-sm sm:px-0">
                            No products yet. Use &quot;Add product&quot; to
                            create your first one.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[40rem] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Code
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        {canManage ? (
                                            <th className="px-4 py-3 font-medium text-end">
                                                Actions
                                            </th>
                                        ) : null}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="px-4 py-3 tabular-nums capitalize">
                                                {product.type}
                                            </td>
                                            <td className="px-4 py-3 font-mono tabular-nums">
                                                {product.code}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {product.name}
                                                </div>
                                                <div className="text-muted-foreground mt-1 text-xs">
                                                    {product.description?.trim() ||
                                                        'No description'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        product.is_active
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                >
                                                    {product.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </Badge>
                                            </td>
                                            {canManage ? (
                                                <td className="px-4 py-3 text-end">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route(
                                                                'products.edit',
                                                                product.id,
                                                            )}
                                                            className={cn(
                                                                buttonVariants({
                                                                    variant:
                                                                        'outline',
                                                                    size: 'sm',
                                                                }),
                                                            )}
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                'products.destroy',
                                                                product.id,
                                                            )}
                                                            method="delete"
                                                            as="button"
                                                            className={cn(
                                                                buttonVariants({
                                                                    variant: 'ghost',
                                                                    size: 'sm',
                                                                }),
                                                                'text-destructive',
                                                            )}
                                                            onClick={(e) => {
                                                                if (
                                                                    !confirm(
                                                                        'Delete this product?',
                                                                    )
                                                                ) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            Delete
                                                        </Link>
                                                    </div>
                                                </td>
                                            ) : null}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}

