/**
 * COMPONENT: F2_p24_JacobGateScene (Projex · p2.4)
 * PURPOSE: Jacob opens review modal · W-9 result + preflight result side-by-side.
 *          Binary decision · Release (approve · sends to NetSuite master) o
 *          Reject (sends back to Daniel/Kelly con reason capture).
 *          Never auto-post · human touch preserved (Matt "75% AI + human touch").
 *
 *          Shape LOCK · modal-panes (F2 primary shape) · full-screen approval modal.
 *
 * DS TOKENS: bg-card · bg-primary + text-primary-foreground · ring-2 ring-primary/40
 *            (spotlight) · bg-success/10 · bg-destructive/10 · border-border
 *
 * SOURCE OF TRUTH: SOT §12b · Jacob compliance sign-off · never auto-add rule
 * REUSE FROM: mbi/ARHoldReviewModal shape (approval con reason capture) ·
 *             shared/ReasonDialog primitive
 *
 * NOTIF: dispatchea `projex:jacob-approved` on release → advance p2.5
 *        o `projex:jacob-rejected` on reject → cycle back (demo only advances)
 */

import { useState } from 'react'
import {
    Sparkles, ShieldCheck, CheckCircle2, XCircle, Loader2,
    ArrowRight, User, Fingerprint, Calendar, MapPin,
    AlertTriangle, Building2, Wallet,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { useHighlightOnAcClick } from '../hooks/useHighlightOnAcClick'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { WBD_W9, WBD_PREFLIGHT } from '../../../config/profiles/projex-data/w9Records'

const REJECT_REASONS = [
    { id: 'ach-missing',   label: 'ACH details missing',           detail: 'Bank routing not verified · needs re-attach' },
    { id: 'tin-mismatch',  label: 'TIN mismatch',                    detail: 'IRS TIN match failed · verify with vendor' },
    { id: 'w8-required',   label: 'Needs W-8 BEN-E',                 detail: 'Non-US address detected · escalate' },
    { id: 'insurance',     label: 'Missing insurance certificate',   detail: 'COI required for install vendor' },
    { id: 'other',         label: 'Other · custom reason',           detail: 'Free-text reason' },
]

export default function F2_p24_JacobGateScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const jacob = PROJEX_PERSONAS.jacob
    const daniel = PROJEX_PERSONAS.daniel

    const [decision, setDecision] = useState<'pending' | 'releasing' | 'released' | 'rejecting' | 'rejected'>('pending')
    const [showReject, setShowReject] = useState(false)
    const [selectedReason, setSelectedReason] = useState<string | null>(null)

    // F76 · Action Center CTA `Open PM confirm →` (event `projex:jacob-gate-open`)
    // scrolls to + highlights the Release button · user must click to decide.
    const highlight = useHighlightOnAcClick('projex:jacob-gate-open')

    const handleRelease = () => {
        if (decision !== 'pending') return
        setDecision('releasing')
        pauseAwareTimeout(() => {
            setDecision('released')
            window.dispatchEvent(new CustomEvent('projex:jacob-approved'))
        }, 1400)
    }

    const handleReject = () => {
        if (!selectedReason) return
        setDecision('rejecting')
        pauseAwareTimeout(() => {
            setDecision('rejected')
            setShowReject(false)
            window.dispatchEvent(new CustomEvent('projex:jacob-rejected'))
        }, 1000)
    }

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.W9_REGISTRY] },
        { sources: [PROJEX_SOURCES.STRATA_AI_PJX] },
        { sources: [PROJEX_SOURCES.NETSUITE_VENDOR] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F2</span>
                    <span>Vendor onboarding · step 4</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-primary/15 text-foreground font-semibold rounded-md px-1.5 py-0.5">
                        <User className="h-3 w-3" aria-hidden="true" /> {jacob.role} · human gate
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Jacob compliance sign-off gate · Release or Reject
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    W-9 result + preflight result side-by-side. Human decision preserves Matt&apos;s "75% AI + human touch" rule.
                </p>
            </div>

            {/* CEO framing banner */}
            <div className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/25 text-foreground flex items-center justify-center shrink-0 font-bold text-xs">
                    MM
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CEO framing · Matt Magrann</div>
                    <div className="text-sm text-foreground italic mt-0.5">
                        &quot;Never auto-add to the vendor master · human touch on every new vendor.&quot;
                    </div>
                </div>
            </div>

            {/* Layout · W-9 result (left) + Preflight result (right) side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

                {/* W-9 result card */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-ai" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            W-9 result · OCR validated by Daniel
                        </span>
                    </div>
                    <div className="p-4 space-y-2">
                        {WBD_W9.fields.map(f => {
                            const Icon = f.key === 'ein' ? Fingerprint : f.key === 'signed-date' ? Calendar : f.key === 'address' ? MapPin : Building2
                            return (
                                <div key={f.key} className="flex items-start gap-2 border-b border-border/40 pb-1.5 last:border-0">
                                    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</div>
                                        <div className="text-xs text-foreground font-medium truncate">{f.value}</div>
                                    </div>
                                    <span className="text-[10px] font-bold text-success tabular-nums shrink-0">✓ {f.conf}%</span>
                                </div>
                            )
                        })}
                        <div className="pt-2 mt-2 border-t border-border flex items-center gap-2 text-[11px]">
                            <span className="text-muted-foreground">Validated by</span>
                            <span className="text-foreground font-semibold">{daniel.fullName}</span>
                        </div>
                    </div>
                </div>

                {/* Preflight result card */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Preflight result · 4/4 checks passed
                        </span>
                        <span className="ml-auto text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                            All pass
                        </span>
                    </div>
                    <div className="p-4 space-y-2">
                        {WBD_PREFLIGHT.map(c => (
                            <div key={c.id} className="flex items-start gap-2 border-b border-border/40 pb-1.5 last:border-0">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-foreground font-medium">{c.label}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">{c.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Jacob decision card · spotlight until acted upon */}
            <div className={`
                rounded-2xl border p-4 flex items-center gap-3 transition-all
                ${decision === 'pending' ? 'border-primary ring-2 ring-primary/40 bg-primary/5 animate-pulse' : ''}
                ${decision === 'releasing' || decision === 'rejecting' ? 'border-ai bg-ai-light/20' : ''}
                ${decision === 'released' ? 'border-success/40 bg-success/5' : ''}
                ${decision === 'rejected' ? 'border-warning/40 bg-warning/5' : ''}
            `}>
                <div className={`
                    h-12 w-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm
                    ${decision === 'released' ? 'bg-success/15 text-success' :
                      decision === 'rejected' ? 'bg-warning/15 text-warning' :
                      'bg-primary/15 text-foreground'}
                `}>
                    {jacob.initials}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Human decision · Director of Accounting</div>
                    <div className="text-sm text-foreground font-semibold mt-0.5">
                        {jacob.fullName} · approve Warehouse by Design for the vendor master?
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                        All checks clean · vendor is compliant per Jacob&apos;s 4-rule policy. Reject if you want to escalate anyway.
                    </div>
                </div>
                {decision === 'pending' && (
                    <div className="shrink-0 flex items-center gap-2">
                        <button
                            onClick={() => setShowReject(true)}
                            className="inline-flex items-center gap-1.5 border border-destructive/40 text-destructive text-sm font-bold px-3 py-2 rounded-lg hover:bg-destructive/5 transition-colors"
                        >
                            <XCircle className="h-4 w-4" aria-hidden="true" />
                            Reject
                        </button>
                        <button
                            onClick={handleRelease}
                            data-ac-highlight
                            className={`inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity ${highlight ? 'ring-2 ring-primary/60 animate-pulse' : ''}`}
                        >
                            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                            Release to NetSuite
                        </button>
                    </div>
                )}
                {(decision === 'releasing' || decision === 'rejecting') && (
                    <div className="shrink-0 inline-flex items-center gap-2 text-sm font-bold text-ai animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        {decision === 'releasing' ? 'Adding to Vendor master…' : 'Sending back to Accounting…'}
                    </div>
                )}
                {decision === 'released' && (
                    <div className="shrink-0 flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 text-sm font-bold text-success">
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            Released · vendor #734
                        </div>
                        <button
                            onClick={nextStep}
                            className="inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                        >
                            See in registry
                            <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </button>
                    </div>
                )}
                {decision === 'rejected' && (
                    <div className="shrink-0 flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 text-sm font-bold text-warning">
                            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                            Sent back to Accounting
                        </div>
                        <button
                            onClick={nextStep}
                            className="inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                        >
                            Next flow anyway
                            <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>

            {/* Reject reason modal */}
            {showReject && (
                <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
                    <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-border">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reject reason · send back to Accounting</div>
                            <div className="text-sm font-semibold text-foreground mt-0.5">Warehouse by Design · vendor request</div>
                        </div>
                        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
                            {REJECT_REASONS.map(r => {
                                const isSelected = selectedReason === r.id
                                return (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelectedReason(r.id)}
                                        className={`
                                            w-full text-left rounded-lg border px-3 py-2.5 transition-colors
                                            ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted/40'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`h-4 w-4 rounded-full border-2 shrink-0 ${isSelected ? 'border-primary bg-primary' : 'border-border'}`} />
                                            <span className="text-sm font-semibold text-foreground">{r.label}</span>
                                        </div>
                                        <div className="text-[11px] text-muted-foreground mt-1 pl-6">{r.detail}</div>
                                    </button>
                                )
                            })}
                        </div>
                        <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2 bg-muted/20">
                            <button onClick={() => setShowReject(false)} className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!selectedReason}
                                className="text-xs font-bold bg-destructive text-white px-3 py-1.5 rounded hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                            >
                                Send back with reason
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Context strip · payment method + terms */}
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                <Wallet className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <span className="text-foreground font-semibold">ACH · Net 10 · </span>
                    <span className="text-muted-foreground">Once released · vendor enters payment pool for Tue run · first bill flows without payment-run block (removes VS3 pattern).</span>
                </div>
            </div>

            <DataSourcesBar groups={dataGroups} label="Compliance gate · Jacob → NetSuite Vendor master" />
        </div>
    )
}
