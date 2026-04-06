export default function TablePageLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-44 animate-pulse rounded bg-muted/20" />
                    <div className="h-4 w-32 animate-pulse rounded bg-muted/20" />
                </div>
                <div className="h-10 w-36 animate-pulse rounded-lg bg-muted/20" />
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="h-11 flex-1 animate-pulse rounded-lg border border-border bg-surface" />
                <div className="h-11 w-32 animate-pulse rounded-lg border border-border bg-surface" />
            </div>

            {/* Table skeleton */}
            <div className="rounded-xl border border-border bg-surface shadow-sm">
                <div className="border-b border-border p-4">
                    <div className="grid grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-4 animate-pulse rounded bg-muted/20" />
                        ))}
                    </div>
                </div>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="border-b border-border/50 p-4 last:border-0">
                        <div className="grid grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map((j) => (
                                <div
                                    key={j}
                                    className="h-4 animate-pulse rounded bg-muted/15"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
