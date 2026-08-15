/**
 * COMPONENT: F3_p33_WallsPMGateScene (Projex · p3.3)
 * PURPOSE: Walls 60/30/10 · 30% draw needs Stacy PM confirmation. Alec handoff
 *          releases · Stacy receives ConfirmDialog · installation photos + punch
 *          list attached · WC9 gate. Today waits en Outlook · often delays.
 *
 * SHAPE · handoff banner Alec→Stacy + confirm dialog (F3 secondary shape)
 * REUSE · mbi/FlowHandoff shape (persona chain viz) · ConfirmDialog primitive
 * NOTIF · dispatchea `projex:wc9-confirmed` on confirm
 */

import { useState } from 'react'
import {
    ArrowRight, User, CheckCircle2, Loader2, HardHat, ClipboardCheck,
    Image, AlertTriangle, Ruler, Building2,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'

const PUNCH_LIST = [
    { id: 'P1', label: 'Panel alignment · east wall',        status: 'complete' as const, note: 'All 12 panels within ±2mm tolerance' },
    { id: 'P2', label: 'Cable pass-throughs · sealed',       status: 'complete' as const, note: 'Fire-caulk verified' },
    { id: 'P3', label: 'Floor track anchor · torque check',  status: 'complete' as const, note: 'Torqued to 45 ft-lb spec' },
    { id: 'P4', label: 'Trim + reveal strips · finished',    status: 'complete' as const, note: 'Client walkthrough approved 2026-08-13' },
    { id: 'P5', label: 'Punch photos uploaded',              status: 'complete' as const, note: '18 photos · SharePoint /NCBA/install/photos' },
]

export default function F3_p33_WallsPMGateScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const alec = PROJEX_PERSONAS.alec
    const stacy = PROJEX_PERSONAS.stacy

    const [stage, setStage] = useState<'handoff' | 'confirming' | 'confirmed'>('handoff')

    const handleConfirm = () => {
        if (stage !== 'handoff') return
        setStage('confirming')
        pauseAwareTimeout(() => {
            setStage('confirmed')
            window.dispatchEvent(new CustomEvent('projex:wc9-confirmed'))
        }, 1200)
    }

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.SHAREPOINT_PROJECTS] },
        { sources: [PROJEX_SOURCES.NETSUITE_BILL] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F3</span>
                    <span>Progress billing · step 3</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-warning/10 text-warning font-semibold rounded-md px-1.5 py-0.5">
                        <ClipboardCheck className="h-3 w-3" aria-hidden="true" /> WC9 · human gate
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Walls PM-review gate (WC9) · {alec.fullName.split(' ')[0]} handoff to {stacy.fullName.split(' ')[0]}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Walls 60/30/10 · 30% draw fires only after Stacy confirms installation-complete. Today waits en Outlook · often delays fires.
                </p>
            </div>

            {/* Handoff banner · persona chain Alec → Stacy */}
            <div className={`
                rounded-2xl border p-4 flex items-center gap-4 transition-all
                ${stage === 'handoff' ? 'border-warning/40 bg-warning/5' : ''}
                ${stage === 'confirming' ? 'border-ai/40 bg-ai-light/20' : ''}
                ${stage === 'confirmed' ? 'border-success/40 bg-success/5' : ''}
            `}>
                <div className="h-12 w-12 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0 font-bold text-sm">
                    {alec.initials}
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{alec.role}</div>
                    <div className="text-sm text-foreground font-semibold">{alec.fullName}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Requesting draw release</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                    stage === 'confirmed' ? 'bg-success/15 text-success' : 'bg-primary/15 text-foreground'
                }`}>
                    {stacy.initials}
                </div>
                <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{stacy.role}</div>
                    <div className="text-sm text-foreground font-semibold">{stacy.fullName}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Confirms installation-complete</div>
                </div>
                {stage === 'handoff' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-warning bg-warning/10 rounded px-1.5 py-0.5">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        Awaiting Stacy
                    </span>
                )}
                {stage === 'confirming' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ai animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                        Confirming…
                    </span>
                )}
                {stage === 'confirmed' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        Confirmed · draw cleared
                    </span>
                )}
            </div>

            {/* Punch list · what Stacy is confirming */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <HardHat className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Installation punch list · NCBA · east wall crew
                        </span>
                        <span className="ml-auto text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                            5/5 complete
                        </span>
                    </div>
                    <div className="p-4 space-y-2">
                        {PUNCH_LIST.map(item => (
                            <div key={item.id} className="flex items-start gap-2 border-b border-border/40 pb-2 last:border-0">
                                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-foreground font-medium">{item.label}</div>
                                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.note}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Confirm card · Stacy's decision */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Draw request</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Project</div>
                            <div className="text-sm text-foreground font-semibold mt-0.5">NCBA · install completion</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Structure</div>
                            <div className="text-sm text-foreground">Walls 60/30/10 · 30% draw</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Amount</div>
                            <div className="text-lg text-foreground font-bold tabular-nums">$18,740</div>
                        </div>
                        <div className="pt-3 border-t border-border">
                            <div className="flex items-center gap-2 text-[11px]">
                                <Image className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                <span className="text-foreground">18 punch photos attached</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-border">
                        {stage === 'handoff' && (
                            <button
                                onClick={handleConfirm}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                Confirm installation-complete
                            </button>
                        )}
                        {stage === 'confirmed' && (
                            <button
                                onClick={nextStep}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-foreground text-background text-xs font-bold px-3 py-2.5 rounded-lg hover:opacity-80 transition-opacity"
                            >
                                Continue · AR aging board
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-warning/40 bg-warning/5 px-4 py-3 flex items-start gap-3">
                <Building2 className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">WC9 · one of 4 confirmed-High pain points</div>
                    <div className="text-muted-foreground mt-0.5">
                        {stacy.fullName} is the sole Walls coordinator · her sign-off gates every Walls draw fire. Structured handoff con photo evidence surfaces here vs waiting en Outlook.
                    </div>
                </div>
            </div>

            <DataSourcesBar groups={dataGroups} label="Walls PM-gate · installation photos → draw release" />
        </div>
    )
}
