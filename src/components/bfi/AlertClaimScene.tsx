/**
 * COMPONENT: AlertClaimScene  (r1.4)
 * PURPOSE: Product Receiving step 4 — missing carton alert + two actions:
 *          (1) Notify Andy at Herman Miller  (2) Open Omni service claim.
 *          CTA to "Core Entry" unlocks when both actions complete.
 *
 * States: 'alert' — both modals can be triggered independently.
 */

import { useState } from 'react'
import { AlertTriangle, Mail, FileWarning, CheckCircle2, ChevronRight, X } from 'lucide-react'
import ReceivingProcessBar from './ReceivingProcessBar'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface AlertClaimSceneProps {
    onProceed?: () => void
}

const NOTIFY_DRAFT = `Hi Andy,

We're following up on a short-ship for PMO-2026-0412.

Carton #34 (Bingo #34) was not received at our WIG New Jersey warehouse.
Line 24 — Chair Frame Assembly ×1 is missing.

Could you confirm the shipping status and provide tracking for the missing carton?

Thank you,
Lauren D. — BFI Furniture Industries`

const CLAIM_FIELDS = [
    { label: 'PMO Number',   value: 'PMO-2026-0412' },
    { label: 'Claim Type',   value: 'Short Shipped'  },
    { label: 'Reason',       value: 'Carton not received at destination warehouse' },
    { label: 'Warehouse',    value: 'WIG New Jersey'  },
    { label: 'Bingo Number', value: '#34'             },
    { label: 'Line',         value: 'Line 24'         },
    { label: 'Item',         value: 'Chair Frame Assembly ×1' },
    { label: 'Vendor',       value: 'Herman Miller'   },
    { label: 'Carrier',      value: 'ALTL'            },
]

export default function AlertClaimScene({ onProceed }: AlertClaimSceneProps) {
    const [showNotify, setShowNotify]   = useState(false)
    const [showClaim, setShowClaim]     = useState(false)
    const [notified, setNotified]       = useState(false)
    const [claimed, setClaimed]         = useState(false)
    const [sending, setSending]         = useState(false)
    const [submitting, setSubmitting]   = useState(false)

    const handleSendNotify = () => {
        setSending(true)
        setTimeout(() => {
            setNotified(true)
            setSending(false)
            setShowNotify(false)
        }, 600)
    }

    const handleSubmitClaim = () => {
        setSubmitting(true)
        setTimeout(() => {
            setClaimed(true)
            setSubmitting(false)
            setShowClaim(false)
        }, 600)
    }

    const bothDone = notified && claimed

    return (
        <div className="space-y-4">
            <ReceivingProcessBar stepId="r1.4" />

            {/* Missing carton alert */}
            <div className="bg-destructive/5 border border-destructive/40 rounded-xl p-3.5 space-y-3">
                <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-destructive text-sm">Missing: Carton #34</div>
                        <div className="text-foreground mt-0.5">Line 24 · Chair Frame Assembly ×1 · short-shipped at origin</div>
                        <div className="text-muted-foreground mt-1 text-[11px]">
                            PMO-2026-0412 · WIG New Jersey · detected by AI analysis
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                        onClick={() => !notified && setShowNotify(true)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            notified
                                ? 'bg-success/10 border border-success/30 text-success'
                                : 'bg-card border border-border text-foreground hover:bg-muted/30'
                        }`}
                    >
                        {notified
                            ? <><CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Notified Andy ✓</>
                            : <><Mail className="h-3.5 w-3.5 shrink-0" /> Notify Andy (HM)</>
                        }
                    </button>
                    <button
                        onClick={() => !claimed && setShowClaim(true)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            claimed
                                ? 'bg-success/10 border border-success/30 text-success'
                                : 'bg-card border border-border text-foreground hover:bg-muted/30'
                        }`}
                    >
                        {claimed
                            ? <><CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Claim filed ✓</>
                            : <><FileWarning className="h-3.5 w-3.5 shrink-0" /> Open Omni Claim</>
                        }
                    </button>
                </div>
            </div>

            {/* AS-IS contrast */}
            <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Before Strata:</span> Lauren manually drafted the email to Andy, separately filed the Omni claim by copying PMO and item details by hand. Both steps took 20–30 minutes combined and were error-prone.
                </p>
            </div>

            {/* Proceed CTA */}
            {bothDone && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <div className="bg-success/5 border border-success/30 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        <div className="text-xs">
                            <div className="font-bold text-foreground">Both actions complete</div>
                            <div className="text-muted-foreground">Andy notified · Omni claim #OM-2026-0412 filed · 34/35 cartons can proceed to CORE</div>
                        </div>
                    </div>
                    <button
                        onClick={() => onProceed?.()}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                    >
                        Proceed to Core Entry
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {!bothDone && (
                <p className="text-[11px] text-muted-foreground text-center">
                    Complete both actions above to proceed to Core Entry
                </p>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />

            {/* Modal — Notify Andy */}
            {showNotify && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 pl-[calc(320px+1.5rem)]">
                    <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                            <div className="text-sm font-bold text-foreground">Notify Andy · Herman Miller</div>
                            <button onClick={() => setShowNotify(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-2">
                                {[
                                    { label: 'To', value: 'andy@hermanmiller.com' },
                                    { label: 'Subject', value: 'Missing carton alert — PMO-2026-0412 · Bingo #34' },
                                ].map(f => (
                                    <div key={f.label} className="flex items-start gap-3 text-xs border-b border-border/50 pb-2">
                                        <span className="text-muted-foreground w-16 shrink-0 pt-0.5">{f.label}:</span>
                                        <span className="text-foreground font-medium">{f.value}</span>
                                    </div>
                                ))}
                            </div>
                            <textarea
                                readOnly
                                defaultValue={NOTIFY_DRAFT}
                                className="w-full h-52 text-xs text-muted-foreground bg-muted/30 border border-border rounded-xl px-4 py-3 resize-none font-mono leading-relaxed"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowNotify(false)}
                                    className="flex-1 text-sm font-semibold text-muted-foreground py-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendNotify}
                                    disabled={sending}
                                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 text-sm font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-all"
                                >
                                    <Mail className="h-4 w-4" />
                                    {sending ? 'Sending…' : 'Send'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal — Omni Claim */}
            {showClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 pl-[calc(320px+1.5rem)]">
                    <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                            <div className="text-sm font-bold text-foreground">Omni Service Claim · Pre-filled</div>
                            <button onClick={() => setShowClaim(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Incident banner */}
                            <div className="flex items-start gap-3 bg-destructive/5 border border-destructive/30 rounded-xl px-4 py-3">
                                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-xs font-bold text-destructive mb-0.5">Short-ship detected — AI bingo sheet analysis</div>
                                    <div className="text-xs text-foreground">
                                        Carton <span className="font-semibold">#34 (Bingo #34)</span> was not received at WIG New Jersey warehouse.
                                        Carrier ALTL delivered <span className="font-semibold">34 of 35</span> cartons on May 11.
                                    </div>
                                </div>
                            </div>

                            {/* Claim fields */}
                            <div className="border border-border rounded-xl overflow-hidden">
                                {CLAIM_FIELDS.map((f, i) => (
                                    <div key={f.label} className={`flex items-center justify-between gap-3 px-4 py-2.5 ${i < CLAIM_FIELDS.length - 1 ? 'border-b border-border' : ''}`}>
                                        <span className="text-xs text-muted-foreground w-28 shrink-0">{f.label}</span>
                                        <span className="text-xs font-semibold text-foreground text-right">{f.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowClaim(false)}
                                    className="flex-1 text-sm font-semibold text-muted-foreground py-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitClaim}
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 text-sm font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-all"
                                >
                                    <FileWarning className="h-4 w-4" />
                                    {submitting ? 'Filing…' : 'Submit Claim'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
