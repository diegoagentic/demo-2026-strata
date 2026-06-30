import { MoreHorizontal, Plus, Sparkles } from 'lucide-react'
import { STAGES } from '../../config/profiles/crm-data'
import type { Opportunity } from '../../config/profiles/crm-data'
import OppCard from './OppCard'

interface Props {
    opps: Opportunity[]
    onSelect: (id: string) => void
    onNew: () => void
    onImport: () => void
}

export default function PipelineView({ opps, onSelect, onNew, onImport }: Props) {
    return (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Pre-Sale Pipeline</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Lead → Opportunity → Quote → Order → Closed · feeds the Design Intake board
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onImport}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110"
                    >
                        <Sparkles className="h-4 w-4" /> Import with AI
                    </button>
                    <button
                        type="button"
                        onClick={onNew}
                        className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3.5 py-2 text-xs font-semibold text-background shadow-sm transition-colors hover:bg-foreground/90"
                    >
                        <Plus className="h-4 w-4" /> New Opportunity
                    </button>
                </div>
            </header>

            <div className="flex gap-4 overflow-x-auto pb-2">
                {STAGES.map(stage => {
                    const inStage = opps.filter(o => o.stage === stage)
                    return (
                        <div key={stage} className="flex-shrink-0 w-[274px]">
                            <div className="flex items-center justify-between mb-3 px-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">{stage}</span>
                                    <span className="text-xs font-semibold text-muted-foreground">{inStage.length}</span>
                                </div>
                                <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="More">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </div>
                            {inStage.length === 0 ? (
                                <div className="min-h-[96px] rounded-xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                                    No projects
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {inStage.map(o => (
                                        <OppCard key={o.id} opp={o} onSelect={onSelect} />
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
