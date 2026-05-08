/**
 * w1.1 — ExpenseSubmitScene
 * Employee mobile view: login → expense list → upload options → OCR form → submit
 * Wow moment #1: watch fields auto-fill from receipt photo
 *
 * Screen flow (all inside MobileDeviceFrame):
 *   login → expenses-list → upload-options → form → sending → submitted
 *   form: inline edit/delete receipt buttons
 *   form: manager shown as read-only (configured by default)
 */

import { useState, useRef, useCallback } from 'react'
import {
    Camera, Plus, CheckCircle2, Clock, Sparkles,
    Bell, ArrowLeft, Send, Check, Image, FileText,
    Pencil, Trash2, Lock, Mail,
} from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import MobileDeviceFrame from '../simulations/MobileDeviceFrame'

type OCRState    = 'idle' | 'scanning' | 'filling' | 'done'
type ScreenState = 'login' | 'expenses-list' | 'upload-options' | 'form' | 'sending' | 'submitted'
type AddState    = 'idle' | 'scanning' | 'done'

const DEFAULT_MANAGER = {
    id: 'sarah',
    name: 'Sarah Johnson',
    dept: 'Operations · Tampa',
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face',
}

const FIELDS = [
    { key: 'vendor',   label: 'Vendor',   value: 'The Capital Grille' },
    { key: 'date',     label: 'Date',     value: 'May 5, 2026' },
    { key: 'amount',   label: 'Amount',   value: '$142.50' },
    { key: 'category', label: 'Category', value: 'Fuel + Parking' },
]

const RECEIPT_LABELS = ['Fuel Receipt · $95.00', 'Parking Ticket · $47.50', 'Toll Receipt · $12.00']

const PAST_EXPENSES = [
    { label: 'Office Supplies',    amount: '$23.40',  date: 'Apr 15', status: 'paid'    },
    { label: 'Parking',            amount: '$47.50',  date: 'Apr 28', status: 'paid'    },
    { label: 'Travel — Orlando',   amount: '$210.00', date: 'May 1',  status: 'pending' },
]

export default function ExpenseSubmitScene({ onSubmit, initialScreen }: { onSubmit?: () => void; initialScreen?: ScreenState }) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [screen, setScreen]             = useState<ScreenState>(initialScreen ?? 'login')
    const [signingIn, setSigningIn]       = useState(false)
    const [ocrState, setOcrState]         = useState<OCRState>('idle')
    const [filledFields, setFilledFields] = useState<string[]>([])
    const [receipts, setReceipts]         = useState<number[]>([])
    const [addState, setAddState]         = useState<AddState>('idle')
    const [carouselIdx, setCarouselIdx]   = useState(0)
    const [viewingReceipt, setViewingReceipt] = useState<number | null>(null)

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
        }
        setTimeout(tick, 0)
    }, [])

    // Login → expense list
    const handleSignIn = useCallback(() => {
        setSigningIn(true)
        pauseAware(() => {
            setSigningIn(false)
            setScreen('expenses-list')
        }, 700)
    }, [pauseAware])

    // Upload option → OCR
    const handleUploadOption = useCallback(() => {
        setScreen('form')
        pauseAware(() => {
            setOcrState('scanning')
            pauseAware(() => {
                setOcrState('filling')
                setReceipts([0])
                let idx = 0
                const fillNext = () => {
                    if (idx >= FIELDS.length) { setOcrState('done'); return }
                    setFilledFields(prev => [...prev, FIELDS[idx++].key])
                    pauseAware(fillNext, 240)
                }
                fillNext()
            }, 800)
        }, 200)
    }, [pauseAware])

    // Edit receipt → back to upload options
    const handleEditReceipt = useCallback(() => {
        setReceipts([])
        setOcrState('idle')
        setFilledFields([])
        setCarouselIdx(0)
        setScreen('upload-options')
    }, [])

    // Delete receipt → clear, stay in form
    const handleDeleteReceipt = useCallback(() => {
        setReceipts([])
        setOcrState('idle')
        setFilledFields([])
        setCarouselIdx(0)
    }, [])

    const handleAddAnother = useCallback(() => {
        if (addState !== 'idle') return
        setAddState('scanning')
        pauseAware(() => {
            setReceipts(prev => {
                const next = [...prev, prev.length]
                setCarouselIdx(next.length - 1)
                return next
            })
            setAddState('done')
            pauseAware(() => setAddState('idle'), 400)
        }, 900)
    }, [addState, pauseAware])

    // Send → submitted
    const handleSend = useCallback(() => {
        setScreen('sending')
        pauseAware(() => {
            setScreen('submitted')
            pauseAware(() => { onSubmit?.() }, 1800)
        }, 900)
    }, [pauseAware, onSubmit])

    // ── Login screen ──────────────────────────────────────────────────────────
    if (screen === 'login') {
        return (
            <MobileDeviceFrame>
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-6 py-8 space-y-6 animate-in fade-in duration-300">
                    {/* Logo + brand */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
                            <span className="text-primary-foreground text-2xl font-black leading-none">S</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Workscapes, Inc.</p>
                        <p className="text-lg font-bold text-foreground">Strata Expenses</p>
                    </div>

                    {/* Fields */}
                    <div className="w-full space-y-3">
                        <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-semibold">Email</p>
                                <p className="text-sm text-foreground font-medium">john.smith@workscapes.com</p>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
                            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wide font-semibold">Password</p>
                                <p className="text-sm text-foreground font-medium tracking-widest">••••••••</p>
                            </div>
                        </div>
                    </div>

                    {/* Sign In CTA */}
                    <button
                        onClick={handleSignIn}
                        disabled={signingIn}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold bg-primary text-primary-foreground shadow-sm transition-all disabled:opacity-70"
                    >
                        {signingIn ? (
                            <>
                                <Sparkles className="h-4 w-4 animate-pulse" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign In
                                <Check className="h-4 w-4" />
                            </>
                        )}
                    </button>

                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
                </div>
            </MobileDeviceFrame>
        )
    }

    // ── Expense list screen ───────────────────────────────────────────────────
    if (screen === 'expenses-list') {
        return (
            <MobileDeviceFrame>
                <MobileNavbar title="New Expense" />
                <div className="px-4 py-4 space-y-4 animate-in fade-in duration-300">
                    {/* Page title + filters */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground">My Expenses</p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground border border-border rounded-lg px-2 py-0.5">All ▾</span>
                            <span className="text-[11px] text-muted-foreground border border-border rounded-lg px-2 py-0.5">This Month ▾</span>
                        </div>
                    </div>

                    {/* Past expenses */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/60">
                        {PAST_EXPENSES.map((exp) => (
                            <div key={exp.label} className="flex items-center gap-3 px-4 py-3">
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                                    exp.status === 'paid' ? 'bg-success/10' : 'bg-amber-500/10'
                                }`}>
                                    {exp.status === 'paid'
                                        ? <CheckCircle2 className="h-4 w-4 text-success" />
                                        : <Clock className="h-4 w-4 text-amber-500" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate">{exp.label}</p>
                                    <p className="text-[10px] text-muted-foreground">{exp.date}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-bold text-foreground">{exp.amount}</p>
                                    <p className={`text-[9px] font-medium capitalize ${
                                        exp.status === 'paid' ? 'text-success' : 'text-amber-500'
                                    }`}>
                                        {exp.status === 'pending' ? '⚠️ 4 days' : 'Paid'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add new CTA */}
                    <button
                        onClick={() => setScreen('upload-options')}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold bg-primary text-primary-foreground shadow-sm transition-all hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Expense
                    </button>

                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
                </div>
            </MobileDeviceFrame>
        )
    }

    // ── Upload options screen ─────────────────────────────────────────────────
    if (screen === 'upload-options') {
        return (
            <MobileDeviceFrame>
                <MobileNavbar title="New Expense" />
                <div className="px-4 py-4 space-y-4 animate-in fade-in duration-300">
                    <button
                        onClick={() => setScreen('expenses-list')}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back
                    </button>

                    <div>
                        <p className="text-sm font-bold text-foreground">New Expense</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">How would you like to attach your receipt?</p>
                    </div>

                    <div className="space-y-2.5">
                        {[
                            { icon: Camera,   label: 'Take a photo',         sub: 'Use your camera' },
                            { icon: Image,    label: 'Upload from gallery',   sub: 'Choose from photos' },
                            { icon: FileText, label: 'Upload file',           sub: 'PDF, JPG, PNG' },
                        ].map(({ icon: Icon, label, sub }) => (
                            <button
                                key={label}
                                onClick={handleUploadOption}
                                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-all text-left"
                            >
                                <div className="h-10 w-10 rounded-xl bg-ai/10 flex items-center justify-center shrink-0">
                                    <Icon className="h-5 w-5 text-ai" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{label}</p>
                                    <p className="text-[11px] text-muted-foreground">{sub}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
                </div>
            </MobileDeviceFrame>
        )
    }

    // ── Sending screen ────────────────────────────────────────────────────────
    if (screen === 'sending') {
        return (
            <MobileDeviceFrame>
                <MobileNavbar title="New Expense" />
                <div className="px-4 py-16 flex flex-col items-center gap-4 animate-in fade-in duration-300">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Send className="h-7 w-7 text-primary animate-pulse" />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-foreground">Sending to {DEFAULT_MANAGER.name}...</p>
                        <p className="text-[11px] text-muted-foreground">Attaching receipts · routing for approval</p>
                    </div>
                </div>
            </MobileDeviceFrame>
        )
    }

    // ── Submitted screen ──────────────────────────────────────────────────────
    if (screen === 'submitted') {
        return (
            <MobileDeviceFrame>
                <MobileNavbar title="New Expense" />
                <div className="px-4 py-4 space-y-4 animate-in fade-in duration-400">
                    <div className="bg-success/10 border border-success/20 rounded-2xl px-4 py-4 flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">Expense submitted</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Sent to <span className="font-semibold text-foreground">{DEFAULT_MANAGER.name}</span> for approval
                            </p>
                            <p className="text-[11px] text-muted-foreground">John Smith · $142.50 · {receipts.length} receipt{receipts.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 border border-border">
                            <img src={DEFAULT_MANAGER.photo} alt={DEFAULT_MANAGER.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-foreground">{DEFAULT_MANAGER.name}</p>
                            <p className="text-[10px] text-muted-foreground">{DEFAULT_MANAGER.dept}</p>
                        </div>
                        <span className="text-[10px] bg-ai/10 text-ai border border-ai/20 px-2 py-0.5 rounded-full font-medium">Notified ✓</span>
                    </div>

                    <div className="bg-card border border-border rounded-2xl px-4 py-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-3">Status</p>
                        {[
                            { label: 'Submitted', done: true,  time: '10:32 AM' },
                            { label: 'In Review', done: false, time: '' },
                            { label: 'Approved',  done: false, time: '' },
                            { label: 'Paid',      done: false, time: '' },
                        ].map((s, i, arr) => (
                            <div key={s.label} className="flex gap-3 items-start">
                                <div className="flex flex-col items-center pt-0.5">
                                    {s.done
                                        ? <div className="h-4 w-4 rounded-full bg-success flex items-center justify-center shrink-0"><Check className="h-2.5 w-2.5 text-white" /></div>
                                        : <div className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                                    }
                                    {i < arr.length - 1 && <div className={`w-px flex-1 mt-0.5 mb-0.5 h-6 ${s.done ? 'bg-success/40' : 'bg-border'}`} />}
                                </div>
                                <div className="pb-3 flex items-center justify-between flex-1">
                                    <p className={`text-xs ${s.done ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{s.label}</p>
                                    {s.time && <span className="text-[10px] text-muted-foreground">{s.time}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 px-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-[11px] text-muted-foreground">Avg approval: <span className="font-semibold text-foreground">1.2 days</span></p>
                    </div>

                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
                </div>
            </MobileDeviceFrame>
        )
    }

    // ── Main form screen ──────────────────────────────────────────────────────
    const receiptModal = viewingReceipt !== null ? (
        <div
            className="flex flex-col h-full bg-black/80 animate-in fade-in duration-200"
            onClick={() => setViewingReceipt(null)}
        >
            <div className="flex items-center justify-between px-4 pt-14 pb-3">
                <p className="text-xs font-semibold text-white">
                    {RECEIPT_LABELS[viewingReceipt] ?? `Receipt ${viewingReceipt + 1}`}
                </p>
                <button
                    onClick={() => setViewingReceipt(null)}
                    className="text-white/80 hover:text-white text-xs font-medium px-3 py-1 rounded-lg bg-white/10"
                >
                    Close
                </button>
            </div>
            <div
                className="flex-1 flex items-center justify-center px-6 pb-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="w-full max-w-[240px] rounded-2xl overflow-hidden shadow-2xl">
                    <ReceiptImage
                        variant={(['fuel', 'parking', 'toll'] as const)[viewingReceipt] ?? 'fuel'}
                        compact={false}
                    />
                </div>
            </div>
        </div>
    ) : undefined

    return (
        <MobileDeviceFrame overlay={receiptModal}>
            <MobileNavbar title="New Expense" />

            <div className="px-4 py-4 space-y-4">
                {/* Back button */}
                <button
                    onClick={() => {
                        setScreen('upload-options')
                        setReceipts([])
                        setOcrState('idle')
                        setFilledFields([])
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                </button>

                {/* Receipt area */}
                {receipts.length === 0 ? (
                    /* Scanning state — no receipts yet */
                    <div className={`w-full border-2 border-dashed rounded-2xl ${
                        ocrState === 'scanning' ? 'border-ai/60 bg-ai/5' : 'border-border bg-muted/20'
                    }`}>
                        {ocrState === 'scanning' && (
                            <div className="py-5 flex flex-col items-center gap-3">
                                <div className="relative w-full max-w-[220px] rounded-xl overflow-hidden border border-border">
                                    <ReceiptImage variant="fuel" />
                                    <div className="absolute inset-0 bg-ai/10 flex flex-col items-center justify-center gap-2">
                                        <Sparkles className="h-5 w-5 text-ai animate-pulse" />
                                        <p className="text-xs font-semibold text-ai">Reading receipt...</p>
                                        <div className="absolute inset-x-0 h-0.5 bg-ai/60 animate-bounce" style={{ top: '50%' }} />
                                    </div>
                                </div>
                                <p className="text-[11px] text-muted-foreground">Extracting vendor · date · amount · category</p>
                            </div>
                        )}
                        {ocrState === 'idle' && (
                            <div className="py-6 flex flex-col items-center gap-2">
                                <Camera className="h-6 w-6 text-muted-foreground" />
                                <p className="text-[11px] text-muted-foreground">No receipt attached yet</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Receipts captured — thumbnail + edit/delete */
                    <div className="border border-border rounded-2xl bg-card overflow-hidden">
                        <div className="px-3 py-2.5 border-b border-border/60 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                <span className="text-[11px] font-semibold text-success">
                                    {receipts.length} receipt{receipts.length !== 1 ? 's' : ''} captured
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleEditReceipt}
                                    className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <Pencil className="h-2.5 w-2.5" />
                                    Edit
                                </button>
                                <button
                                    onClick={handleDeleteReceipt}
                                    className="flex items-center gap-0.5 text-[10px] text-destructive hover:text-destructive px-2 py-1 rounded-lg hover:bg-destructive/10 transition-colors"
                                >
                                    <Trash2 className="h-2.5 w-2.5" />
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div className="py-3 flex flex-col items-center">
                            <ReceiptCarousel
                                receipts={receipts}
                                activeIdx={carouselIdx}
                                onSelect={setCarouselIdx}
                                onView={setViewingReceipt}
                                addState={addState}
                            />
                        </div>
                    </div>
                )}

                {/* Add another — triggers mini scan */}
                {receipts.length > 0 && ocrState === 'done' && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddAnother}
                            disabled={addState === 'scanning'}
                            className={`flex items-center gap-1 text-[11px] font-medium transition-all ${
                                addState === 'scanning' ? 'text-muted-foreground' : 'text-ai'
                            }`}
                        >
                            {addState === 'scanning' ? (
                                <><Sparkles className="h-3 w-3 animate-pulse" />Scanning...</>
                            ) : (
                                <><Plus className="h-3 w-3" />Add another receipt</>
                            )}
                        </button>
                    </div>
                )}

                {/* Form fields */}
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

                    {/* Manager — read-only */}
                    <div className="px-4 py-3 border-t border-border/60 bg-muted/20">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Approving Manager</p>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground">{DEFAULT_MANAGER.name}</p>
                                <p className="text-[10px] text-muted-foreground">{DEFAULT_MANAGER.dept} · Configured by admin</p>
                            </div>
                            <span className="text-[9px] font-bold text-ai bg-ai/10 px-1.5 py-0.5 rounded-full border border-ai/20">✦ Default</span>
                        </div>
                    </div>
                </div>

                {/* Send for Approval CTA */}
                <button
                    onClick={ocrState === 'done' ? handleSend : undefined}
                    disabled={ocrState !== 'done'}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                        ocrState === 'done'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                >
                    <Send className="h-4 w-4" />
                    Send for Approval
                </button>

                {ocrState === 'filling' && (
                    <p className="text-center text-[11px] text-muted-foreground">Auto-filling from receipt...</p>
                )}
            </div>

            {/* AS-IS contrast + DataSourcesBar — inside the phone */}
            <div className="px-4 pb-6 pt-2 space-y-3">
                <div className="bg-muted/40 border border-border/60 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                        Before Strata: desktop-only form · receipt upload often failed · employees emailed receipts separately
                    </p>
                </div>
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
            </div>
        </MobileDeviceFrame>
    )
}

// ── Receipt carousel (inside the capture zone) ────────────────────────────────

function ReceiptCarousel({ receipts, activeIdx, onSelect, onView, addState }: {
    receipts: number[]
    activeIdx: number
    onSelect: (i: number) => void
    onView: (i: number) => void
    addState: AddState
}) {
    const variants: Array<'fuel' | 'parking' | 'toll'> = ['fuel', 'parking', 'toll']

    return (
        <div className="w-full flex flex-col items-center gap-2">
            <div className="flex gap-2 items-end justify-center">
                {receipts.map((_, i) => (
                    <button
                        key={i}
                        onClick={e => {
                            e.stopPropagation()
                            if (activeIdx === i) onView(i)
                            else onSelect(i)
                        }}
                        title={activeIdx === i ? 'Tap to view full receipt' : 'Select receipt'}
                        className={`rounded-xl overflow-hidden border-2 transition-all shadow-sm ${
                            activeIdx === i ? 'border-primary scale-105 ring-2 ring-primary/20' : 'border-border/60 opacity-70 hover:opacity-90'
                        }`}
                        style={{ width: activeIdx === i ? 120 : 76 }}
                    >
                        <ReceiptImage variant={variants[i] ?? 'fuel'} compact />
                    </button>
                ))}
                {addState === 'scanning' && (
                    <div className="w-[76px] rounded-xl border-2 border-dashed border-ai/60 bg-ai/5 flex flex-col items-center justify-center py-3 gap-1">
                        <Sparkles className="h-4 w-4 text-ai animate-pulse" />
                        <p className="text-[8px] text-ai font-medium">Scanning</p>
                    </div>
                )}
            </div>

            {receipts.length > 1 && (
                <div className="flex gap-1.5 items-center">
                    {receipts.map((_, i) => (
                        <button
                            key={i}
                            onClick={e => { e.stopPropagation(); onSelect(i) }}
                            className={`rounded-full transition-all ${
                                activeIdx === i ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-border'
                            }`}
                        />
                    ))}
                </div>
            )}

            <p className="text-[10px] text-muted-foreground">
                {RECEIPT_LABELS[activeIdx] ?? `Receipt ${activeIdx + 1}`}
            </p>
            <p className="text-[9px] text-ai/70 font-medium">Tap to view full receipt</p>
        </div>
    )
}

// ── Shared mobile navbar ──────────────────────────────────────────────────────

export function MobileNavbar({ title }: { title: string }) {
    return (
        <div className="flex items-center justify-between px-3 pt-8 pb-2.5 border-b border-border/60 bg-card/40">
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center shrink-0">
                    <span className="text-primary-foreground text-[10px] font-black leading-none">S</span>
                </div>
                <div className="pl-1.5 border-l border-border">
                    <p className="text-[9px] text-muted-foreground font-medium leading-none uppercase tracking-wide">Workscapes, Inc.</p>
                    <p className="text-[11px] font-bold text-foreground leading-tight">{title}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="flex items-center gap-1.5">
                    <div className="text-right">
                        <p className="text-[10px] font-semibold text-foreground leading-none">John Smith</p>
                        <p className="text-[9px] text-muted-foreground leading-none">Field Staff</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-muted overflow-hidden shrink-0">
                        <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                            alt="John Smith"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Receipt image (realistic paper receipt look) ──────────────────────────────

export function ReceiptImage({ compact, variant = 'fuel' }: {
    compact?: boolean
    variant?: 'fuel' | 'parking' | 'toll'
}) {
    // Shared helpers — only rendered in full (non-compact) mode
    const Divider = ({ thick, light }: { thick?: boolean; light?: boolean }) => (
        <div className={`border-t ${thick ? 'border-t-[1.5px] border-gray-800' : light ? 'border-dashed border-gray-200' : 'border-dashed border-gray-300'} my-3`} />
    )
    const Row = ({ label, value, bold, small }: { label: string; value: string; bold?: boolean; small?: boolean }) => (
        <div className={`flex justify-between ${small ? 'text-[10px]' : 'text-[11px]'} ${bold ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
            <span>{label}</span><span>{value}</span>
        </div>
    )
    // Thermal barcode — alternating bar widths
    const Barcode = () => (
        <div className="flex flex-col items-center gap-1 py-2">
            <div className="flex items-end gap-px">
                {[2,1,3,1,2,1,1,3,2,1,1,2,3,1,2,1,3,1,2,1,1,3,2,1,1,2,1,3,2,1,2,1,1,2,3,1].map((w, i) => (
                    <div key={i} className="bg-gray-900" style={{ width: w, height: i % 5 === 0 || i % 7 === 0 ? 36 : 28 }} />
                ))}
            </div>
            <p className="text-[8px] text-gray-400 font-mono tracking-[0.12em] mt-0.5">0295 2847 0505 4892</p>
        </div>
    )
    // Perforated top/bottom edge using radial gradient holes
    const PerforatedEdge = ({ pos }: { pos: 'top' | 'bottom' }) => (
        <div className="h-4" style={{
            backgroundImage: `radial-gradient(circle at 50% ${pos === 'top' ? '0%' : '100%'}, white 5px, #faf5e4 5.5px)`,
            backgroundSize: '16px 100%',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: pos,
        }} />
    )

    // ── PARKING ────────────────────────────────────────────────────────────────
    if (variant === 'parking') {
        if (compact) return (
            <div className="bg-[#faf5e4] font-mono px-3 py-2 space-y-0.5">
                <p className="text-[8px] font-black tracking-widest text-gray-900 text-center">WATERSIDE GARAGE</p>
                <div className="border-t border-dashed border-gray-400 my-1" />
                <div className="flex justify-between text-[7px] text-gray-800"><span>Parking</span><span className="font-bold">$47.50</span></div>
                <div className="border-t-2 border-gray-800 mt-1" />
                <div className="flex justify-between text-[9px] font-black text-gray-900"><span>TOTAL</span><span>$47.50</span></div>
            </div>
        )
        return (
            <div className="bg-[#faf5e4] font-mono">
                <PerforatedEdge pos="top" />
                <div className="px-6 pb-2">
                    <div className="text-center space-y-0.5 py-3">
                        <p className="text-sm font-black tracking-widest text-gray-900">WATERSIDE GARAGE</p>
                        <p className="text-[11px] text-gray-500">150 S Tampa St · Tampa Convention Center</p>
                        <p className="text-[11px] text-gray-500">Tampa, FL 33602</p>
                        <p className="text-[11px] text-gray-500">(813) 555-0193</p>
                    </div>
                    <Divider />
                    <div className="space-y-1.5">
                        <Row label="Ticket #" value="P-4421" bold />
                        <Row label="Date" value="05/05/2026" />
                        <Row label="Entry time" value="9:12 AM" />
                        <Row label="Exit time" value="12:27 PM" />
                        <Row label="Duration" value="3h 15m" />
                        <Row label="Space #" value="B-214" />
                        <Row label="Business purpose" value="Site visit — Tampa" />
                    </div>
                    <Divider />
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Charges</p>
                    <div className="space-y-1.5">
                        <Row label="Parking (3h 15m × $14.00/hr)" value="$45.50" />
                        <Row label="Processing fee" value="$2.00" />
                    </div>
                    <Divider light />
                    <div className="space-y-1.5">
                        <Row label="Subtotal" value="$47.50" />
                        <Row label="Tax (FL exempt)" value="$0.00" />
                        <Row label="Validation" value="None" />
                    </div>
                    <Divider thick />
                    <div className="flex justify-between text-base font-black text-gray-900 mb-3">
                        <span>TOTAL</span><span>$47.50</span>
                    </div>
                    <Divider />
                    <div className="space-y-1.5">
                        <Row label="Card" value="Visa ···· 4892" />
                        <Row label="Auth #" value="773921" bold />
                        <Row label="Terminal" value="G-04" />
                        <Row label="Merchant ID" value="MCH-19342" small />
                    </div>
                    <p className="text-center text-[11px] font-black text-gray-900 tracking-widest mt-3">— APPROVED —</p>
                    <Divider />
                    <Barcode />
                    <Divider light />
                    <div className="text-center space-y-0.5 pb-2">
                        <p className="text-[10px] text-gray-400 tracking-wide">THANK YOU FOR YOUR BUSINESS</p>
                        <p className="text-[10px] text-gray-400">*** CUSTOMER COPY ***</p>
                    </div>
                </div>
                <PerforatedEdge pos="bottom" />
            </div>
        )
    }

    // ── TOLL ───────────────────────────────────────────────────────────────────
    if (variant === 'toll') {
        if (compact) return (
            <div className="bg-[#faf5e4] font-mono px-3 py-2 space-y-0.5">
                <p className="text-[8px] font-black tracking-widest text-gray-900 text-center">SUNPASS TOLL</p>
                <div className="border-t border-dashed border-gray-400 my-1" />
                <div className="flex justify-between text-[7px] text-gray-800"><span>Toll</span><span className="font-bold">$12.00</span></div>
                <div className="border-t-2 border-gray-800 mt-1" />
                <div className="flex justify-between text-[9px] font-black text-gray-900"><span>TOTAL</span><span>$12.00</span></div>
            </div>
        )
        return (
            <div className="bg-[#faf5e4] font-mono">
                <PerforatedEdge pos="top" />
                <div className="px-6 pb-2">
                    <div className="text-center space-y-0.5 py-3">
                        <p className="text-sm font-black tracking-widest text-gray-900">SUNPASS TOLL</p>
                        <p className="text-[11px] text-gray-500">Florida Dept of Transportation</p>
                        <p className="text-[11px] text-gray-500">Suncoast Pkwy · Plaza 3</p>
                    </div>
                    <Divider />
                    <div className="space-y-1.5">
                        <Row label="Trans #" value="887341" bold />
                        <Row label="Date" value="05/05/2026" />
                        <Row label="Time" value="11:03 AM" />
                        <Row label="Vehicle plate" value="FL · ABC-1234" />
                        <Row label="Account" value="SunPass ···· 8821" />
                    </div>
                    <Divider />
                    <Row label="Toll charge" value="$12.00" />
                    <Divider light />
                    <Row label="Subtotal" value="$12.00" />
                    <Row label="Discount" value="$0.00" />
                    <Divider thick />
                    <div className="flex justify-between text-base font-black text-gray-900 my-2">
                        <span>TOTAL</span><span>$12.00</span>
                    </div>
                    <Divider />
                    <p className="text-[10px] text-gray-400 tracking-wide text-center mb-1">AUTO-DEDUCTED FROM SUNPASS ACCOUNT</p>
                    <Barcode />
                    <Divider light />
                    <p className="text-center text-[10px] text-gray-400 pb-2">*** CUSTOMER COPY ***</p>
                </div>
                <PerforatedEdge pos="bottom" />
            </div>
        )
    }

    // ── FUEL / The Capital Grille ──────────────────────────────────────────────
    if (compact) return (
        <div className="bg-[#faf5e4] font-mono px-3 py-2 space-y-0.5">
            <p className="text-[8px] font-black tracking-widest text-gray-900 text-center">THE CAPITAL GRILLE</p>
            <div className="border-t border-dashed border-gray-400 my-1" />
            <div className="flex justify-between text-[7px] text-gray-800"><span>Fuel</span><span className="font-bold">$95.00</span></div>
            <div className="border-t-2 border-gray-800 mt-1" />
            <div className="flex justify-between text-[9px] font-black text-gray-900"><span>TOTAL</span><span>$95.00</span></div>
        </div>
    )
    return (
        <div className="bg-[#faf5e4] font-mono">
            <PerforatedEdge pos="top" />
            <div className="px-6 pb-2">
                <div className="text-center space-y-0.5 py-3">
                    <p className="text-sm font-black tracking-widest text-gray-900">THE CAPITAL GRILLE</p>
                    <p className="text-[11px] text-gray-500">2223 N. West Shore Blvd</p>
                    <p className="text-[11px] text-gray-500">Tampa, FL 33607</p>
                    <p className="text-[11px] text-gray-500">(813) 555-0147</p>
                </div>
                <Divider />
                <div className="space-y-1.5">
                    <Row label="Check #" value="2847" bold />
                    <Row label="Date" value="05/05/2026" />
                    <Row label="Time" value="12:47 PM" />
                    <Row label="Cashier" value="Maria V." />
                    <Row label="Business purpose" value="Field ops — Tampa" />
                </div>
                <Divider />
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Business Expenses</p>
                <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-gray-800">
                        <span>Fuel — Suncoast Pkwy</span><span>$95.00</span>
                    </div>
                    <p className="text-[10px] text-gray-400 pl-2">11.8 gal · Premium · $8.05/gal</p>
                </div>
                <Divider light />
                <div className="space-y-1.5">
                    <Row label="Subtotal" value="$95.00" />
                    <Row label="Tax (FL exempt)" value="$0.00" />
                    <Row label="Tip / Gratuity" value="N/A" />
                </div>
                <Divider thick />
                <div className="flex justify-between text-base font-black text-gray-900 mb-3">
                    <span>TOTAL</span><span>$95.00</span>
                </div>
                <Divider />
                <div className="space-y-1.5">
                    <Row label="Card" value="Visa ···· 4892" />
                    <Row label="Auth #" value="029441" bold />
                    <Row label="Terminal" value="T-17" />
                    <Row label="Merchant ID" value="MCH-48291" small />
                </div>
                <p className="text-center text-[11px] font-black text-gray-900 tracking-widest mt-3">— APPROVED —</p>
                <Divider />
                <Barcode />
                <Divider light />
                <div className="text-center space-y-0.5 pb-2">
                    <p className="text-[10px] text-gray-400 tracking-wide">THANK YOU FOR YOUR BUSINESS</p>
                    <p className="text-[10px] text-gray-400">*** CUSTOMER COPY ***</p>
                </div>
            </div>
            <PerforatedEdge pos="bottom" />
        </div>
    )
}
