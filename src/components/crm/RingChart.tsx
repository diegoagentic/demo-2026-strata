interface Props {
    pct: number
    size?: number
}

// Gauge ring SVG · animated stroke-dasharray transition (1s).
// Track usa border color, ring usa primary token (semantic).
export default function RingChart({ pct, size = 172 }: Props) {
    const r = 15.9155
    const c = 2 * Math.PI * r
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg
                viewBox="0 0 36 36"
                className="w-full h-full -rotate-90"
                aria-hidden="true"
            >
                <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="3.4" className="text-muted" />
                <circle
                    cx="18"
                    cy="18"
                    r={r}
                    fill="none"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    className="text-primary transition-all duration-1000 ease-in-out"
                    strokeDasharray={`${(pct / 100) * c} ${c}`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[38px] leading-none font-bold tracking-tight text-foreground">{pct}%</span>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">of target</span>
            </div>
        </div>
    )
}
