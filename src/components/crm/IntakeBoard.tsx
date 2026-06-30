import { LayoutGrid, MoreHorizontal, Search, Users } from 'lucide-react'
import { INTAKE_COLUMNS } from '../../config/profiles/crm-data'
import type { IntakeCardData } from '../../config/profiles/crm-data'
import IntakeCard from './IntakeCard'

interface Props {
    intake: IntakeCardData[]
}

export default function IntakeBoard({ intake }: Props) {
    return (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Spec Check & Design · Pipeline</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Felicia Miano-Poles · EVP Design & PM · ~30 designers across 3 regions
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                        <Users className="h-4 w-4" /> View capacity{' '}
                        <span className="text-muted-foreground">· ~30 designers</span>
                    </button>
                    <button
                        type="button"
                        aria-label="Search"
                        className="inline-flex items-center justify-center rounded-lg border border-border bg-card p-2 text-foreground transition-colors hover:bg-muted"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                        <LayoutGrid className="h-4 w-4" /> Board
                    </button>
                </div>
            </header>

            <div className="flex gap-4 overflow-x-auto pb-2">
                {INTAKE_COLUMNS.map(col => {
                    const cards = intake.filter(c => c.column === col)
                    return (
                        <div key={col} className="flex-shrink-0 w-[274px]">
                            <div className="flex items-center justify-between mb-3 px-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">{col}</span>
                                    <span className="text-xs font-semibold text-muted-foreground">{cards.length}</span>
                                </div>
                                <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="More">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </div>
                            {cards.length === 0 ? (
                                <div className="min-h-[96px] rounded-xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                                    No projects
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {cards.map(c => (
                                        <IntakeCard key={c.code} card={c} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
