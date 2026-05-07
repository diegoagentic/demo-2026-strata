/**
 * w1.3 — ApproveWithReceiptScene
 * Manager: receipt inline (wow #2) · AI policy check · GL preview · edit · approve/reject/plan-B
 *
 * Scenario modes:
 *   approve   — standard flow: AI checks pass → approve → routed to AP with GL pre-filled
 *   reject    — manager sends back with required note → employee resubmit loop
 *   planb     — policy exception: $142.50 > $125 per-diem cap → override with reason OR reject
 *
 * SOT data surfaced:
 *   - Employee context: 3rd expense · avg $118.50 · all past approved within SLA
 *   - AI policy checks: within limit · no duplicates · category allowed
 *   - GL preview: 6200 Vehicle 94% + 6210 Travel 97% (what AP will receive on approval)
 *   - Audit trail: submitted via mobile · 10:32 AM · device: Strata Mobile
 *   - Edit expense inline: reclassify category or adjust amount before approving
 */

import { useState } from 'react'
import {
    CheckCircle2, XCircle, Receipt, AlertTriangle, ChevronRight,
    RotateCcw, Sparkles, Pencil, X, ShieldCheck, Clock, User, Send,
} from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import { ReceiptImage } from './ExpenseSubmitScene'

type ScenarioMode = 'approve' | 'reject' | 'planb'
type ApproveState = 'pending' | 'editing' | 'sending' | 'approved' | 'rejected' | 'overridden'

const CATEGORIES = ['Fuel + Parking', 'Client Meals', 'Travel', 'Office Supplies', 'Other']

const AI_CHECKS = [
    { label: 'Within $150 per-diem limit',         ok: true  },
    { label: 'Category allowed · Fuel + Parking',   ok: true  },
    { label: 'No duplicate detected (last 7 days)', ok: true  },
]

const AI_CHECKS_PLANB = [
    { label: '$142.50 exceeds $125 per-diem cap',   ok: false },
    { label: 'Category allowed · Fuel + Parking',   ok: true  },
    { label: 'No duplicate detected (last 7 days)', ok: true  },
]

const GL_LINES = [
    { desc: 'Fuel — Tampa',  amount: '$95.00',  gl: '6200 · Vehicle Expenses',    confidence: 94 },
    { desc: 'Parking',       amount: '$47.50',  gl: '6210 · Travel & Transit',     confidence: 97 },
]

export default function ApproveWithReceiptScene({ onApprove }: { onApprove?: () => void }) {
    const [mode,          setMode]          = useState<ScenarioMode>('approve')
    const [appState,      setAppState]      = useState<ApproveState>('pending')
    const [rejectNote,    setRejectNote]    = useState('')
    const [overrideNote,  setOverrideNote]  = useState('')
    const [showReject,    setShowReject]    = useState(false)
    const [showOverride,  setShowOverride]  = useState(false)
    const [aiExpanded,    setAiExpanded]    = useState(true)
    const [glExpanded,    setGlExpanded]    = useState(false)
    const [editAmount,    setEditAmount]    = useState('$142.50')
    const [editCategory,  setEditCategory]  = useState('Fuel + Parking')
    const [receiptIdx,    setReceiptIdx]    = useState(0)

    const checks = mode === 'planb' ? AI_CHECKS_PLANB : AI_CHECKS
    const policyViolation = mode === 'planb'

    const reset = () => {
        setAppState('pending')
        setRejectNote('')
        setOverrideNote('')
        setShowReject(false)
        setShowOverride(false)
        setEditAmount('$142.50')
        setEditCategory('Fuel + Parking')
    }

    const switchMode = (m: ScenarioMode) => { setMode(m); reset() }

    const handleApprove = () => {
        setAppState('sending')
        setTimeout(() => {
            setAppState('approved')
            setTimeout(() => onApprove?.(), 1800)
        }, 1200)
    }

    const handleRejectConfirm = () => {
        if (!rejectNote.trim()) return
        setAppState('rejected')
    }

    const handleOverrideConfirm = () => {
        if (!overrideNote.trim()) return
        setAppState('overridden')
        setTimeout(() => onApprove?.(), 900)
    }

    return (
        <div className="max-w-lg mx-auto space-y-4">

            {/* ── Scenario selector ── */}
            <div className="flex gap-1 bg-muted/40 border border-border rounded-xl p-1 w-fit">
                {([
                    { key: 'approve', label: '✓ Approve' },
                    { key: 'reject',  label: '✗ Reject'  },
                    { key: 'planb',   label: '⚠ Over policy' },
                ] as { key: ScenarioMode; label: string }[]).map(s => (
                    <button
                        key={s.key}
                        onClick={() => switchMode(s.key)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                            mode === s.key
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* ── Expense detail card ── */}
            {appState !== 'editing' ? (
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-foreground">John Smith</p>
                                <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">Field Staff</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{editCategory} · May 5, 2026 · The Capital Grille — Tampa, FL</p>
                            <p className="text-xs text-muted-foreground">Approved by: Sarah Johnson — Operations · Tampa</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-foreground">{editAmount}</p>
                        </div>
                    </div>

                    {/* Employee context row */}
                    <div className="flex gap-4 pt-1 border-t border-border/60">
                        <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">3rd expense this month</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Submitted 10:32 AM · Strata Mobile</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-success" />
                        <span className="text-[10px] text-muted-foreground">All 2 prior expenses approved within SLA · avg $118.50</span>
                    </div>

                    {/* Edit button */}
                    {appState === 'pending' && (
                        <button
                            onClick={() => setAppState('editing')}
                            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1 transition-colors"
                        >
                            <Pencil className="h-3 w-3" />
                            Edit before approving
                        </button>
                    )}
                </div>
            ) : (
                /* ── Inline edit form ── */
                <div className="bg-card border border-primary/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                    <p className="text-xs font-semibold text-foreground">Edit expense before approving</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Amount</label>
                            <input
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                className="w-full text-sm font-semibold bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Category</label>
                            <select
                                value={editCategory}
                                onChange={e => setEditCategory(e.target.value)}
                                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                            >
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 bg-ai/5 border border-ai/20 rounded-lg px-2.5 py-2">
                        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                        <p className="text-[10px] text-foreground">Any edits are logged in the audit trail · GL codes will update automatically on save</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setAppState('pending')}
                            className="flex-1 text-xs font-bold py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                        >
                            Save &amp; continue
                        </button>
                        <button
                            onClick={() => { setEditAmount('$142.50'); setEditCategory('Fuel + Parking'); setAppState('pending') }}
                            className="px-3 text-xs py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ── AI review panel ── */}
            {appState !== 'editing' && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <button
                        onClick={() => setAiExpanded(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-ai" />
                            <span className="text-xs font-semibold text-foreground">AI Policy Review</span>
                            {policyViolation
                                ? <span className="text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded-full">1 exception</span>
                                : <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">All checks passed</span>
                            }
                        </div>
                        <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${aiExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {aiExpanded && (
                        <div className="px-4 pb-4 space-y-2 animate-in fade-in duration-200">
                            {checks.map(c => (
                                <div key={c.label} className="flex items-center gap-2">
                                    {c.ok
                                        ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                        : <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                                    }
                                    <span className={`text-[11px] ${c.ok ? 'text-foreground' : 'text-warning font-semibold'}`}>{c.label}</span>
                                </div>
                            ))}

                            {/* GL preview */}
                            <button
                                onClick={() => setGlExpanded(v => !v)}
                                className="w-full mt-2 pt-2 border-t border-border/60 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="h-3 w-3 text-ai" />
                                    <span className="text-[11px] font-semibold text-ai">GL pre-fill preview · what AP will receive</span>
                                </div>
                                <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${glExpanded ? 'rotate-90' : ''}`} />
                            </button>

                            {glExpanded && (
                                <div className="space-y-1.5 animate-in fade-in duration-200">
                                    {GL_LINES.map(line => (
                                        <div key={line.desc} className="flex items-center justify-between bg-ai/5 border border-ai/10 rounded-lg px-3 py-2">
                                            <div>
                                                <p className="text-[11px] font-medium text-foreground">{line.desc}</p>
                                                <p className="text-[10px] text-ai">{line.gl}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[11px] font-semibold text-foreground">{line.amount}</p>
                                                <p className="text-[10px] text-muted-foreground">{line.confidence}% confidence</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Receipt inline — Wow moment #2 ── */}
            {appState !== 'editing' && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground">Receipts · visible inline</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Carousel nav */}
                            <button
                                onClick={() => setReceiptIdx(i => Math.max(0, i - 1))}
                                disabled={receiptIdx === 0}
                                className="text-[10px] text-muted-foreground disabled:opacity-30 hover:text-foreground"
                            >‹</button>
                            <span className="text-xs text-muted-foreground">{receiptIdx + 1} of 2</span>
                            <button
                                onClick={() => setReceiptIdx(i => Math.min(1, i + 1))}
                                disabled={receiptIdx === 1}
                                className="text-[10px] text-muted-foreground disabled:opacity-30 hover:text-foreground"
                            >›</button>
                        </div>
                    </div>

                    <div className="mx-4 mb-2 rounded-xl overflow-hidden border border-border/50 shadow-sm">
                        <ReceiptImage variant={receiptIdx === 0 ? 'fuel' : 'parking'} />
                    </div>

                    <p className="px-4 pb-3 text-[10px] text-muted-foreground italic">
                        Before Strata: managers approved without seeing receipts — GlobalSearch showed none
                    </p>
                </div>
            )}

            {/* ── Actions ── */}
            {(appState === 'pending') && (
                <div className="space-y-2">
                    {/* Approve */}
                    {(mode === 'approve') && (
                        <button
                            onClick={handleApprove}
                            className="w-full flex items-center justify-center gap-2 bg-success/10 text-success border border-success/20 font-bold text-sm py-3 rounded-xl hover:bg-success/15 transition-colors"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve expense
                        </button>
                    )}

                    {/* Plan B — policy exception */}
                    {mode === 'planb' && !showOverride && (
                        <div className="space-y-2">
                            <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Policy exception required</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">$142.50 exceeds the $125.00 per-diem cap for Field Staff · Fuel + Parking. You can override with a reason or reject.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowOverride(true)}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-warning/10 text-warning border border-warning/30 text-xs font-bold py-2.5 rounded-xl hover:bg-warning/20 transition-colors"
                                >
                                    Override with reason
                                </button>
                                <button
                                    onClick={() => setShowReject(true)}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-muted text-muted-foreground text-xs font-medium py-2.5 rounded-xl hover:text-foreground transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Plan B override form */}
                    {mode === 'planb' && showOverride && (
                        <div className="bg-card border border-warning/30 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-warning" />
                                <p className="text-sm font-semibold text-foreground">Override reason required</p>
                            </div>
                            <textarea
                                value={overrideNote}
                                onChange={e => setOverrideNote(e.target.value)}
                                placeholder="e.g. Client entertainment · pre-approved by CFO · exceptional week"
                                rows={2}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-warning/40"
                            />
                            <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                                <ShieldCheck className="h-3 w-3 shrink-0 mt-0.5" />
                                This exception will be logged in the audit trail and flagged on the CFO dashboard
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowOverride(false)}
                                    className="px-3 text-xs py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleOverrideConfirm}
                                    disabled={!overrideNote.trim()}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-warning/80 text-white text-xs font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Approve with override
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Reject form (both reject mode and plan B reject path) */}
                    {(mode === 'reject' || (mode === 'planb' && showReject)) && !showOverride && (
                        <div className="space-y-2">
                            {!showReject && (
                                <button
                                    onClick={() => setShowReject(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 font-bold text-sm py-3 rounded-xl hover:bg-destructive/15 transition-colors"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reject with note
                                </button>
                            )}
                            {showReject && (
                                <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                        <p className="text-sm font-semibold text-foreground">Rejection note required</p>
                                    </div>
                                    <textarea
                                        value={rejectNote}
                                        onChange={e => setRejectNote(e.target.value)}
                                        placeholder="Receipt is unclear · please reattach with full amount visible"
                                        rows={2}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowReject(false)} className="flex-1 text-xs text-muted-foreground py-2 rounded-lg hover:text-foreground">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRejectConfirm}
                                            disabled={!rejectNote.trim()}
                                            className="flex-1 flex items-center justify-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Confirm rejection
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Sending state ── */}
            {appState === 'sending' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="bg-card border border-border rounded-xl px-4 py-5 flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Send className="h-5 w-5 text-primary animate-pulse" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-bold text-foreground">Approving expense...</p>
                            <p className="text-xs text-muted-foreground">Routing to AP · Pre-filling GL codes · Notifying John Smith</p>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '70%' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Approved state ── */}
            {(appState === 'approved' || appState === 'overridden') && (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className={`border rounded-xl px-4 py-4 ${appState === 'overridden' ? 'bg-warning/10 border-warning/30' : 'bg-success/10 border-success/20'}`}>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className={`h-4 w-4 ${appState === 'overridden' ? 'text-warning' : 'text-success'}`} />
                            <p className={`text-sm font-bold ${appState === 'overridden' ? 'text-warning' : 'text-success'}`}>
                                {appState === 'overridden' ? 'Approved with policy exception' : 'Approved · Routed to AP automatically'}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {appState === 'overridden'
                                ? 'Override logged in audit trail · flagged on CFO dashboard · Letza notified'
                                : 'Letza notified · John Smith will receive a status update · GL 6200 + 6210 pre-filled'
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* ── Rejected state ── */}
            {appState === 'rejected' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-destructive" />
                            <p className="text-sm font-bold text-destructive">Returned to John Smith</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Rejection note attached · John notified immediately</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl px-4 py-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-semibold text-foreground">John Smith received the rejection note ✓</p>
                        </div>
                        <p className="text-xs text-muted-foreground italic">"{rejectNote || overrideNote}"</p>
                        <p className="text-xs text-muted-foreground pt-1">
                            John can correct and resubmit directly from the app — full audit trail maintained · no calls to AP needed
                        </p>
                    </div>
                    <button onClick={reset} className="w-full text-xs text-muted-foreground py-2 hover:text-foreground transition-colors">
                        ↺ Reset scenario
                    </button>
                </div>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
        </div>
    )
}
