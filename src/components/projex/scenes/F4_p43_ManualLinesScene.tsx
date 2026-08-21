/**
 * COMPONENT: F4_p43_ManualLinesScene (Projex · p4.3)
 * PURPOSE: Coordinator adds 26 S&H manual entries · EditableLineTable with add-row.
 *          Alamir $19 flat rule · Nelson prepaid+add · Teknion consolidated.
 *          Design fee 8% recomputed live.
 *
 *          Fix del user 2026-08-17: Generate 26 PO drafts ahora abre un modal
 *          de confirmación mostrando lo que se va a crear (breakdown por
 *          vendor), después simula el processing con progress steps ·
 *          success state con Continue CTA que avanza a p4.4.
 *
 * SHAPE · EditableLineTable + Generate modal flow (idle → confirm → generating → success)
 * REUSE · mbi/SIFToCOREPreview + FreightTariffPanel patterns
 */

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    Truck, Plus, CheckCircle2, ArrowRight, Edit3, Trash2,
    Percent, DollarSign, Sparkles, Package, Loader2, X, Play, Zap,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { MWH_PIF_LINES } from '../../../config/profiles/projex-data/mwhPif'

// Vendors that will get POs generated (grouped from MWH batch)
const VENDOR_BREAKDOWN = [
    { code: 'TEK', name: 'Teknion',           pos: 8, lines: 84, amount:  98420, method: 'Teknion Online · SIF' },
    { code: 'HBF', name: 'HBF',               pos: 5, lines: 42, amount:  56180, method: 'Vendor portal' },
    { code: 'BDG', name: 'Boss Design',       pos: 4, lines: 38, amount:  42760, method: 'Email PDF' },
    { code: 'ALA', name: 'Alamir',            pos: 3, lines: 22, amount:  18240, method: 'Email PDF · $19 freight' },
    { code: 'NLC', name: 'Nelson and Company', pos: 3, lines: 18, amount:  27340, method: 'Email PDF · prepaid+add' },
    { code: 'WEL', name: 'West Elm',          pos: 3, lines: 16, amount:  21160, method: 'Email PDF' },
]

type GenState = 'idle' | 'confirming' | 'generating' | 'success'

const GENERATE_STEPS = [
    'Validating S&H rules per vendor…',
    'Grouping product + freight lines into vendor buckets…',
    'Applying Coordinator overrides + design fee…',
    'Composing 26 draft POs in NetSuite…',
    'Snapshot saved · ready for per-card review',
]

export default function F4_p43_ManualLinesScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()

    const snhLines = MWH_PIF_LINES.filter(l => l.isSnH)
    const [addedIds, setAddedIds] = useState<Set<number>>(new Set(snhLines.map(l => l.lineNumber)))
    const [customLines, setCustomLines] = useState<{ id: string; description: string; amount: number }[]>([])

    // Generate flow state · idle → confirming (modal) → generating (progress) → success
    const [genState, setGenState] = useState<GenState>('idle')
    const [modalOpen, setModalOpen] = useState(false)
    const [genStepIdx, setGenStepIdx] = useState(0)
    // Per-vendor selection · all checked by default · user can exclude before Confirm
    const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set(VENDOR_BREAKDOWN.map(v => v.code)))

    const handleRemove = (lineNumber: number) => {
        setAddedIds(prev => {
            const next = new Set(prev)
            next.delete(lineNumber)
            return next
        })
    }

    const handleAddCustom = () => {
        const id = `CUS-${Date.now()}`
        setCustomLines(prev => [...prev, { id, description: 'New surcharge line', amount: 0 }])
    }

    const handleOpenGenerate = () => {
        // Reset selection to all-checked when opening (fresh review each time)
        setSelectedCodes(new Set(VENDOR_BREAKDOWN.map(v => v.code)))
        setGenState('confirming')
        setModalOpen(true)
        setGenStepIdx(0)
    }

    const handleConfirmGenerate = () => {
        if (selectedCodes.size === 0) return
        setGenState('generating')
        setGenStepIdx(0)
    }

    const handleToggleVendor = (code: string) => {
        setSelectedCodes(prev => {
            const next = new Set(prev)
            if (next.has(code)) next.delete(code)
            else next.add(code)
            return next
        })
    }

    const handleToggleAll = () => {
        setSelectedCodes(prev => prev.size === VENDOR_BREAKDOWN.length
            ? new Set()
            : new Set(VENDOR_BREAKDOWN.map(v => v.code))
        )
    }

    // Choreograph the generation steps (900ms each)
    useEffect(() => {
        if (genState !== 'generating') return
        if (genStepIdx < GENERATE_STEPS.length - 1) {
            const cancel = pauseAwareTimeout(() => setGenStepIdx(n => n + 1), 900)
            return cancel
        }
        // Last step reached · flip to success after brief pause
        const cancel = pauseAwareTimeout(() => setGenState('success'), 700)
        return cancel
    }, [genState, genStepIdx, pauseAwareTimeout])

    const handleContinue = () => {
        setModalOpen(false)
        nextStep()
    }

    const handleCancelModal = () => {
        if (genState === 'confirming') {
            setModalOpen(false)
            setGenState('idle')
        }
        // If generating or success · disable close (until Continue clicked)
    }

    const activeSnH = snhLines.filter(l => addedIds.has(l.lineNumber))
    const snhTotal = activeSnH.reduce((s, l) => s + l.totalPrice, 0) + customLines.reduce((s, l) => s + l.amount, 0)
    const productSubtotal = 82000
    const designFee = productSubtotal * 0.08
    const grandTotal = productSubtotal + snhTotal + designFee

    const selectedVendors = VENDOR_BREAKDOWN.filter(v => selectedCodes.has(v.code))
    const excludedVendors = VENDOR_BREAKDOWN.filter(v => !selectedCodes.has(v.code))
    const totalPOs = selectedVendors.reduce((s, v) => s + v.pos, 0)
    const totalVendorAmount = selectedVendors.reduce((s, v) => s + v.amount, 0)
    const allSelected = selectedCodes.size === VENDOR_BREAKDOWN.length
    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
            {/* F83.N · slim header · prod ComparisonReviewModal shape · same
                pattern as F83.I (F1_p1.3 line-item match) and F83.N (F4_p42
                PIF parse) · big h1 + long subtitle folded into meta strip. */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <h2 className="text-base font-bold text-foreground">S&amp;H manual entries · MWH residential</h2>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-foreground">
                        Coordinator owns
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span>Source: <span className="font-mono text-foreground font-semibold">MWH_PIF_2026-08-14.xlsx</span></span>
                    <span>·</span>
                    <span className="tabular-nums">{activeSnH.length + customLines.length}/{snhLines.length + customLines.length} S&amp;H lines active</span>
                    <span>·</span>
                    <span>Alamir $19 flat · Nelson prepaid+add · Teknion consolidated</span>
                    <span>·</span>
                    <span className="tabular-nums">Design fee 8% · S&amp;H subtotal <span className="text-foreground font-semibold">${snhTotal.toLocaleString()}</span></span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 items-start">
                {/* Editable S&H table */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-ai" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            S&amp;H editable table · Coordinator owns
                        </span>
                        <button
                            onClick={handleAddCustom}
                            className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold bg-primary/15 hover:bg-primary/25 text-foreground rounded-lg px-2 py-1 transition-colors"
                        >
                            <Plus className="h-3 w-3" aria-hidden="true" />
                            Add custom line
                        </button>
                    </div>
                    <div className="divide-y divide-border">
                        <div className="grid grid-cols-[36px_1fr_60px_100px_60px_28px] px-4 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <span>#</span>
                            <span>Description</span>
                            <span>Vendor</span>
                            <span className="text-right">Amount</span>
                            <span className="text-right">Qty</span>
                            <span></span>
                        </div>
                        {activeSnH.map(l => (
                            <div key={l.lineNumber} className="grid grid-cols-[36px_1fr_60px_100px_60px_28px] px-4 py-2 text-xs items-center">
                                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{l.lineNumber}</span>
                                <span className="text-foreground truncate">{l.description}</span>
                                <span className="text-[10px] font-mono text-muted-foreground">{l.vendorCode}</span>
                                <span className="text-right text-foreground font-semibold tabular-nums">${l.totalPrice.toLocaleString()}</span>
                                <span className="text-right text-muted-foreground tabular-nums">{l.qty}</span>
                                <button
                                    onClick={() => handleRemove(l.lineNumber)}
                                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                                    aria-label="Remove line"
                                >
                                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                        {customLines.map(l => (
                            <div key={l.id} className="grid grid-cols-[36px_1fr_60px_100px_60px_28px] px-4 py-2 text-xs items-center bg-primary/5 animate-in fade-in duration-300">
                                <Edit3 className="h-3 w-3 text-foreground" aria-hidden="true" />
                                <input
                                    type="text"
                                    defaultValue={l.description}
                                    className="text-foreground bg-transparent border-b border-primary/40 focus:outline-none focus-visible:border-primary"
                                />
                                <span className="text-[10px] font-mono text-muted-foreground">—</span>
                                <input
                                    type="number"
                                    defaultValue={0}
                                    className="text-right tabular-nums bg-transparent border-b border-primary/40 focus:outline-none focus-visible:border-primary"
                                />
                                <span className="text-right text-muted-foreground tabular-nums">1</span>
                                <button
                                    onClick={() => setCustomLines(prev => prev.filter(x => x.id !== l.id))}
                                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                                >
                                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground flex-1">
                            {activeSnH.length + customLines.length} of 26 S&amp;H entries active
                        </span>
                        <span className="text-xs text-foreground font-semibold tabular-nums">
                            S&amp;H subtotal ${snhTotal.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Totals panel */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">MWH totals · live recompute</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Product subtotal (300 lines)</span>
                            <span className="text-foreground tabular-nums">${productSubtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">S&amp;H subtotal</span>
                            <span className="text-foreground tabular-nums">${snhTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <Percent className="h-3 w-3" aria-hidden="true" />
                                Design fee (8% of product)
                            </span>
                            <span className="text-foreground tabular-nums">${designFee.toLocaleString()}</span>
                        </div>
                        <div className="pt-3 border-t border-border flex items-center justify-between">
                            <span className="text-foreground font-bold">Grand total</span>
                            <span className="text-foreground font-bold tabular-nums text-lg">${grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="p-4 border-t border-border">
                        <button
                            onClick={handleOpenGenerate}
                            disabled={genState !== 'idle'}
                            className="w-full inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shadow-sm"
                        >
                            {genState === 'success' ? (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    {totalPOs} PO draft{totalPOs === 1 ? '' : 's'} generated
                                </>
                            ) : (
                                <>
                                    <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                                    Generate PO drafts · select vendors
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
                <Truck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Freight rules · per vendor</div>
                    <div className="text-muted-foreground mt-0.5">
                        Alamir: $19 flat &lt;$150 · Nelson: prepaid+add · Teknion: consolidated · HBF: lift-gate. Coordinator overrides when a promotion applies or exception. Never auto-set (FC6 · human control preserved).
                    </div>
                </div>
            </div>


            {/* Generate flow modal · confirm → generating → success */}
            <Transition show={modalOpen} as={Fragment}>
                <Dialog onClose={handleCancelModal} className="relative z-[350]">
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                                {/* Header · adapts per state */}
                                <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        {genState === 'confirming' && (
                                            <div className="h-9 w-9 rounded-lg bg-ai-light flex items-center justify-center text-ai">
                                                <Sparkles className="h-5 w-5" aria-hidden="true" />
                                            </div>
                                        )}
                                        {genState === 'generating' && (
                                            <div className="h-9 w-9 rounded-lg bg-ai-light flex items-center justify-center text-ai">
                                                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                                            </div>
                                        )}
                                        {genState === 'success' && (
                                            <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center text-success">
                                                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-sm font-bold text-foreground">
                                                {genState === 'confirming' && 'Confirm PO batch generation'}
                                                {genState === 'generating' && 'Strata is generating 26 PO drafts…'}
                                                {genState === 'success' && '26 PO drafts created successfully'}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {genState === 'confirming' && 'Review the vendor breakdown · then Confirm to create the drafts'}
                                                {genState === 'generating' && 'Never auto-send · drafts land ready for per-card review'}
                                                {genState === 'success' && 'All drafts saved to NetSuite · ready for review in the Batch tab'}
                                            </div>
                                        </div>
                                    </div>
                                    {genState === 'confirming' && (
                                        <button onClick={handleCancelModal} aria-label="Cancel" className="h-8 w-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
                                    {/* Confirming · show vendor breakdown with per-vendor checkboxes */}
                                    {genState === 'confirming' && (
                                        <div className="space-y-3">
                                            <p className="text-xs text-muted-foreground">
                                                Strata will create <strong className="text-foreground">{totalPOs} vendor POs</strong> from the MWH residential batch · grouped by vendor with S&amp;H rules applied. Total <strong className="text-foreground tabular-nums">${totalVendorAmount.toLocaleString()}</strong>. Uncheck any vendor to exclude it from this run (excluded ones stay in draft state, re-runnable). Drafts land in the Batch tab for per-card review before send.
                                            </p>
                                            <div className="rounded-lg border border-border overflow-hidden">
                                                <div className="grid grid-cols-[40px_50px_1fr_50px_100px_130px] px-3 py-1.5 bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground items-center">
                                                    <label className="inline-flex items-center gap-1 cursor-pointer" title={allSelected ? 'Deselect all' : 'Select all'}>
                                                        <input
                                                            type="checkbox"
                                                            checked={allSelected}
                                                            onChange={handleToggleAll}
                                                            className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
                                                            aria-label={allSelected ? 'Deselect all vendors' : 'Select all vendors'}
                                                        />
                                                    </label>
                                                    <span>Code</span>
                                                    <span>Vendor</span>
                                                    <span className="text-center">POs</span>
                                                    <span className="text-right">Amount</span>
                                                    <span className="text-right">Method</span>
                                                </div>
                                                <ul className="divide-y divide-border">
                                                    {VENDOR_BREAKDOWN.map(v => {
                                                        const checked = selectedCodes.has(v.code)
                                                        return (
                                                            <li
                                                                key={v.code}
                                                                onClick={() => handleToggleVendor(v.code)}
                                                                className={`
                                                                    grid grid-cols-[40px_50px_1fr_50px_100px_130px] px-3 py-2 text-xs items-center cursor-pointer transition-colors
                                                                    ${checked ? 'hover:bg-muted/40' : 'bg-muted/40 opacity-60 hover:opacity-80'}
                                                                `}
                                                            >
                                                                <label onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checked}
                                                                        onChange={() => handleToggleVendor(v.code)}
                                                                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
                                                                        aria-label={`${checked ? 'Exclude' : 'Include'} ${v.name}`}
                                                                    />
                                                                </label>
                                                                <span className={`font-mono font-semibold ${checked ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{v.code}</span>
                                                                <div className="min-w-0">
                                                                    <div className={`font-medium truncate ${checked ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{v.name}</div>
                                                                    <div className="text-[10px] text-muted-foreground">{v.lines} lines</div>
                                                                </div>
                                                                <span className={`text-center tabular-nums font-semibold ${checked ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{v.pos}</span>
                                                                <span className={`text-right tabular-nums font-semibold ${checked ? 'text-foreground' : 'text-muted-foreground line-through'}`}>${v.amount.toLocaleString()}</span>
                                                                <span className="text-right text-[10px] text-muted-foreground truncate">{v.method}</span>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                                <div className="px-3 py-2 bg-muted/40 border-t border-border grid grid-cols-[40px_50px_1fr_50px_100px_130px] text-xs items-center">
                                                    <span></span>
                                                    <span></span>
                                                    <span className="text-foreground font-bold">
                                                        Selected
                                                        {excludedVendors.length > 0 && (
                                                            <span className="text-[10px] text-muted-foreground font-normal ml-1">
                                                                · {excludedVendors.length} excluded
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-center text-foreground font-bold tabular-nums">{totalPOs}</span>
                                                    <span className="text-right text-foreground font-bold tabular-nums">${totalVendorAmount.toLocaleString()}</span>
                                                    <span></span>
                                                </div>
                                            </div>
                                            {excludedVendors.length > 0 && (
                                                <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-[11px] text-foreground">
                                                    <strong className="text-warning">{excludedVendors.length} vendor{excludedVendors.length === 1 ? '' : 's'} excluded:</strong>{' '}
                                                    {excludedVendors.map(v => v.name).join(' · ')} · these stay in draft · re-run the generator later to include them.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Generating · staged progress */}
                                    {genState === 'generating' && (
                                        <div className="space-y-2">
                                            {GENERATE_STEPS.map((step, i) => {
                                                const isDone = i < genStepIdx
                                                const isRunning = i === genStepIdx
                                                return (
                                                    <div key={i} className={`
                                                        flex items-start gap-2 border-l-2 pl-3 py-1
                                                        ${isDone ? 'border-l-success' : isRunning ? 'border-l-ai' : 'border-l-border'}
                                                        ${!isDone && !isRunning ? 'opacity-40' : ''}
                                                    `}>
                                                        <div className="shrink-0 mt-0.5">
                                                            {isDone && <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />}
                                                            {isRunning && <Loader2 className="h-4 w-4 text-ai animate-spin" aria-hidden="true" />}
                                                            {!isDone && !isRunning && <span className="h-4 w-4 rounded-full border border-border block" aria-hidden="true" />}
                                                        </div>
                                                        <span className={`text-xs ${isRunning ? 'text-foreground font-semibold' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                            {step}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {/* Success · summary + next-step preview */}
                                    {genState === 'success' && (
                                        <div className="space-y-3">
                                            <div className="rounded-lg border border-success/40 bg-success/5 p-3 space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">POs generated</span>
                                                    <span className="text-foreground font-bold tabular-nums">{totalPOs}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">Total value</span>
                                                    <span className="text-foreground font-bold tabular-nums">${totalVendorAmount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">Vendors</span>
                                                    <span className="text-foreground font-bold">
                                                        {selectedVendors.length}
                                                        {excludedVendors.length > 0 && (
                                                            <span className="text-[10px] text-muted-foreground font-normal ml-1">
                                                                · {excludedVendors.length} excluded
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">Status</span>
                                                    <span className="inline-flex items-center gap-1 text-success font-semibold">
                                                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                        Draft · never auto-sent
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                Next step · review each PO in the Batch grid before releasing per-vendor. Teknion typically ships first (SIF Online has fastest ACK cycle) · rest follow Coordinator&apos;s discretion.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer · adapts per state */}
                                <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center gap-2">
                                    {genState === 'confirming' && (
                                        <>
                                            <button
                                                onClick={handleCancelModal}
                                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-md px-2.5 py-2 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleConfirmGenerate}
                                                disabled={selectedCodes.size === 0}
                                                className="ml-auto inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shadow-sm"
                                            >
                                                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                                                {selectedCodes.size === 0
                                                    ? 'Select at least one vendor'
                                                    : `Confirm · generate ${totalPOs} PO${totalPOs === 1 ? '' : 's'}`}
                                            </button>
                                        </>
                                    )}
                                    {genState === 'generating' && (
                                        <span className="ml-auto text-[11px] text-muted-foreground italic">
                                            Working… step {Math.min(genStepIdx + 1, GENERATE_STEPS.length)} of {GENERATE_STEPS.length}
                                        </span>
                                    )}
                                    {genState === 'success' && (
                                        <button
                                            onClick={handleContinue}
                                            className="ml-auto inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                        >
                                            Continue to Batch grid
                                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
