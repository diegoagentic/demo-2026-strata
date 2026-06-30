import { User } from 'lucide-react'
import { fmtK, totalRevenue } from '../../config/profiles/crm-data'
import type { Opportunity } from '../../config/profiles/crm-data'
import VerticalChip from './VerticalChip'

interface Props {
    opp: Opportunity
    onSelect: (id: string) => void
}

export default function OppCard({ opp, onSelect }: Props) {
    const total = totalRevenue(opp.revenue)
    const qualified = opp.probability >= 50
    return (
        <button
            type="button"
            onClick={() => opp.id && onSelect(opp.id)}
            className="w-full text-left rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
            <div className="flex items-center justify-between mb-3">
                <VerticalChip vertical={opp.vertical} color={opp.color} />
                <span
                    className={`text-xs font-bold tabular-nums ${qualified ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                        }`}
                >
                    {opp.probability}%
                </span>
            </div>
            <div className="text-[15px] font-bold leading-tight text-foreground">{opp.id}</div>
            <div className="text-xs text-muted-foreground mt-0.5 mb-3 truncate">{opp.name}</div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3" /> J. Smith
                </span>
                <span className="text-sm font-bold text-foreground tabular-nums">{fmtK(total)}</span>
            </div>
        </button>
    )
}
