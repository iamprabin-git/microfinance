export {};

declare global {
    /** Ziggy / Laravel named routes (@routes in Blade). */
    function route(
        name: string,
        params?: Record<string, unknown> | string | number | null,
        absolute?: boolean,
    ): string;
}
