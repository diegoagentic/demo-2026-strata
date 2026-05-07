/**
 * w1.1 — ExpenseSubmitScene
 * Employee mobile view: snap receipt → OCR auto-fill → submit → status chain
 * Wow moment #1: watch fields auto-fill from receipt photo
 * Layout: MobileDeviceFrame wraps the full phone experience
 */

import { useState, useRef, useCallback } from 'react'
import { Camera, Plus, CheckCircle2, Clock, Sparkles, ChevronRight, ArrowLeft, Bell } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import MobileDeviceFrame from '../simulations/MobileDeviceFrame'

type OCRState = 'idle' | 'scanning' | 'filling' | 'done'
type SubmitState = 'form' | 'submitted'

const MANAGERS = [
    'Sarah Johnson — Operations · Tampa',
    'Mike Torres — Sales · Orlando',
    'Ana Reyes — Procurement · Miami',
]

const FIELDS = [
    { key: 'vendor',   label: 'Vendor',   value: 'The Capital Grille' },
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
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
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
                pauseAware(fillNext, 240)
            }
            fillNext()
        }, 800)
    }, [ocrState, pauseAware])

    const handleSubmit = useCallback(() => {
        setSubmitState('submitted')
        onSubmit?.()
    }, [onSubmit])

    const canSubmit = ocrState === 'done' && manager !== ''

    return (
        <div className="flex flex-col items-center gap-4">
            <MobileDeviceFrame>
                {/* Mobile app nav */}
                <div className="flex items-center justify-between px-4 pt-8 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-[9px] text-muted-foreground font-medium leading-none">WORKSCAPES</p>
                            <p className="text-xs font-bold text-foreground leading-tight">New Expense</p>
                        </div>
                    </div>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                </div>

                {submitState === 'submitted' ? (
                    <SubmittedMobileView />
                ) : (
                    <div className="px-4 py-4 space-y-4">
                        {/* Receipt capture zone */}
                        <button
                            onClick={handleCapture}
                            disabled={ocrState !== 'idle'}
                            className={`w-full border-2 border-dashed rounded-2xl transition-all ${
                                ocrState === 'idle'
                                    ? 'border-border active:border-primary cursor-pointer'
                                    : 'border-border bg-muted/20 cursor-default'
                            }`}
                        >
                            {ocrState === 'idle' && (
                                <div className="py-6 flex flex-col items-center gap-3">
                                    <div className="h-14 w-14 rounded-full bg-ai/10 flex items-center justify-center">
                                        <Camera className="h-7 w-7 text-ai" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-foreground">Tap to scan receipt</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Camera · Gallery · File</p>
                                        <p className="text-[10px] text-muted-foreground">JPG PNG PDF · multiple receipts OK</p>
                                    </div>
                                </div>
                            )}

                            {ocrState === 'scanning' && (
                                <div className="py-5 flex flex-col items-center gap-3">
                                    {/* Receipt preview with scanning overlay */}
                                    <div className="relative w-full max-w-[220px] rounded-xl overflow-hidden border border-border">
                                        <ReceiptImage />
                                        <div className="absolute inset-0 bg-ai/10 flex flex-col items-center justify-center gap-2">
                                            <Sparkles className="h-5 w-5 text-ai animate-pulse" />
                                            <p className="text-xs font-semibold text-ai">Reading receipt...</p>
                                            {/* Scan line animation */}
                                            <div className="absolute inset-x-0 h-0.5 bg-ai/60 animate-bounce" style={{ top: '50%' }} />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">Extracting vendor · date · amount · category</p>
                                </div>
                            )}

                            {(ocrState === 'filling' || ocrState === 'done') && (
                                <div className="py-3 flex flex-col items-center gap-2">
                                    {/* Small receipt thumbnail */}
                                    <div className="w-full max-w-[180px] rounded-xl overflow-hidden border border-border opacity-80">
                                        <ReceiptImage compact />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                        <span className="text-[11px] font-semibold text-success">Receipt captured</span>
                                    </div>
                                </div>
                            )}
                        </button>

                        {/* Multi-receipt */}
                        {receiptCount > 0 && (
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[11px] text-muted-foreground">{receiptCount} receipt{receiptCount > 1 ? 's' : ''} attached</span>
                                <button
                                    onClick={() => setReceiptCount(c => c + 1)}
                                    className="flex items-center gap-1 text-[11px] text-ai font-medium"
                                >
                                    <Plus className="h-3 w-3" />
                                    Add another
                                </button>
                            </div>
                        )}

                        {/* Form card */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            {FIELDS.map((f, i) => {
                                const filled = filledFields.includes(f.key)
                                return (
                                    <div key={f.key} className={`px-4 py-3 ${i < FIELDS.length - 1 ? 'border-b border-border/60' : ''}`}>
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{f.label}</p>
                                        {filled ? (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-foreground animate-in fade-in duration-300">{f.value}</span>
                                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-ai bg-ai/10 px-1.5 py-0.5 rounded-full">
                                                    <Sparkles className="h-2 w-2" /> AI
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="h-4 bg-muted/60 rounded-md w-3/4" />
                                        )}
                                    </div>
                                )
                            })}

                            {/* Manager */}
                            <div className="px-4 py-3 border-t border-border/60">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Approving Manager</p>
                                <select
                                    value={manager}
                                    onChange={e => setManager(e.target.value)}
                                    disabled={ocrState === 'idle' || ocrState === 'scanning'}
                                    className="w-full text-sm bg-transparent text-foreground border-0 outline-none disabled:text-muted-foreground/50 appearance-none"
                                >
                                    <option value="">Select manager...</option>
                                    {MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                {ocrState === 'done' && (
                                    <p className="text-[9px] text-muted-foreground mt-1 animate-in fade-in duration-300">
                                        Always current — self-service admin
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit CTA */}
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                                canSubmit
                                    ? 'bg-primary text-primary-foreground shadow-sm active:opacity-90'
                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                        >
                            Submit Expense
                            <ChevronRight className="h-4 w-4" />
                        </button>

                        {!canSubmit && ocrState === 'done' && (
                            <p className="text-center text-[11px] text-muted-foreground">Select a manager to continue</p>
                        )}
                    </div>
                )}
            </MobileDeviceFrame>

            {/* Desktop note under phone */}
            <p className="text-xs text-center text-muted-foreground max-w-xs">
                Before Strata: desktop-only form · receipt upload often failed · employees emailed receipts separately
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
        </div>
    )
}

// ── Realistic receipt image component ────────────────────────────────────────

function ReceiptImage({ compact }: { compact?: boolean }) {
    return (
        <div className={`bg-white font-mono ${compact ? 'px-3 py-2' : 'px-4 py-3'} space-y-0.5`}>
            {/* Header */}
            <div className="text-center space-y-0">
                <p className={`font-black tracking-tight text-gray-900 ${compact ? 'text-[9px]' : 'text-[11px]'}`}>THE CAPITAL GRILLE</p>
                {!compact && (
                    <>
                        <p className="text-[8px] text-gray-500">2223 N. West Shore Blvd</p>
                        <p className="text-[8px] text-gray-500">Tampa, FL 33607</p>
                        <p className="text-[8px] text-gray-500">Tel: (813) 830-9433</p>
                    </>
                )}
            </div>

            <div className={`border-t border-dashed border-gray-300 ${compact ? 'my-1' : 'my-2'}`} />

            {!compact && (
                <div className="space-y-0.5">
                    <div className="flex justify-between text-[8px] text-gray-500">
                        <span>Check #</span><span>2847</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-gray-500">
                        <span>Date</span><span>05/05/2026</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-gray-500">
                        <span>Server</span><span>Maria V.</span>
                    </div>
                </div>
            )}

            {!compact && <div className="border-t border-dashed border-gray-300 my-1.5" />}

            {/* Line items */}
            <div className="space-y-0.5">
                {compact ? (
                    <>
                        <div className="flex justify-between text-[8px] text-gray-700">
                            <span>Fuel</span><span>$95.00</span>
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-700">
                            <span>Parking</span><span>$47.50</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-between text-[8px] text-gray-700">
                            <span className="flex-1">Fuel — Suncoast Pkwy</span>
                            <span className="ml-2">$95.00</span>
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-700">
                            <span className="flex-1">Parking — Waterside Garage</span>
                            <span className="ml-2">$47.50</span>
                        </div>
                        <div className="border-t border-dashed border-gray-300 my-1" />
                        <div className="flex justify-between text-[8px] text-gray-500">
                            <span>Subtotal</span><span>$142.50</span>
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-500">
                            <span>Tax</span><span>$0.00</span>
                        </div>
                    </>
                )}
            </div>

            <div className={`border-t border-gray-900 ${compact ? 'mt-1' : 'mt-1.5'}`} />
            <div className="flex justify-between font-black text-gray-900">
                <span className={compact ? 'text-[8px]' : 'text-[10px]'}>TOTAL</span>
                <span className={compact ? 'text-[8px]' : 'text-[10px]'}>$142.50</span>
            </div>

            {!compact && (
                <>
                    <div className="border-t border-dashed border-gray-300 mt-1.5" />
                    <div className="space-y-0.5">
                        <div className="flex justify-between text-[8px] text-gray-500">
                            <span>Card type</span><span>VISA ···· 4892</span>
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-500">
                            <span>Auth #</span><span>029441</span>
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-500">
                            <span>Time</span><span>12:47 PM</span>
                        </div>
                    </div>
                    <div className="border-t border-dashed border-gray-300 mt-1.5 mb-1" />
                    <p className="text-center text-[7px] text-gray-400">Thank you for your business!</p>
                    <p className="text-center text-[7px] text-gray-400">**** CUSTOMER COPY ****</p>
                </>
            )}
        </div>
    )
}

// ── Post-submit mobile view ───────────────────────────────────────────────────

function SubmittedMobileView() {
    const STATUS = [
        { label: 'Submitted',        done: true,  time: '10:32 AM' },
        { label: 'In Review',        done: false, time: '' },
        { label: 'Approved',         done: false, time: '' },
        { label: 'Paid',             done: false, time: '' },
    ]

    return (
        <div className="px-4 py-4 space-y-4 animate-in fade-in duration-400">
            {/* Success banner */}
            <div className="bg-success/10 border border-success/20 rounded-2xl px-4 py-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                    <p className="text-sm font-bold text-foreground">Expense submitted</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">John Smith · $142.50 · May 5, 2026</p>
                    <p className="text-[11px] text-muted-foreground">Fuel + Parking · 1 receipt</p>
                </div>
            </div>

            {/* Status chain */}
            <div className="bg-card border border-border rounded-2xl px-4 py-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-3">Status</p>
                <div className="space-y-0">
                    {STATUS.map((s, i) => (
                        <div key={s.label} className="flex gap-3 items-start">
                            <div className="flex flex-col items-center pt-0.5">
                                {s.done
                                    ? <div className="h-4 w-4 rounded-full bg-success flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-3 w-3 text-white" />
                                      </div>
                                    : <div className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                                }
                                {i < STATUS.length - 1 && (
                                    <div className={`w-px flex-1 mt-0.5 mb-0.5 h-6 ${s.done ? 'bg-success/40' : 'bg-border'}`} />
                                )}
                            </div>
                            <div className="pb-3 flex items-center justify-between flex-1">
                                <p className={`text-xs ${s.done ? 'font-semibold text-foreground' : 'text-muted-foreground/50'}`}>{s.label}</p>
                                {s.time && <span className="text-[10px] text-muted-foreground">{s.time}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ETA */}
            <div className="flex items-center gap-2 px-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground">
                    Sarah Johnson will be notified · <span className="font-semibold text-foreground">avg approval 1.2 days</span>
                </p>
            </div>
        </div>
    )
}
