/**
 * w1.1 — ExpenseSubmitScene
 * Employee: snap receipt → OCR auto-fill → submit → status chain
 * Wow moment #1: watch fields auto-fill from receipt photo
 */

import { useState, useRef, useCallback } from 'react'
import { Camera, Plus, CheckCircle2, Clock, Sparkles, ChevronRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type OCRState = 'idle' | 'scanning' | 'filling' | 'done'
type SubmitState = 'form' | 'submitted'

const MANAGERS = [
    'Sarah Johnson — Operations · Tampa',
    'Mike Torres — Sales · Orlando',
    'Ana Reyes — Procurement · Miami',
]

const FIELDS = [
    { key: 'vendor',   label: 'Vendor',   value: 'The Capital Grille — Tampa, FL' },
    { key: 'date',     label: 'Date',     value: 'May 5, 2026' },
    { key: 'amount',   label: 'Amount',   value: '$142.50' },
    { key: 'category', label: 'Category', value: 'Fuel + Parking' },
]

export default function ExpenseSubmitScene({ onSubmit }: { onSubmit?: () => void }) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [ocrState, setOcrState] = useState<OCRState>('idle')
    const [filledFields, setFilledFields] = useState<string[]>([])
    const [receiptCount, setReceiptCount] = useState(0)
    const [manager, setManager] = useState('')
    const [submitState, setSubmitState] = useState<SubmitState>('form')

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            const elapsed = Date.now() - start
            if (elapsed >= delay) fn()
            else setTimeout(tick, Math.min(100, delay - elapsed))
        }
        setTimeout(tick, 0)
    }, [])

    const handleCapture = useCallback(() => {
        if (ocrState !== 'idle') return
        setOcrState('scanning')
        setReceiptCount(1)

        pauseAware(() => {
            setOcrState('filling')
            let idx = 0
            const fillNext = () => {
                if (idx >= FIELDS.length) { setOcrState('done'); return }
                const field = FIELDS[idx++]
                setFilledFields(prev => [...prev, field.key])
                pauseAware(fillNext, 220)
            }
            fillNext()
        }, 700)
    }, [ocrState, pauseAware])

    const handleSubmit = useCallback(() => {
        setSubmitState('submitted')
        onSubmit?.()
    }, [onSubmit])

    const canSubmit = ocrState === 'done' && manager !== ''

    if (submitState === 'submitted') {
        return (
            <>
                <SubmittedState />
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
            </>
        )
    }

    return (
        <div className="max-w-lg mx-auto space-y-4">
            {/* Upload / Capture zone */}
            <button
                onClick={handleCapture}
                disabled={ocrState !== 'idle'}
                className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-all ${
                    ocrState === 'idle'
                        ? 'border-border hover:border-primary hover:bg-primary/5 cursor-pointer'
                        : 'border-border bg-muted/40 cursor-default'
                }`}
            >
                {ocrState === 'idle' && (
                    <>
                        <div className="h-12 w-12 rounded-full bg-ai/10 flex items-center justify-center">
                            <Camera className="h-6 w-6 text-ai" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">Snap receipt · AI will auto-fill</p>
                            <p className="text-xs text-muted-foreground mt-1">Camera · Gallery · File · JPG PNG PDF · multiple receipts supported</p>
                        </div>
                    </>
                )}

                {ocrState === 'scanning' && (
                    <div className="flex flex-col items-center gap-2 py-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-ai animate-pulse" />
                            <span className="text-sm font-medium text-ai">Scanning receipt...</span>
                        </div>
                        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-ai rounded-full animate-[scan_0.7s_ease-out_forwards]" style={{ width: '0%', animation: 'none', transition: 'width 0.65s ease-out', ...(ocrState === 'scanning' ? { width: '90%' } : {}) }} />
                        </div>
                        <p className="text-xs text-muted-foreground">Extracting vendor, date, amount, category</p>
                    </div>
                )}

                {(ocrState === 'filling' || ocrState === 'done') && (
                    <div className="flex items-center gap-2 py-1">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-foreground">Receipt scanned</span>
                    </div>
                )}
            </button>

            {/* Receipt count + add another */}
            {receiptCount > 0 && (
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        <span className="text-xs text-muted-foreground">{receiptCount} receipt attached</span>
                    </div>
                    <button
                        onClick={() => setReceiptCount(c => c + 1)}
                        className="flex items-center gap-1 text-xs text-ai hover:text-ai/80 transition-colors"
                    >
                        <Plus className="h-3 w-3" />
                        Add another receipt
                    </button>
                </div>
            )}

            {/* Form fields */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {FIELDS.map((f, i) => {
                    const filled = filledFields.includes(f.key)
                    return (
                        <div key={f.key} className={`flex items-center justify-between px-4 py-3 ${i < FIELDS.length - 1 ? 'border-b border-border' : ''}`}>
                            <span className="text-xs text-muted-foreground w-20 shrink-0">{f.label}</span>
                            {filled ? (
                                <div className="flex items-center gap-2 flex-1 justify-end">
                                    <span className="text-sm font-medium text-foreground text-right animate-in fade-in duration-300">{f.value}</span>
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-ai bg-ai/10 px-1.5 py-0.5 rounded-full shrink-0">
                                        <Sparkles className="h-2.5 w-2.5" /> AI
                                    </span>
                                </div>
                            ) : (
                                <div className="h-4 bg-muted rounded w-32" />
                            )}
                        </div>
                    )
                })}

                {/* Manager dropdown */}
                <div className="px-4 py-3 border-t border-border">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-20 shrink-0">Manager</span>
                        <select
                            value={manager}
                            onChange={e => setManager(e.target.value)}
                            disabled={ocrState === 'idle' || ocrState === 'scanning'}
                            className="flex-1 text-sm bg-transparent text-foreground border-0 outline-none disabled:text-muted-foreground cursor-pointer"
                        >
                            <option value="">Select manager...</option>
                            {MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    {ocrState === 'done' && (
                        <p className="text-[10px] text-muted-foreground mt-1 ml-[92px] animate-in fade-in duration-300">
                            Always current — managed by Letza, no IT ticket needed
                        </p>
                    )}
                </div>
            </div>

            {/* Submit CTA */}
            <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    canSubmit
                        ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
            >
                Submit Expense
                <ChevronRight className="h-4 w-4" />
            </button>

            {!canSubmit && ocrState !== 'idle' && (
                <p className="text-center text-xs text-muted-foreground">
                    {ocrState === 'scanning' || ocrState === 'filling' ? 'Scanning receipt...' : 'Select a manager to continue'}
                </p>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
        </div>
    )
}

function SubmittedState() {
    const STATUS = [
        { label: 'Submitted',  done: true,  time: 'May 5, 10:32 AM' },
        { label: 'In Review',  done: false, time: 'Pending' },
        { label: 'Approved',   done: false, time: '' },
        { label: 'Paid',       done: false, time: '' },
    ]

    return (
        <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-400">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">Submitted successfully</p>
                        <p className="text-xs text-muted-foreground">John Smith · $142.50 · May 5, 2026</p>
                    </div>
                </div>

                {/* Status chain */}
                <div className="flex items-center gap-1">
                    {STATUS.map((s, i) => (
                        <div key={s.label} className="flex items-center gap-1 flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div className={`h-2 w-2 rounded-full ${s.done ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                                <span className={`text-[10px] mt-1 text-center ${s.done ? 'text-success font-medium' : 'text-muted-foreground'}`}>{s.label}</span>
                                {s.time && <span className="text-[9px] text-muted-foreground">{s.time}</span>}
                            </div>
                            {i < STATUS.length - 1 && <div className="h-px w-full bg-border mb-5" />}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                        You'll be notified when Sarah Johnson reviews · <span className="text-foreground font-medium">Average approval: 1.2 days</span>
                    </p>
                </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
                Before Strata: employees filled a desktop form, upload often failed, receipts sent by email
            </p>
        </div>
    )
}
