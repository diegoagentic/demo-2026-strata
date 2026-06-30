import { useState } from 'react'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { MOCK_DOSSIER } from '../../config/profiles/crm-data'
import type { Opportunity } from '../../config/profiles/crm-data'

interface Props {
    opp: Opportunity
    onGenerated: () => void
}

// Strata AI Dossier · gradient border cuando activado · "Generate insights" CTA
// dispara mock 1.4s delay y muestra DISC + insights + connection + resource.
export default function StrataAIDossier({ opp, onGenerated }: Props) {
    const [generating, setGenerating] = useState(false)
    const [shown, setShown] = useState(opp.aiGenerated)

    const runAI = () => {
        setGenerating(true)
        setTimeout(() => {
            setGenerating(false)
            setShown(true)
            onGenerated()
        }, 1400)
    }

    return (
        <div
            className={`rounded-2xl p-0.5 transition-all ${shown ? 'bg-gradient-to-br from-violet-500 to-indigo-500' : 'bg-border'
                }`}
        >
            <div className="rounded-2xl bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                        <Sparkles className={`h-5 w-5 ${shown ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground'}`} />
                        Strata AI Dossier
                    </h2>
                    {!shown && !generating && (
                        <button
                            type="button"
                            onClick={runAI}
                            className="rounded-lg bg-violet-500/10 px-3.5 py-2 text-xs font-bold text-violet-700 dark:text-violet-400 transition-colors hover:bg-violet-500/20"
                        >
                            Generate insights
                        </button>
                    )}
                    {generating && (
                        <span className="flex items-center gap-2 text-xs font-semibold text-violet-700 dark:text-violet-400">
                            <Sparkles className="h-4 w-4 animate-spin" /> Deep researching…
                        </span>
                    )}
                </div>

                {!shown && !generating && (
                    <p className="text-sm text-muted-foreground text-center px-2 py-5 leading-relaxed">
                        Run deep research on {opp.company} — public real-estate filings, DISC profiles of stakeholders, and
                        internal historical connections.
                    </p>
                )}

                {shown && (
                    <div className="flex flex-col gap-5">
                        {/* DISC profile */}
                        <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/40 p-4">
                            <div className="h-12 w-12 rounded-full flex items-center justify-center font-extrabold text-lg flex-shrink-0 bg-red-500/15 text-red-700 dark:text-red-400">
                                {MOCK_DOSSIER.disc.type}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">{MOCK_DOSSIER.disc.title}</h3>
                                <p className="text-sm text-muted-foreground italic mt-1 leading-relaxed">
                                    "{MOCK_DOSSIER.disc.strategy}"
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
                            {/* Workspace Triggers */}
                            <div>
                                <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-3">
                                    Workspace Triggers
                                </h4>
                                <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                                    {MOCK_DOSSIER.insights.map((t, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-snug">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col gap-4">
                                {/* Historical Network */}
                                <div>
                                    <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                                        Historical Network
                                    </h4>
                                    <div className="flex items-center justify-between gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                                        <span className="text-xs text-foreground leading-snug">{MOCK_DOSSIER.connection.text}</span>
                                        <button
                                            type="button"
                                            className="whitespace-nowrap rounded-md border border-blue-500/40 bg-card px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-400 transition-colors hover:bg-blue-500/10"
                                        >
                                            {MOCK_DOSSIER.connection.action}
                                        </button>
                                    </div>
                                </div>
                                {/* Resource Alignment */}
                                <div>
                                    <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                                        Resource Alignment
                                    </h4>
                                    <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-3 text-xs text-foreground leading-snug">
                                        {MOCK_DOSSIER.resource}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
