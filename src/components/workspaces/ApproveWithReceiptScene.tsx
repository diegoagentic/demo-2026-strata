/**
 * w1.3 — ApproveWithReceiptScene
 * Manager: receipt inline (wow #2) → approve or reject with required note → resubmit loop
 * Pain points resolved: PP1 (receipt visible), PP5 (GlobalSearch broken)
 */

import { useState } from 'react'
import { CheckCircle2, XCircle, Receipt, AlertTriangle, ChevronRight, RotateCcw } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type ScenarioMode = 'approve' | 'reject'
type ApproveState = 'pending' | 'approved' | 'rejected'

export default function ApproveWithReceiptScene({ onApprove }: { onApprove?: () => void }) {
    const [mode, setMode] = useState<ScenarioMode>('approve')
    const [state, setState] = useState<ApproveState>('pending')
    const [rejectNote, setRejectNote] = useState('')
    const [showRejectForm, setShowRejectForm] = useState(false)

    const handleApprove = () => {
        setState('approved')
        setTimeout(() => onApprove?.(), 800)
    }

    const handleRejectConfirm = () => {
        if (!rejectNote.trim()) return
        setState('rejected')
    }

    const handleReset = () => {
        setState('pending')
        setShowRejectForm(false)
        setRejectNote('')
    }

    return (
        <div className="max-w-lg mx-auto space-y-4">
            {/* Scenario toggle */}
            <div className="flex gap-1 bg-muted/40 border border-border rounded-xl p-1 w-fit">
                <button
                    onClick={() => { setMode('approve'); handleReset() }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${mode === 'approve' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    ✓ Approve scenario
                </button>
                <button
                    onClick={() => { setMode('reject'); handleReset() }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${mode === 'reject' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    ✗ Reject scenario
                </button>
            </div>

            {/* Expense detail */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">John Smith</p>
                    <p className="text-sm font-bold text-foreground">$142.50</p>
                </div>
                <p className="text-xs text-muted-foreground">Fuel + Parking · May 5, 2026 · The Capital Grille — Tampa, FL</p>
                <p className="text-xs text-muted-foreground">Approved by: Sarah Johnson — Operations · Tampa</p>
            </div>

            {/* RECEIPT INLINE — Wow moment #2 */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">Receipts · visible inline</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2 of 2</span>
                </div>

                {/* Simulated receipt image */}
                <div className="mx-4 mb-3 rounded-lg bg-muted border border-border overflow-hidden">
                    <div className="bg-background px-5 py-4 space-y-1 font-mono text-xs">
                        <p className="font-bold text-sm text-foreground text-center">THE CAPITAL GRILLE</p>
                        <p className="text-muted-foreground text-center text-[10px]">Tampa, FL 33602</p>
                        <div className="border-t border-dashed border-border my-2" />
                        <div className="flex justify-between"><span className="text-muted-foreground">Fuel</span><span className="text-foreground">$95.00</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Parking</span><span className="text-foreground">$47.50</span></div>
                        <div className="border-t border-dashed border-border my-2" />
                        <div className="flex justify-between font-bold"><span className="text-foreground">TOTAL</span><span className="text-foreground">$142.50</span></div>
                        <p className="text-muted-foreground text-center text-[10px] pt-1">May 5, 2026 · 12:47 PM</p>
                    </div>
                </div>

                <div className="px-4 pb-3 flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground italic">
                        Before Strata: managers approved without seeing receipts — GlobalSearch showed none
                    </span>
                </div>
            </div>

            {/* Actions */}
            {state === 'pending' && (
                <div className="space-y-2">
                    {mode === 'approve' && (
                        <button
                            onClick={handleApprove}
                            className="w-full flex items-center justify-center gap-2 bg-success/10 text-success border border-success/20 font-bold text-sm py-3 rounded-xl hover:bg-success/15 transition-colors"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve expense
                        </button>
                    )}

                    {mode === 'reject' && !showRejectForm && (
                        <button
                            onClick={() => setShowRejectForm(true)}
                            className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 font-bold text-sm py-3 rounded-xl hover:bg-destructive/15 transition-colors"
                        >
                            <XCircle className="h-4 w-4" />
                            Reject with note
                        </button>
                    )}

                    {mode === 'reject' && showRejectForm && (
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
                                <button
                                    onClick={() => setShowRejectForm(false)}
                                    className="flex-1 text-xs text-muted-foreground py-2 rounded-lg hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectConfirm}
                                    disabled={!rejectNote.trim()}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Confirm Rejection
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Approved state */}
            {state === 'approved' && (
                <div className="bg-success/10 border border-success/20 rounded-xl px-4 py-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <p className="text-sm font-bold text-success">Approved · Routed to AP automatically</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Letza notified · John Smith will receive a status update</p>
                </div>
            )}

            {/* Rejected state — resubmit loop */}
            {state === 'rejected' && (
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
                        <p className="text-xs text-muted-foreground">
                            "{rejectNote}"
                        </p>
                        <p className="text-xs text-muted-foreground pt-1">
                            John can correct and resubmit directly from the app — audit trail maintained. No calls to AP needed.
                        </p>
                    </div>
                    <button onClick={handleReset} className="w-full text-xs text-muted-foreground py-2 hover:text-foreground transition-colors">
                        ↺ Reset scenario
                    </button>
                </div>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
        </div>
    )
}
