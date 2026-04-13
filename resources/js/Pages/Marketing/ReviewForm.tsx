import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { HeadingIcon } from '@/components/ui/heading-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { MessageSquarePlus } from 'lucide-react';
import type { FormEventHandler } from 'react';

export default function ReviewForm() {
    const { data, setData, post, processing, errors } = useForm({
        rating: 5,
        title: '',
        body: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('reviews.store'));
    };

    return (
        <PublicLayout title="Write a review" titleIcon={MessageSquarePlus}>
            <Head title="Write a review" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={MessageSquarePlus} size="sm" />
                        Share your experience
                    </CardTitle>
                    <CardDescription>
                        Submissions are reviewed before they appear publicly.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="rating">Rating (1–5)</Label>
                            <Input
                                id="rating"
                                type="number"
                                min={1}
                                max={5}
                                value={data.rating}
                                onChange={(e) =>
                                    setData('rating', Number(e.target.value))
                                }
                                aria-invalid={errors.rating ? 'true' : 'false'}
                            />
                            {errors.rating ? (
                                <p className="text-destructive text-sm">
                                    {errors.rating}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title (optional)</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                maxLength={255}
                                aria-invalid={errors.title ? 'true' : 'false'}
                            />
                            {errors.title ? (
                                <p className="text-destructive text-sm">
                                    {errors.title}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="body">Your review</Label>
                            <textarea
                                id="body"
                                name="body"
                                rows={6}
                                value={data.body}
                                onChange={(e) =>
                                    setData('body', e.target.value)
                                }
                                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30 flex min-h-[120px] w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                                aria-invalid={errors.body ? 'true' : 'false'}
                            />
                            {errors.body ? (
                                <p className="text-destructive text-sm">
                                    {errors.body}
                                </p>
                            ) : null}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3 border-t bg-muted/30">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Submitting…' : 'Submit'}
                        </Button>
                        <Link
                            href={route('reviews.index')}
                            className="text-muted-foreground text-sm underline-offset-4 hover:underline"
                        >
                            Cancel
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </PublicLayout>
    );
}
