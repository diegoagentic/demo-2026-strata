import { BADGE_CLASSES, fmtFull } from '../../config/profiles/crm-data'
import type { IntakeCardData } from '../../config/profiles/crm-data'

interface Props {
    card: IntakeCardData
}

export default function IntakeCard({ card }: Props) {
    const c = BADGE_CLASSES[card.color]
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
            <div className="flex items-center gap-3 mb-3">
                <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 ${c.bg} ${c.fg}`}
                >
                    {card.badge}
                </div>
                <div className="min-w-0">
                    <div className="text-[15px] font-bold leading-tight text-foreground">{card.code}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{card.org}</div>
                </div>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed mb-3">{card.meta}</div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">{card.assignee}</span>
                <span className="text-sm font-bold text-foreground tabular-nums">{fmtFull(card.amount)}</span>
            </div>
        </div>
    )
}
