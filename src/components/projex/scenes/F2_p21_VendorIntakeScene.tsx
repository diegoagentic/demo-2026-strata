/**
 * COMPONENT: F2_p21_VendorIntakeScene (Projex · p2.1)
 * PURPOSE: Kelly submits structured vendor intake · Warehouse by Design install
 *          vendor · attach W-9. Modal wizard pattern (`create-record` shell)
 *          reemplaza el free-text email a Daniel · ticket enters queue con
 *          provenance.
 *
 *          Shape LOCK · modal-panes + form intake (F2 primary shape).
 *
 * DS TOKENS: bg-card · bg-primary + text-primary-foreground · bg-ai-light + text-ai ·
 *            border-border · text-muted-foreground · tabular-nums
 *
 * SOURCE OF TRUTH: SOT §12b · VS1 Kelly ad-hoc email pain · structured intake fix
 * REUSE FROM: bfi/DesignerRFQScene shape (email compose + form panel side-by-side) ·
 *             mbi/EmailInboxDropZone (drop zone idle → dragover → processing) ·
 *             shared/AIEmailComposer (form field patterns)
 *
 * NOTIF: dispatchea `projex:vendor-request-submitted` en submit → advance p2.2
 */

import { useEffect, useState } from 'react'
import {
    Sparkles, User, Paperclip, FileText, Send, CheckCircle2,
    ArrowRight, Building2, Wallet, Clock, Truck,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { WBD_W9 } from '../../../config/profiles/projex-data/w9Records'

type Phase = 'blank' | 'typing' | 'attached' | 'submitting' | 'submitted'

export default function F2_p21_VendorIntakeScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const kelly = PROJEX_PERSONAS.kelly
    const daniel = PROJEX_PERSONAS.daniel

    const [phase, setPhase] = useState<Phase>('blank')

    // Auto choreography · blank → typing → attached
    useEffect(() => {
        const c1 = pauseAwareTimeout(() => setPhase('typing'), 700)
        const c2 = pauseAwareTimeout(() => setPhase('attached'), 2200)
        return () => { c1(); c2() }
    }, [pauseAwareTimeout])

    const handleSubmit = () => {
        if (phase !== 'attached') return
        setPhase('submitting')
        pauseAwareTimeout(() => {
            setPhase('submitted')
            window.dispatchEvent(new CustomEvent('projex:vendor-request-submitted'))
        }, 900)
    }

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.SHAREPOINT_PROJECTS] },
        { sources: [PROJEX_SOURCES.STRATA_COMPOSER] },
        { sources: [PROJEX_SOURCES.NETSUITE_VENDOR] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F2</span>
                    <span>Vendor onboarding · step 1</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-primary/15 text-foreground font-semibold rounded-md px-1.5 py-0.5">
                        <User className="h-3 w-3" aria-hidden="true" /> {kelly.role}
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Coordinator requests new vendor · Kelly submits structured intake
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Free-text email a Daniel reemplazado por form structured · attach W-9 upfront · provenance a Daniel\'s queue.
                </p>
            </div>

            {/* Layout · form (izq · 60%) + preview lo que verá Daniel (der · 40%) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 items-start">

                {/* Intake form panel */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-ai/15 text-ai flex items-center justify-center text-[11px] font-bold">
                            {kelly.initials}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground">{kelly.fullName}</div>
                            <div className="text-[11px] text-muted-foreground">New vendor request · structured intake form</div>
                        </div>
                        <span className="ml-auto inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
                            <Sparkles className="h-3 w-3" aria-hidden="true" /> Draft assist
                        </span>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Vendor name */}
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Vendor name</label>
                            <div className={`
                                mt-1 rounded-lg border bg-background px-3 py-2 text-sm font-medium min-h-[38px] transition-all
                                ${phase === 'blank' ? 'border-border text-muted-foreground italic' : 'border-primary/40 text-foreground'}
                            `}>
                                {phase === 'blank' ? 'e.g. Warehouse by Design…' : (
                                    <span className="animate-in fade-in duration-300">Warehouse by Design</span>
                                )}
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Why this vendor · project + scope</label>
                            <div className={`
                                mt-1 rounded-lg border bg-background px-3 py-2 text-sm min-h-[58px] transition-all
                                ${phase === 'blank' ? 'border-border text-muted-foreground italic' : 'border-border text-foreground'}
                            `}>
                                {phase === 'blank' ? 'e.g. Denver Financial install crew · Aug 12-13 · $3,200 quote…' : (
                                    <span className="animate-in fade-in duration-300">
                                        Denver Financial · install crew for phase 2 · Aug 12-13 · quote $3,200 · AP9 install pattern (bills sin PO # · needs PM double-check)
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Payment method */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Payment method</label>
                                <div className={`
                                    mt-1 rounded-lg border bg-background px-3 py-2 text-sm min-h-[38px] transition-all
                                    ${phase === 'blank' ? 'border-border text-muted-foreground italic' : 'border-border text-foreground'}
                                `}>
                                    {phase === 'blank' ? '—' : (
                                        <span className="inline-flex items-center gap-1.5 animate-in fade-in duration-300">
                                            <Wallet className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                            ACH
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Terms</label>
                                <div className={`
                                    mt-1 rounded-lg border bg-background px-3 py-2 text-sm min-h-[38px] transition-all
                                    ${phase === 'blank' ? 'border-border text-muted-foreground italic' : 'border-border text-foreground'}
                                `}>
                                    {phase === 'blank' ? '—' : (
                                        <span className="inline-flex items-center gap-1.5 animate-in fade-in duration-300">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                            Net 10
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* W-9 attach */}
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">W-9 attachment</label>
                            <div className={`
                                mt-1 rounded-lg border-2 border-dashed px-3 py-4 text-sm text-center transition-all
                                ${phase === 'blank' || phase === 'typing' ? 'border-border/60 bg-muted/30 text-muted-foreground italic' : 'border-success/40 bg-success/5'}
                            `}>
                                {(phase === 'blank' || phase === 'typing') ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Paperclip className="h-4 w-4" aria-hidden="true" />
                                        Drop signed W-9 or click to browse…
                                    </span>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center justify-center gap-2">
                                        <FileText className="h-4 w-4 text-success" aria-hidden="true" />
                                        <span className="text-foreground font-medium">{WBD_W9.fileName}</span>
                                        <span className="text-[10px] text-muted-foreground tabular-nums">312 KB · signed 2026-03-12</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <span className="text-[10px] text-muted-foreground flex-1">
                                Ticket enters {daniel.fullName.split(' ')[0]}\'s queue on submit · nothing sent to NetSuite until Jacob signs off.
                            </span>
                            {phase === 'attached' && (
                                <button
                                    onClick={handleSubmit}
                                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity animate-in fade-in duration-300"
                                >
                                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                    Submit request
                                </button>
                            )}
                            {phase === 'submitting' && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ai animate-pulse">
                                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                    Submitting…
                                </span>
                            )}
                            {phase === 'submitted' && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success animate-in fade-in duration-300">
                                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    Ticket in Daniel\'s queue
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* What Daniel receives (right side preview) */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Daniel\'s queue · preview
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground">Structured intake</span>
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                        {(phase === 'blank' || phase === 'typing') && (
                            <div className="text-muted-foreground italic py-8 text-center">
                                Awaiting submission from Kelly…
                            </div>
                        )}
                        {(phase === 'attached' || phase === 'submitting') && (
                            <div className="opacity-50">
                                <div className="text-foreground font-semibold">Warehouse by Design</div>
                                <div className="text-muted-foreground mt-1">Awaiting submit…</div>
                            </div>
                        )}
                        {phase === 'submitted' && (
                            <div className="animate-in fade-in slide-in-from-right-2 duration-500 rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-destructive/15 text-destructive flex items-center justify-center text-[9px] font-bold">
                                        WBD
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-foreground">Warehouse by Design</div>
                                        <div className="text-[10px] text-muted-foreground font-mono">TKT-P2-2026-08-14-001</div>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-ai-light text-ai rounded-full px-2 py-0.5">Just now</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Requested by</span><span className="text-foreground">{kelly.fullName}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Project</span><span className="text-foreground">Denver Financial</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Terms</span><span className="text-foreground">ACH · Net 10</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">W-9</span><span className="text-foreground">Attached</span></div>
                                </div>
                                <div className="pt-2 border-t border-primary/20 flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">Ready for Daniel · OCR + preflight</span>
                                    <button
                                        onClick={nextStep}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold rounded bg-foreground text-background py-1.5 px-2.5 hover:opacity-80 transition-opacity"
                                    >
                                        Open ticket
                                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Anchor · why structured intake */}
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
                <Truck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Why structured intake matters (VS1)</div>
                    <div className="text-muted-foreground mt-0.5">
                        Today Kelly emails Daniel free-text · Daniel spends hours setting up · every other payment run blocked por vendor setup gaps. Structured intake carries provenance · W-9 upfront · triggers OCR + preflight automatically · Daniel only reviews.
                    </div>
                </div>
            </div>

            <DataSourcesBar groups={dataGroups} label="Vendor intake · form → provenance → Daniel queue" />
        </div>
    )
}
