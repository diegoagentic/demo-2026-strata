interface Props {
    label: string
    value: string
    pct: number
    /** Color semántico · 'success' | 'warning' | 'info' · usa DS tokens emerald/amber/violet. */
    color?: 'success' | 'warning' | 'info'
    muted?: boolean
}

const COLOR_CLASS: Record<NonNullable<Props['color']>, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-violet-500',
}

export default function BarComponent({ label, value, pct, color = 'success', muted = false }: Props) {
    const textColor = muted ? 'text-muted-foreground' : 'text-foreground'
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${textColor}`}>{label}</span>
                <span className={`text-sm font-bold tabular-nums ${textColor}`}>{value}</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${COLOR_CLASS[color]}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}
