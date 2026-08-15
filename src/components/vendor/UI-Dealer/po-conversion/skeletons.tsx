/**
 * FE-14 — Skeleton Loaders for PO Conversion pages
 */

export function PODraftsListSkeleton() {
    return (
        <div className="space-y-6 animate-pulse p-6">
            <div className="flex items-center justify-between">
                <div className="h-7 w-48 bg-muted rounded" />
                <div className="h-9 w-28 bg-muted rounded-lg" />
            </div>
            <div className="flex gap-3">
                <div className="h-9 w-60 bg-muted rounded-lg" />
                <div className="h-9 w-32 bg-muted rounded-lg" />
                <div className="h-9 w-32 bg-muted rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-card dark:bg-zinc-800 rounded-2xl border border-border p-5 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted" />
                            <div className="space-y-1.5 flex-1">
                                <div className="h-4 w-32 bg-muted rounded" />
                                <div className="h-3 w-20 bg-muted rounded" />
                            </div>
                            <div className="h-5 w-16 bg-muted rounded-full" />
                        </div>
                        <div className="flex justify-between">
                            <div className="h-3 w-16 bg-muted rounded" />
                            <div className="h-3 w-24 bg-muted rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function PODetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse p-6">
            {/* Breadcrumb */}
            <div className="h-4 w-64 bg-muted rounded" />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-40 bg-muted rounded" />
                    <div className="h-6 w-20 bg-muted rounded-full" />
                </div>
                <div className="h-9 w-24 bg-muted rounded-lg" />
            </div>
            {/* Tabs */}
            <div className="flex gap-4 border-b border-border pb-2">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-28 bg-muted rounded" />
            </div>
            {/* Line items table */}
            <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border p-6 space-y-3">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="h-4 w-8 bg-muted rounded" />
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-4 flex-1 bg-muted rounded" />
                            <div className="h-4 w-12 bg-muted rounded" />
                            <div className="h-4 w-20 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            </div>
            {/* Financial + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border p-6 space-y-3">
                    <div className="h-5 w-32 bg-muted rounded" />
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex justify-between">
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-4 w-20 bg-muted rounded" />
                        </div>
                    ))}
                </div>
                <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border p-6 space-y-4">
                    <div className="h-5 w-20 bg-muted rounded" />
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-muted" />
                            <div className="h-3 flex-1 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function ConversionReviewSkeleton() {
    return (
        <div className="space-y-6 animate-pulse p-6">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted rounded" />
                <div className="h-7 w-48 bg-muted rounded" />
                <div className="h-6 w-20 bg-muted rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-card dark:bg-zinc-800 rounded-2xl border border-border p-5 space-y-2">
                        <div className="h-8 w-12 bg-muted rounded" />
                        <div className="h-3 w-20 bg-muted rounded" />
                    </div>
                ))}
            </div>
            <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border p-6 space-y-4">
                <div className="h-5 w-40 bg-muted rounded" />
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="h-4 flex-1 bg-muted rounded" />
                            <div className="h-4 w-20 bg-muted rounded" />
                            <div className="h-4 w-20 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
