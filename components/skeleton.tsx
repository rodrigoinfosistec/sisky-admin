export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
                {Array.from({ length: rows }).map((_, i) => (
                    <tr key={i}>
                        {Array.from({ length: cols }).map((_, j) => (
                            <td key={j} className="px-6 py-4">
                                <div className="h-4 bg-muted rounded animate-pulse" />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-card rounded-xl border border-border p-5">
            <div className="h-4 bg-muted rounded animate-pulse w-24 mb-3" />
            <div className="h-8 bg-muted rounded animate-pulse w-16" />
        </div>
    );
}