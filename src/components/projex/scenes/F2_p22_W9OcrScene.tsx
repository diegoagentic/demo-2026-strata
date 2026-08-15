/**
 * COMPONENT: F2_p22_W9OcrScene (Projex · p2.2)
 * PURPOSE: Daniel opens Kelly's ticket · sees W-9 source PDF (mocked bounding-box
 *          overlay) · Strata OCR extracts 5 fields staggered · per-field confidence
 *          %. Daniel corrects fields con conf <95% inline (2 correctable fields).
 *          Save → routes to compliance preflight (p2.3 auto).
 *
 *          Shape LOCK · split-pane (doc left · fields right) inside modal-panes.
 *
 * DS TOKENS: bg-card · bg-primary + text-primary-foreground · bg-ai-light + text-ai ·
 *            border-border · text-warning (medium conf) · text-success (high conf) ·
 *            tabular-nums
 *
 * SOURCE OF TRUTH: SOT §12b · VS2 undated W-9s en SharePoint · fix con OCR
 * REUSE FROM: mbi/SIFParserPreview (bounding-box overlay pattern) ·
 *             vendor/expert-catalog/create-record/field-row/* (field row primitives)
 *
 * NOTIF: dispatchea `projex:w9-ocr-validated` on Save → advance p2.3 auto
 */

import { useEffect, useState } from 'react'
import {
    Sparkles, FileText, CheckCircle2, AlertTriangle, Loader2,
    Edit3, Save, ArrowRight, Fingerprint, Building2, Calendar, MapPin,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { WBD_W9 } from '../../../config/profiles/projex-data/w9Records'

// Icons por field key
const FIELD_ICONS: Record<string, React.ElementType> = {
    'legal-name':  Building2,
    'entity-type': Building2,
    'ein':         Fingerprint,
    'signed-date': Calendar,
    'address':     MapPin,
}

export default function F2_p22_W9OcrScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const daniel = PROJEX_PERSONAS.daniel
    const kelly = PROJEX_PERSONAS.kelly

    // Staged reveal · 1 field every ~350ms
    const [revealed, setRevealed] = useState(0)
    const [correctedIds, setCorrectedIds] = useState<Set<string>>(new Set())
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

    useEffect(() => {
        if (revealed < WBD_W9.fields.length) {
            const cancel = pauseAwareTimeout(() => setRevealed(n => n + 1), 350)
            return cancel
        }
    }, [revealed, pauseAwareTimeout])

    const handleCorrect = (fieldKey: string) => {
        setCorrectedIds(prev => new Set([...prev, fieldKey]))
    }

    const handleSave = () => {
        if (saveState !== 'idle') return
        setSaveState('saving')
        pauseAwareTimeout(() => {
            setSaveState('saved')
            window.dispatchEvent(new CustomEvent('projex:w9-ocr-validated'))
        }, 900)
    }

    const allRevealed = revealed >= WBD_W9.fields.length
    const correctableCount = WBD_W9.fields.filter(f => f.correctable).length
    const stillNeedsCorrection = WBD_W9.fields.filter(f => f.correctable && !correctedIds.has(f.key)).length
    const avgConf = Math.round(WBD_W9.fields.reduce((s, f) => s + f.conf, 0) / WBD_W9.fields.length)

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.SHAREPOINT_PROJECTS] },
        { sources: [PROJEX_SOURCES.STRATA_OCR_PJX] },
        { sources: [PROJEX_SOURCES.W9_REGISTRY] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F2</span>
                    <span>Vendor onboarding · step 2</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                        <Sparkles className="h-3 w-3" aria-hidden="true" /> OCR live
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    W-9 upload + OCR extraction · {daniel.fullName.split(' ')[0]} reviews 5 fields
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Source PDF con bounding-box overlay · per-field confidence · Daniel corrects fields con conf &lt;95%.
                </p>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{WBD_W9.fields.length}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Fields extracted</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-ai-light flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-ai" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{avgConf}%</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Avg OCR confidence</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{stillNeedsCorrection}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Needs Daniel\'s eyes</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{correctedIds.size}/{correctableCount}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Corrected</div>
                    </div>
                </div>
            </div>

            {/* Layout · split pane · doc preview (left) + fields extracted (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

                {/* Doc preview con bounding-box overlay */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Source PDF
                        </span>
                        <span className="ml-auto text-[10px] font-mono text-muted-foreground truncate max-w-[220px]">
                            {WBD_W9.fileName}
                        </span>
                    </div>
                    <div className="p-4 relative min-h-[420px] bg-muted/10">
                        {/* Faux W-9 form layout */}
                        <div className="relative bg-background rounded-lg border border-border/60 p-6 space-y-4 shadow-sm">
                            <div className="text-center border-b border-border pb-2">
                                <div className="text-xs font-bold text-foreground">Form W-9</div>
                                <div className="text-[10px] text-muted-foreground">Request for Taxpayer Identification Number and Certification</div>
                            </div>

                            {/* Field 1 · legal name · con bounding-box overlay animated */}
                            <div className={`relative p-2 rounded ${revealed >= 1 ? 'ring-2 ring-ai/40 bg-ai/5 animate-in fade-in duration-300' : ''}`}>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Name</div>
                                <div className="text-sm text-foreground">Warehouse by Design LLC</div>
                                {revealed >= 1 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-ai text-white rounded px-1 tabular-nums">99%</span>}
                            </div>

                            {/* Field 2 · entity type */}
                            <div className={`relative p-2 rounded ${revealed >= 2 ? 'ring-2 ring-ai/40 bg-ai/5 animate-in fade-in duration-300' : ''}`}>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Federal tax classification</div>
                                <div className="text-sm text-foreground">☑ Limited liability company · single-member</div>
                                {revealed >= 2 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-ai text-white rounded px-1 tabular-nums">96%</span>}
                            </div>

                            {/* Field 3 · EIN · con warning overlay */}
                            <div className={`relative p-2 rounded ${revealed >= 3 ? 'ring-2 ring-warning bg-warning/5 animate-in fade-in duration-300' : ''}`}>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Employer identification number</div>
                                <div className="text-sm text-foreground font-mono">**-***2841</div>
                                {revealed >= 3 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-warning text-white rounded px-1 tabular-nums">92%</span>}
                            </div>

                            {/* Field 4 · signed date */}
                            <div className={`relative p-2 rounded ${revealed >= 4 ? 'ring-2 ring-ai/40 bg-ai/5 animate-in fade-in duration-300' : ''}`}>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Signature · date</div>
                                <div className="text-sm text-foreground italic">2026-03-12</div>
                                {revealed >= 4 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-ai text-white rounded px-1 tabular-nums">100%</span>}
                            </div>

                            {/* Field 5 · address · warning */}
                            <div className={`relative p-2 rounded ${revealed >= 5 ? 'ring-2 ring-warning bg-warning/5 animate-in fade-in duration-300' : ''}`}>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Address</div>
                                <div className="text-sm text-foreground">4820 Wynkoop St · Denver CO 80216</div>
                                {revealed >= 5 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-warning text-white rounded px-1 tabular-nums">88%</span>}
                            </div>
                        </div>

                        {!allRevealed && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-background/80 backdrop-blur rounded-lg px-3 py-2 border border-ai/40 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 text-ai animate-spin" aria-hidden="true" />
                                    <span className="text-xs font-semibold text-foreground">Strata OCR reading… {revealed}/{WBD_W9.fields.length}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Extracted fields with correction affordance */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-ai" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Extracted fields · Daniel review
                        </span>
                        {allRevealed && stillNeedsCorrection === 0 && (
                            <span className="ml-auto text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                                All corrections done
                            </span>
                        )}
                        {allRevealed && stillNeedsCorrection > 0 && (
                            <span className="ml-auto text-[10px] font-bold text-warning bg-warning/10 rounded px-1.5 py-0.5">
                                {stillNeedsCorrection} pending
                            </span>
                        )}
                    </div>
                    <div className="p-4 space-y-2">
                        {WBD_W9.fields.slice(0, revealed).map(f => {
                            const Icon = FIELD_ICONS[f.key] ?? FileText
                            const isCorrected = correctedIds.has(f.key)
                            const needsCorrection = f.correctable && !isCorrected
                            return (
                                <div
                                    key={f.key}
                                    className={`
                                        animate-in fade-in slide-in-from-right-1 duration-300 rounded-lg border px-3 py-2 flex items-start gap-2
                                        ${isCorrected ? 'border-success/40 bg-success/5' : needsCorrection ? 'border-warning/40 bg-warning/5' : 'border-border bg-card'}
                                    `}
                                >
                                    <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</span>
                                            <span className={`text-[10px] font-bold tabular-nums rounded px-1 ${
                                                f.band === 'high' ? 'bg-success/10 text-success' :
                                                f.band === 'medium' ? 'bg-warning/10 text-warning' :
                                                'bg-destructive/10 text-destructive'
                                            }`}>
                                                {f.conf}%
                                            </span>
                                        </div>
                                        <div className="text-sm text-foreground font-medium mt-0.5 truncate">{f.value}</div>
                                    </div>
                                    {needsCorrection && (
                                        <button
                                            onClick={() => handleCorrect(f.key)}
                                            className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-primary/15 hover:bg-primary/25 rounded px-1.5 py-0.5 transition-colors"
                                        >
                                            <Edit3 className="h-3 w-3" aria-hidden="true" />
                                            Confirm
                                        </button>
                                    )}
                                    {isCorrected && (
                                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-success">
                                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                            OK
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Save CTA when all revealed */}
                    {allRevealed && (
                        <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2 animate-in fade-in duration-300">
                            <span className="text-[10px] text-muted-foreground flex-1">
                                Route to compliance preflight when all fields confirmed.
                            </span>
                            {saveState === 'idle' && (
                                <button
                                    onClick={handleSave}
                                    disabled={stillNeedsCorrection > 0}
                                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                                >
                                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                                    Save + run preflight
                                </button>
                            )}
                            {saveState === 'saving' && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ai animate-pulse">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                    Saving…
                                </span>
                            )}
                            {saveState === 'saved' && (
                                <button
                                    onClick={nextStep}
                                    className="inline-flex items-center gap-1.5 bg-foreground text-background text-xs font-bold px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
                                >
                                    Run preflight
                                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Provenance strip */}
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-ai/15 text-ai flex items-center justify-center text-[10px] font-bold shrink-0">
                    {kelly.initials}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                    <span className="text-foreground font-semibold">Ticket TKT-P2-2026-08-14-001 </span>
                    <span className="text-muted-foreground">· requested by {kelly.fullName} · Denver Financial install · $3,200 · Aug 12-13</span>
                </div>
            </div>

            <DataSourcesBar groups={dataGroups} label="W-9 OCR · source PDF → Strata OCR → field validation" />
        </div>
    )
}
