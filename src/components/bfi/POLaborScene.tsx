/**
 * COMPONENT: POLaborScene  (a1.2c)
 * PURPOSE: Agency Fee step 2c — Lauren is reviewing her queue, labor quote email
 *          arrives from WIG, she triggers Strata AI extraction manually, then
 *          reviews PO + Labor Quote + designer approval, confirms CORE entry + EDI.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { FileText, Download, CheckCircle2, AlertTriangle, Sparkles, ChevronRight, ArrowRight, Mail, Clock, Pencil, Save, X } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import SpecsDocViewer from './SpecsDocViewer'
import BFIDocViewer, { BFI_DOCS } from './BFIDocViewer'

interface POLaborSceneProps {
    onConfirm?: () => void
}

type ScenePhase = 'incoming' | 'extracting' | 'review' | 'confirmed'

const QUEUE_ITEMS = [
    { id: 'Q-2026-0082', client: 'PS-208K · Brooklyn DoE',    status: 'SIF Validated',       age: '2h ago',  dot: 'bg-success' },
    { id: 'Q-2026-0079', client: 'NYCHA · Bronx Housing',     status: 'Awaiting PO',          age: '1d ago',  dot: 'bg-warning' },
    { id: 'Q-2026-0071', client: 'MTA · 2 Broadway',          status: 'CPR Pending',           age: '3d ago',  dot: 'bg-muted-foreground' },
    { id: 'DOE-2840',    client: 'NYC DoE · Queens Center',   status: 'Agency Fee Verify',    age: '5d ago',  dot: 'bg-muted-foreground' },
]

const PO_ITEMS = [
    { label: 'Workstations',   qty: '×24', price: '$144,000' },
    { label: 'Lounge Seating', qty: '×12', price: '$84,000'  },
    { label: 'Filing Units',   qty: '×6',  price: '$7,560'   },
]

const LABOR_ITEMS = [
    { label: 'Inside Delivery', amount: '$2,400' },
    { label: 'Installation',    amount: '$7,200' },
    { label: 'OT Differential', amount: '$1,080' },
    { label: 'Truck Charge',    amount: '$1,120' },
]

const EXTRACTION_LINES = [
    'Attachment read · Vendor-Order-17706.pdf',
    'Vendor: Workplace / WIG · Michael Boyle · $11,800',
    'PO matched: DOE-0089 · NYC Dept. of Education · $235,560',
    'Specs verified: Q-2026-0089 · Robert Chen approved ✓',
]

const EDI_LINES = ['CORE ──EDI──▶ OVNIQ', '✓ Order Q-2026-0089 entered', '✓ Customer acceptance form created in OVNIQ']

export default function POLaborScene({ onConfirm }: POLaborSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [phase, setPhase]                   = useState<ScenePhase>('incoming')
    const [extractedCount, setExtractedCount] = useState(0)
    const [dateConfirmed, setDateConfirmed]   = useState(false)
    const [submitting, setSubmitting]         = useState(false)
    const [ediLines, setEdiLines]             = useState(0)
    const [docGenerated, setDocGenerated]     = useState(false)
    const [isEditingDoc, setIsEditingDoc]     = useState(false)
    const [saveFlash, setSaveFlash]           = useState(false)
    const [deliveryDate, setDeliveryDate]     = useState('2026-05-14')
    const [coreFields, setCoreFields]         = useState({
        quoteRef:  'Q-2026-0089',
        contract:  'CoNY · City of New York',
        delivery:  'May 14, 2026',
        notes:     'DOE-2847 · NYC Dept. of Education · Miller Knoll · Q-2026-0089',
    })
    const [draftFields, setDraftFields]       = useState(coreFields)

    const formatDeliveryDate = (iso: string) => {
        const [year, month, day] = iso.split('-')
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
        return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`
    }

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    // extracting → animate lines → review (auto after manual trigger)
    useEffect(() => {
        if (phase !== 'extracting') return
        const timers: ReturnType<typeof setTimeout>[] = []
        EXTRACTION_LINES.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setExtractedCount(i + 1)), 400 + i * 650))
        })
        timers.push(setTimeout(
            pauseAware(() => setPhase('review')),
            400 + EXTRACTION_LINES.length * 650 + 700
        ))
        return () => timers.forEach(clearTimeout)
    }, [phase, pauseAware])

    const handleConfirm = () => {
        setSubmitting(true)
        EDI_LINES.forEach((_, i) => {
            setTimeout(pauseAware(() => setEdiLines(i + 1)), 400 + i * 500)
        })
        setTimeout(pauseAware(() => {
            setSubmitting(false)
            setPhase('confirmed')
            setTimeout(pauseAware(() => onConfirm?.()), 1000)
        }), 400 + EDI_LINES.length * 500 + 400)
    }

    // ── confirmed ───────────────────────────────────────────────────────────
    if (phase === 'confirmed') {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-success/5 border border-success/30 rounded-xl p-3.5 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">CORE entry confirmed · EDI transmitted to OVNIQ</div>
                        <div className="text-muted-foreground mt-0.5">Q-2026-0089 · Customer acceptance form created · DOE-2847</div>
                    </div>
                </div>
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO, SOURCES.OVNIQ] }]} />
            </div>
        )
    }

    // ── incoming ─────────────────────────────────────────────────────────────
    if (phase === 'incoming') {
        return (
            <div className="space-y-3 animate-in fade-in duration-300">
                {/* Email notification with manual trigger */}
                <div className="border border-ai/30 bg-ai/5 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-3.5 py-3">
                        <div className="h-9 w-9 rounded-full bg-ai/10 border border-ai/20 flex items-center justify-center shrink-0">
                            <Mail className="h-4 w-4 text-ai" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-foreground">Labor Quote #17706 · Workplace / WIG</span>
                                <span className="text-[9px] font-bold bg-ai/10 text-ai border border-ai/20 px-2 py-0.5 rounded-full font-mono">New</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">From: michael.boyle@workplace-wig.com · PDF attachment detected</div>
                        </div>
                    </div>
                    {/* Actual email PDF */}
                    <div className="px-3.5 pb-2">
                        <BFIDocViewer {...BFI_DOCS.INVOICE_EMAIL_17706} height={200} />
                    </div>
                    <div className="px-3.5 pb-3">
                        <button
                            onClick={() => setPhase('extracting')}
                            className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold rounded-lg bg-ai text-white hover:opacity-90 transition-all"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Process with Strata AI
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Background work queue */}
                <div className="border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2 bg-muted/40 border-b border-border">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Pending reviews · Agency Fee queue</span>
                    </div>
                    <div className="divide-y divide-border/60">
                        {QUEUE_ITEMS.map(item => (
                            <div key={item.id} className="flex items-center gap-3 px-3.5 py-2.5">
                                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${item.dot}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-semibold text-foreground">{item.client}</div>
                                    <div className="text-[10px] text-muted-foreground font-mono">{item.id}</div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-[10px] text-muted-foreground">{item.status}</div>
                                    <div className="text-[9px] text-muted-foreground/60 font-mono">{item.age}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
            </div>
        )
    }

    // ── extracting ───────────────────────────────────────────────────────────
    if (phase === 'extracting') {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-ai/5 border border-ai/30 rounded-xl px-3.5 py-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-ai/10 border border-ai/20 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-ai" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-foreground">Labor Quote #17706 · Workplace / WIG</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">From: michael.boyle@workplace-wig.com · To: lauren.demarco@bfifurniture.com</div>
                    </div>
                    <span className="text-[9px] font-bold bg-ai/10 text-ai border border-ai/20 px-2 py-0.5 rounded-full font-mono shrink-0">Received</span>
                </div>

                <div className="border border-ai/20 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2 bg-ai/10 border-b border-ai/20">
                        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0" />
                        <span className="text-[10px] font-bold text-ai uppercase tracking-wide">Strata AI · Extracting data</span>
                        {extractedCount < EXTRACTION_LINES.length
                            ? <div className="h-3 w-3 border-2 border-ai border-t-transparent rounded-full animate-spin ml-auto shrink-0" />
                            : <CheckCircle2 className="h-3 w-3 text-success ml-auto shrink-0" />
                        }
                    </div>
                    <div className="px-3.5 py-2.5 space-y-2">
                        {EXTRACTION_LINES.slice(0, extractedCount).map((line, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] animate-in fade-in duration-300">
                                <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                                <span className={i === 0 ? 'font-mono text-muted-foreground' : 'text-foreground'}>{line}</span>
                            </div>
                        ))}
                        {extractedCount < EXTRACTION_LINES.length && (
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50">
                                <div className="h-3 w-3 border border-muted-foreground/30 rounded-full shrink-0" />
                                <span className="font-mono text-[10px]">…</span>
                            </div>
                        )}
                    </div>
                </div>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO, SOURCES.OVNIQ] }]} />
            </div>
        )
    }

    // ── review ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* AI ready banner */}
            <div className="bg-ai/5 border border-ai/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0" />
                <div className="text-xs flex-1">
                    <span className="font-bold text-foreground">2 documents ready</span>
                    <span className="text-muted-foreground"> · PO from CORE · Labor quote extracted from email · Q-2026-0089</span>
                </div>
            </div>

            {/* Actual WIG invoice PDF */}
            <BFIDocViewer {...BFI_DOCS.INVOICE_030923} height={280} />

            {/* Designer approval — full spec doc view */}
            <div className="border border-success/30 bg-success/5 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border-b border-success/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                    <span className="text-[10px] font-bold text-success uppercase tracking-wide">Designer Approved · Robert Chen · Miller Knoll</span>
                    <span className="ml-auto text-[9px] text-muted-foreground font-mono">May 6 · 9:25 AM</span>
                </div>
                <div className="p-2">
                    <SpecsDocViewer confirmed />
                </div>
            </div>

            {/* Side-by-side document cards */}
            <div className="grid grid-cols-2 gap-3">

                {/* PO — left */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border">
                        <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-foreground leading-tight">Purchase Order</div>
                            <div className="text-[9px] text-muted-foreground">NYC Dept. of Education</div>
                        </div>
                    </div>
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-950">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded overflow-hidden">
                            <div className="px-2.5 pt-2 pb-1.5 border-b border-zinc-200 dark:border-zinc-700 flex items-start justify-between gap-2">
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100">Purchase Order</div>
                                    <div className="text-[7px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">NYC Dept. of Education</div>
                                </div>
                                <div className="text-right space-y-0.5 shrink-0">
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <span className="text-[7px] text-zinc-400 dark:text-zinc-500 font-mono">P/O#</span>
                                        <span className="text-[7px] font-bold text-zinc-800 dark:text-zinc-200 font-mono">DOE-0089</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <span className="text-[7px] text-zinc-400 dark:text-zinc-500 font-mono">DATE</span>
                                        <span className="text-[7px] text-zinc-600 dark:text-zinc-300 font-mono">05/06/26</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <span className="text-[7px] text-zinc-400 dark:text-zinc-500 font-mono">TERMS</span>
                                        <span className="text-[7px] text-zinc-600 dark:text-zinc-300 font-mono">Net 30</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-10 bg-zinc-800 dark:bg-zinc-700 px-2 py-1">
                                <span className="col-span-1 text-[7px] font-bold uppercase text-zinc-200">QTY</span>
                                <span className="col-span-6 text-[7px] font-bold uppercase text-zinc-200">DESCRIPTION</span>
                                <span className="col-span-3 text-[7px] font-bold uppercase text-zinc-200 text-right">AMOUNT</span>
                            </div>
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {PO_ITEMS.map(item => (
                                    <div key={item.label} className="grid grid-cols-10 px-2 py-1.5 items-baseline">
                                        <span className="col-span-1 text-[8px] text-zinc-400 dark:text-zinc-500 font-mono">{item.qty}</span>
                                        <span className="col-span-6 text-[8px] text-zinc-800 dark:text-zinc-200">{item.label}</span>
                                        <span className="col-span-3 text-[8px] text-zinc-800 dark:text-zinc-200 text-right tabular-nums font-mono">{item.price}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center px-2 py-1.5 border-t-2 border-zinc-900 dark:border-zinc-300 bg-zinc-50 dark:bg-zinc-800">
                                <span className="text-[8px] font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono">Total Purchase Order</span>
                                <span className="text-[8px] font-bold text-zinc-900 dark:text-zinc-100 tabular-nums font-mono">$235,560</span>
                            </div>
                            <div className="px-2 py-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                                <button className="inline-flex items-center gap-1.5 text-[9px] font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-600 rounded-full px-2.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                    <Download className="h-2.5 w-2.5" />
                                    PO-2026-DOE-0089.pdf
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Labor Quote — right */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border">
                        <Mail className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-foreground leading-tight">Labor Quote</div>
                            <div className="text-[9px] text-muted-foreground">Extracted from email · Workplace / WIG</div>
                        </div>
                    </div>
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-950">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded overflow-hidden">
                            <div className="px-2.5 pt-2 pb-1.5 border-b border-zinc-200 dark:border-zinc-700 flex items-start justify-between gap-2">
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100">Labor Quotation</div>
                                    <div className="text-[7px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">Workplace / WIG · Michael Boyle</div>
                                </div>
                                <div className="text-right space-y-0.5 shrink-0">
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <span className="text-[7px] text-zinc-400 dark:text-zinc-500 font-mono">ORDER#</span>
                                        <span className="text-[7px] font-bold text-zinc-800 dark:text-zinc-200 font-mono">#17706</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <span className="text-[7px] text-zinc-400 dark:text-zinc-500 font-mono">DATE</span>
                                        <span className="text-[7px] text-zinc-600 dark:text-zinc-300 font-mono">05/06/26</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <span className="text-[7px] text-zinc-400 dark:text-zinc-500 font-mono">PROJECT</span>
                                        <span className="text-[7px] text-zinc-600 dark:text-zinc-300 font-mono">DOE-2847</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-5 bg-zinc-800 dark:bg-zinc-700 px-2 py-1">
                                <span className="col-span-3 text-[7px] font-bold uppercase text-zinc-200">DESCRIPTION</span>
                                <span className="col-span-2 text-[7px] font-bold uppercase text-zinc-200 text-right">AMOUNT</span>
                            </div>
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {LABOR_ITEMS.map(item => (
                                    <div key={item.label} className="grid grid-cols-5 px-2 py-1.5">
                                        <span className="col-span-3 text-[8px] text-zinc-800 dark:text-zinc-200">{item.label}</span>
                                        <span className="col-span-2 text-[8px] text-zinc-800 dark:text-zinc-200 text-right tabular-nums font-mono">{item.amount}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center px-2 py-1.5 border-t-2 border-zinc-900 dark:border-zinc-300 bg-zinc-50 dark:bg-zinc-800">
                                <span className="text-[8px] font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono">Total</span>
                                <span className="text-[8px] font-bold text-zinc-900 dark:text-zinc-100 tabular-nums font-mono">$11,800</span>
                            </div>
                            <div className="px-2 py-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                                <button className="inline-flex items-center gap-1.5 text-[9px] font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-600 rounded-full px-2.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                    <Download className="h-2.5 w-2.5" />
                                    Vendor-Order-17706.pdf
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* 30-day delivery window */}
            <div className="bg-warning/5 border border-warning/30 rounded-xl px-3.5 py-3 space-y-2.5">
                <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">WIG 30-day delivery window</div>
                        <div className="text-muted-foreground mt-0.5">Workplace charges extra after 30 days in storage. Confirm delivery date to proceed.</div>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Delivery date</label>
                        <input
                            type="date"
                            value={deliveryDate}
                            onChange={e => { setDeliveryDate(e.target.value); setDateConfirmed(false) }}
                            disabled={dateConfirmed}
                            className="w-full text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground disabled:opacity-60 cursor-pointer"
                        />
                    </div>
                    {!dateConfirmed ? (
                        <button
                            onClick={() => {
                                setCoreFields(f => ({ ...f, delivery: formatDeliveryDate(deliveryDate) }))
                                setDateConfirmed(true)
                            }}
                            className="mt-5 px-3 py-2 text-xs font-bold rounded-lg border border-border hover:bg-muted/30 transition-colors text-foreground"
                        >
                            Confirm
                        </button>
                    ) : (
                        <div className="mt-5 flex items-center gap-1 text-[10px] font-bold text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Confirmed
                        </div>
                    )}
                </div>
            </div>

            {/* Before Strata */}
            <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Before Strata:</span> The labor quote arrived by email to Michael, who compiled figures by hand and entered them in CORE manually. Lauren tracked the 30-day window in a monthly Excel report — no system visibility.
                </p>
            </div>

            {/* Generate CORE entry button */}
            {!docGenerated && dateConfirmed && !submitting && (
                <button
                    onClick={() => setDocGenerated(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl border border-border bg-muted/40 hover:bg-muted/70 text-foreground transition-all"
                >
                    <FileText className="h-3.5 w-3.5" />
                    Generate CORE entry preview
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            )}

            {/* Generated CORE entry card */}
            {docGenerated && !submitting && (
                <div className="border border-ai/20 rounded-xl overflow-hidden animate-in fade-in duration-300">
                    {/* Header bar */}
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-ai/5 border-b border-ai/20">
                        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0" />
                        <span className="text-[10px] font-bold text-foreground flex-1">CORE Entry · AI Generated · Q-2026-0089</span>
                        {saveFlash && (
                            <span className="text-[9px] font-bold text-success animate-in fade-in duration-200">Documents updated ✓</span>
                        )}
                        {!isEditingDoc ? (
                            <button
                                onClick={() => { setDraftFields(coreFields); setIsEditingDoc(true); setSaveFlash(false) }}
                                className="inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-1 rounded-full border border-ai/30 text-ai hover:bg-ai/10 transition-colors"
                            >
                                <Pencil className="h-2.5 w-2.5" />
                                Edit
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsEditingDoc(false)}
                                    className="inline-flex items-center gap-1 text-[9px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-2.5 w-2.5" />
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setCoreFields(draftFields)
                                        setIsEditingDoc(false)
                                        setSaveFlash(true)
                                        setTimeout(() => setSaveFlash(false), 2500)
                                    }}
                                    className="inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-1 rounded-full bg-ai text-white hover:opacity-90 transition-colors"
                                >
                                    <Save className="h-2.5 w-2.5" />
                                    Save
                                </button>
                            </div>
                        )}
                        {!isEditingDoc && !saveFlash && (
                            <span className="text-[9px] font-bold bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full uppercase tracking-wide">Ready</span>
                        )}
                    </div>

                    {/* Document body */}
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-950">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded overflow-hidden">
                            {/* Doc header */}
                            <div className="px-3 pt-2.5 pb-2 border-b border-zinc-200 dark:border-zinc-700 flex items-start justify-between gap-2">
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-wide text-zinc-900 dark:text-zinc-100">CORE Purchase Entry</div>
                                    <div className="text-[7px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">NYC Dept. of Education · DOE-2847</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[7px] text-zinc-400 dark:text-zinc-500 font-mono">Entry date</div>
                                    <div className="text-[7px] font-bold text-zinc-700 dark:text-zinc-300 font-mono">05/06/26 · 9:31 AM</div>
                                </div>
                            </div>
                            {/* Band */}
                            <div className={`px-3 py-1 transition-colors ${isEditingDoc ? 'bg-ai/80' : 'bg-zinc-800 dark:bg-zinc-700'}`}>
                                <span className="text-[7px] font-bold uppercase text-zinc-200 tracking-wide">
                                    {isEditingDoc ? 'EDITING MODE · Changes apply to related documents' : 'ORDER ENTRY · DOE-2847'}
                                </span>
                            </div>
                            {/* Rows */}
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {/* Quote ref — editable */}
                                <div className="flex items-center justify-between gap-2 px-3 py-2">
                                    <span className="text-[8px] text-zinc-500 dark:text-zinc-400 font-mono shrink-0">Quote ref</span>
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        {isEditingDoc
                                            ? <input value={draftFields.quoteRef} onChange={e => setDraftFields(p => ({ ...p, quoteRef: e.target.value }))}
                                                className="text-[9px] bg-zinc-50 dark:bg-zinc-800 border border-ai/30 rounded px-2 py-0.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-ai/40 w-36 font-mono" />
                                            : <span className="text-[9px] font-semibold text-zinc-800 dark:text-zinc-200">{coreFields.quoteRef}</span>
                                        }
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-ai/10 text-ai border border-ai/20 font-mono shrink-0">Strata AI</span>
                                    </div>
                                </div>
                                {/* Contract — editable */}
                                <div className="flex items-center justify-between gap-2 px-3 py-2">
                                    <span className="text-[8px] text-zinc-500 dark:text-zinc-400 font-mono shrink-0">Contract</span>
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        {isEditingDoc
                                            ? <input value={draftFields.contract} onChange={e => setDraftFields(p => ({ ...p, contract: e.target.value }))}
                                                className="text-[9px] bg-zinc-50 dark:bg-zinc-800 border border-ai/30 rounded px-2 py-0.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-ai/40 w-40 font-mono" />
                                            : <span className="text-[9px] font-semibold text-zinc-800 dark:text-zinc-200">{coreFields.contract}</span>
                                        }
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-ai/10 text-ai border border-ai/20 font-mono shrink-0">CORE</span>
                                    </div>
                                </div>
                                {/* Product total — locked */}
                                <div className="flex items-center justify-between gap-2 px-3 py-2">
                                    <span className="text-[8px] text-zinc-500 dark:text-zinc-400 font-mono shrink-0">Product total</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-semibold text-zinc-800 dark:text-zinc-200">$235,560</span>
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-ai/10 text-ai border border-ai/20 font-mono shrink-0">CORE PO</span>
                                    </div>
                                </div>
                                {/* Labor total — locked */}
                                <div className="flex items-center justify-between gap-2 px-3 py-2">
                                    <span className="text-[8px] text-zinc-500 dark:text-zinc-400 font-mono shrink-0">Labor total</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-semibold text-zinc-800 dark:text-zinc-200">$11,800</span>
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-ai/10 text-ai border border-ai/20 font-mono shrink-0">Email · WIG</span>
                                    </div>
                                </div>
                                {/* Delivery — editable */}
                                <div className="flex items-center justify-between gap-2 px-3 py-2">
                                    <span className="text-[8px] text-zinc-500 dark:text-zinc-400 font-mono shrink-0">Delivery</span>
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        {isEditingDoc
                                            ? <input value={draftFields.delivery} onChange={e => setDraftFields(p => ({ ...p, delivery: e.target.value }))}
                                                className="text-[9px] bg-zinc-50 dark:bg-zinc-800 border border-ai/30 rounded px-2 py-0.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-ai/40 w-32 font-mono" />
                                            : <span className="text-[9px] font-semibold text-zinc-800 dark:text-zinc-200">{coreFields.delivery}</span>
                                        }
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-ai/10 text-ai border border-ai/20 font-mono shrink-0">Confirmed</span>
                                    </div>
                                </div>
                            </div>
                            {/* Grand total */}
                            <div className="flex justify-between items-center px-3 py-2 border-t-2 border-zinc-900 dark:border-zinc-300 bg-zinc-50 dark:bg-zinc-800">
                                <span className="text-[9px] font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono">Grand Total</span>
                                <span className="text-[9px] font-bold text-zinc-900 dark:text-zinc-100 tabular-nums font-mono">$247,360</span>
                            </div>
                            {/* Notes */}
                            <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                                <label className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Notes / Reference</label>
                                {isEditingDoc
                                    ? <textarea rows={2} value={draftFields.notes} onChange={e => setDraftFields(p => ({ ...p, notes: e.target.value }))}
                                        className="w-full text-[10px] bg-zinc-50 dark:bg-zinc-800 border border-ai/30 rounded px-2 py-1.5 text-zinc-700 dark:text-zinc-300 resize-none focus:outline-none focus:ring-1 focus:ring-ai/40 font-mono" />
                                    : <div className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 leading-relaxed">{coreFields.notes}</div>
                                }
                            </div>
                            <div className="text-[8px] text-zinc-400 dark:text-zinc-500 text-center pb-2">
                                {isEditingDoc ? 'Edit Quote ref, Contract, Delivery and Notes · Totals locked to source documents' : 'Strata AI assembled from CORE + email · Editable before submission'}
                            </div>
                        </div>
                    </div>
                    <div className="px-3.5 py-2 border-t border-ai/20 bg-ai/5">
                        <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO, SOURCES.VENDOR_EMAIL] }]} />
                    </div>
                </div>
            )}

            {/* EDI animation */}
            {submitting && (
                <div className="bg-ai/5 border border-ai/20 rounded-xl px-3.5 py-3 space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="h-3.5 w-3.5 border-2 border-ai border-t-transparent rounded-full animate-spin shrink-0" />
                        <span className="font-bold text-foreground">AI orchestrating CORE entry + EDI…</span>
                    </div>
                    {Array.from({ length: ediLines }, (_, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground animate-in fade-in duration-300">
                            {i === 0
                                ? <><ArrowRight className="h-3 w-3 text-ai shrink-0" /><span className="font-mono text-ai">{EDI_LINES[0]}</span></>
                                : <><CheckCircle2 className="h-3 w-3 text-success shrink-0" /><span>{EDI_LINES[i]}</span></>
                            }
                        </div>
                    ))}
                </div>
            )}

            {/* CTA */}
            {!submitting && (
                <button
                    onClick={handleConfirm}
                    disabled={!dateConfirmed || !docGenerated}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
                >
                    <Sparkles className="h-4 w-4" />
                    Generate orders · Confirm in CORE · EDI to OVNIQ
                    <ChevronRight className="h-4 w-4" />
                </button>
            )}

            {!dateConfirmed && !submitting && (
                <p className="text-[11px] text-muted-foreground text-center">Confirm delivery date above to proceed</p>
            )}
            {dateConfirmed && !docGenerated && !submitting && (
                <p className="text-[11px] text-muted-foreground text-center">Generate CORE entry preview above to proceed</p>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO, SOURCES.OVNIQ] }]} />
        </div>
    )
}
