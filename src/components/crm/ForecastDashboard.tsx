import { AlertCircle } from 'lucide-react'
import { fmtFull, totalRevenue, BADGE_CLASSES } from '../../config/profiles/crm-data'
import type { Opportunity, BadgeColor } from '../../config/profiles/crm-data'
import RingChart from './RingChart'
import BarComponent from './BarComponent'

interface Props {
    opps: Opportunity[]
}

interface AMRow {
    name: string
    badge: string
    color: BadgeColor
    pipe: string
    win: [string, string]
    acc: [string, string]
    slip: [string, string]
    note?: string
}

const ACCOUNT_MGRS: AMRow[] = [
    {
        name: 'John Smith',
        badge: 'JS',
        color: 'blue',
        pipe: '$1.45M',
        win: ['68%', 'text-emerald-600 dark:text-emerald-400'],
        acc: ['92%', 'text-emerald-600 dark:text-emerald-400'],
        slip: ['12%', 'text-amber-600 dark:text-amber-400'],
    },
    {
        name: 'Amanda Miller',
        badge: 'AM',
        color: 'purple',
        pipe: '$850K',
        win: ['45%', 'text-amber-600 dark:text-amber-400'],
        acc: ['60%', 'text-red-600 dark:text-red-400'],
        slip: ['28%', 'text-red-600 dark:text-red-400'],
        note: 'over-promised',
    },
]

export default function ForecastDashboard({ opps }: Props) {
    const qualified = opps.filter(o => o.probability >= 50)
    const qualRev = qualified.reduce((s, o) => s + totalRevenue(o.revenue), 0)
    const goal = 2_000_000
    const pct = Math.min(Math.round((qualRev / goal) * 100), 100)

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-muted-foreground">
                    Forecast rule active — only opportunities at <b className="text-foreground">≥ 50% probability</b> are counted.
                </p>
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground">
                    <AlertCircle className="h-4 w-4 text-blue-500" /> Pipeline / upside (under 50%) excluded
                </div>
            </div>

            <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
                {/* Forecasted-to-Book */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-bold text-foreground">Forecasted-to-Book</h2>
                        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                            Current Quarter
                        </span>
                    </div>
                    <div className="flex flex-col items-center py-2">
                        <RingChart pct={pct} />
                        <div className="text-center mt-4">
                            <div className="text-2xl font-bold text-foreground tabular-nums">{fmtFull(qualRev)}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                                qualified bookings vs {fmtFull(goal)} goal
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forecasted-to-Invoice */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-base font-bold text-foreground">Forecasted-to-Invoice</h2>
                        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-violet-500/15 text-violet-700 dark:text-violet-400">
                            Projected Cash Flow
                        </span>
                    </div>
                    <div className="flex flex-col gap-5">
                        <BarComponent label="Month 1 — secured / shipped" value="$450,000" pct={80} color="success" />
                        <BarComponent label="Month 2 — phased installs" value="$320,000" pct={60} color="warning" />
                        <BarComponent label="Month 3+ — pending schedules" value="$215,000" pct={35} color="info" muted />
                    </div>
                    <div className="mt-5 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Tracking {fmtFull(qualRev)} in qualified bookings converting to invoices over the next 90 days.
                    </div>
                </div>
            </div>

            {/* Account Manager Performance */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-base font-bold text-foreground">Account Manager Performance</h2>
                    <button type="button" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        View all regions
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                                {['Account Manager', 'Active Pipeline (≥50%)', 'Win Rate', 'Forecast Accuracy', 'Slippage'].map(h => (
                                    <th key={h} className="px-6 py-3 font-semibold">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {ACCOUNT_MGRS.map(am => {
                                const b = BADGE_CLASSES[am.color]
                                return (
                                    <tr key={am.name} className="border-b border-border last:border-b-0">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-extrabold ${b.bg} ${b.fg}`}
                                                >
                                                    {am.badge}
                                                </div>
                                                <span className="font-semibold text-foreground">{am.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-foreground tabular-nums">{am.pipe}</td>
                                        <td className={`px-6 py-4 font-bold tabular-nums ${am.win[1]}`}>{am.win[0]}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold tabular-nums ${am.acc[1]}`}>{am.acc[0]}</span>
                                            {am.note && <span className="text-xs text-muted-foreground ml-2">· {am.note}</span>}
                                        </td>
                                        <td className={`px-6 py-4 font-bold tabular-nums ${am.slip[1]}`}>{am.slip[0]}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
