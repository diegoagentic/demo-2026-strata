/**
 * COMPONENT: QuoteIntakePricingScene  (a1.2)
 * PURPOSE: Agency Fee step 2 — 3-phase flow:
 *   Phase 'email':      Email from Robert Chen (MK Rep) · PDF + SIF · OCR
 *   Phase 'validating': OVNIQ validation · 4 lines progressive · Panel System restricted
 *   Phase 'discount':   Discount formula · City/State NY toggle · Labor panel · Agency fee
 *
 * Order: DOE-2847 · Q-2026-0089 · NYC Dept. of Education
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, ChevronRight, ChevronDown, ChevronUp, FileText, Mail, Building2, Eye, Download } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface QuoteIntakePricingSceneProps {
    onApply?: () => void
}

type Phase = 'email' | 'validating' | 'discount'

const VALIDATION_LINES = [
    { product: 'Workstations ×24',   sif: '$144,000', contract: '$144,000', status: 'ok'        as const, conf: '98%' },
    { product: 'Lounge Seating ×12', sif: '$84,000',  contract: '$84,000',  status: 'ok'        as const, conf: '96%' },
    { product: 'Filing Units ×6',    sif: '$8,100',   contract: '$7,560',   status: 'corrected' as const, conf: '71%' },
]

const DISCOUNT_LINES = [
    { product: 'Workstations ×24',   list: '$240,000', sale: '$144,000', pct: '−40.0%' },
    { product: 'Lounge Seating ×12', list: '$140,000', sale: '$84,000',  pct: '−40.0%' },
    { product: 'Filing Units ×6',    list: '$12,600',  sale: '$7,560',   pct: '−40.0%' },
]


export default function QuoteIntakePricingScene({ onApply }: QuoteIntakePricingSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [phase, setPhase]                       = useState<Phase>('email')
    const [revealedCount, setRevealedCount]       = useState(0)
    const [contractType, setContractType]         = useState<'city' | 'state'>('city')
    const [applied, setApplied]                   = useState(false)
    const [ocr, setOcr]                           = useState(false)
    const [sifExpanded, setSifExpanded]           = useState(false)
    const [activeAttachment, setActiveAttachment] = useState<'pdf' | 'sif'>('pdf')
    const [downloading, setDownloading]           = useState<'pdf' | 'sif' | null>(null)
    const [downloadedPdf, setDownloadedPdf]       = useState(false)
    const [downloadedSif, setDownloadedSif]       = useState(false)

    const handleDownload = (type: 'pdf' | 'sif') => {
        if (downloading) return
        setDownloading(type)
        setTimeout(() => {
            setDownloading(null)
            if (type === 'pdf') setDownloadedPdf(true)
            else setDownloadedSif(true)
        }, 1200)
    }

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    // OCR animation when entering email phase
    useEffect(() => {
        if (phase !== 'email') return
        const t = setTimeout(() => setOcr(true), 800)
        return () => clearTimeout(t)
    }, [phase])

    // Progressive reveal in validating phase
    useEffect(() => {
        if (phase !== 'validating') return
        if (revealedCount >= VALIDATION_LINES.length) return
        const t = setTimeout(pauseAware(() => setRevealedCount(c => c + 1)), 450)
        return () => clearTimeout(t)
    }, [phase, revealedCount, pauseAware])

    const handleApply = () => {
        setApplied(true)
        setTimeout(pauseAware(() => {
            onApply?.()
            nextStep()
        }), 400)
    }

    const allRevealed = revealedCount >= VALIDATION_LINES.length

    // ── Phase: email ──────────────────────────────────────────────────────────
    if (phase === 'email') {
        return (
            <div className="space-y-4">
                {/* Context banner */}
                <div className="bg-ai/5 border border-ai/20 rounded-xl p-3 flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-foreground">Quote Request · DOE-2847 · NYC Dept. of Education</div>
                        <div className="text-muted-foreground mt-0.5 leading-relaxed">
                            Email received from Miller Knoll designer — SIF file and specification PDF attached. Strata parsed both documents via OCR.
                        </div>
                    </div>
                </div>

                {/* Incoming email */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2 bg-muted/40 border-b border-border">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Incoming · Miller Knoll</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">May 6 · 8:14 AM</span>
                    </div>
                    <div className="p-3.5 space-y-2.5">
                        {[
                            { label: 'From',    value: 'Robert Chen · Miller Knoll Rep' },
                            { label: 'To',      value: 'Lauren DeMarco · BFI Furniture' },
                            { label: 'Subject', value: 'Quote request · DOE-2847 · NYC Dept. of Education' },
                        ].map(f => (
                            <div key={f.label} className="flex items-start gap-3 text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                                <span className="text-muted-foreground w-14 shrink-0 pt-0.5">{f.label}:</span>
                                <span className="text-foreground font-medium">{f.value}</span>
                            </div>
                        ))}

                        {/* Attachments — tabbed inline preview */}
                        <div className="pt-1">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Attachments</div>
                            <div className="border border-border rounded-xl overflow-hidden">
                                {/* Tab bar */}
                                <div className="flex border-b border-border bg-muted/40">
                                    <button
                                        onClick={() => setActiveAttachment('pdf')}
                                        className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold transition-colors border-r border-border flex-1 justify-center ${
                                            activeAttachment === 'pdf' ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                                        specs.pdf
                                    </button>
                                    <button
                                        onClick={() => setActiveAttachment('sif')}
                                        className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold transition-colors flex-1 justify-center ${
                                            activeAttachment === 'sif' ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <FileText className="h-3 w-3 text-ai shrink-0" />
                                        SIF_v1.xlsx
                                        {ocr && (
                                            <span className="text-[9px] bg-ai/10 text-ai border border-ai/20 px-1 py-0.5 rounded-full font-medium animate-in fade-in duration-300">
                                                OCR ✓
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* PDF preview */}
                                {activeAttachment === 'pdf' && (
                                    <div className="p-2.5 bg-zinc-100/60 dark:bg-zinc-900/40 max-h-44 overflow-y-auto scrollbar-micro animate-in fade-in duration-200">
                                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-3 space-y-2">
                                            <div className="text-center text-[9px] font-bold text-zinc-700 dark:text-zinc-300 pb-1.5 border-b border-zinc-200 dark:border-zinc-700 uppercase tracking-wide">
                                                Product Specification · DOE-2847
                                            </div>
                                            <div className="text-[9px] text-zinc-500">NYC Dept. of Education · BFI Furniture · Q-2026-0089</div>
                                            {[
                                                { code: 'HMI-WS-2400', name: 'Locale Open-Plan Workstation', qty: '×24', dims: 'W: 72" H: 29" D: 30"', finish: 'White/Silver' },
                                                { code: 'HMI-LS-500',  name: 'Brody WorkLounge',            qty: '×12', dims: 'W: 32" H: 45" D: 28"', finish: 'Fog fabric'   },
                                                { code: 'HMI-FU-300',  name: 'Lateral Filing Unit 3-Drawer', qty: '×6',  dims: 'W: 36" H: 28" D: 20"', finish: 'Platinum'    },
                                            ].map(p => (
                                                <div key={p.code} className="border-l-2 border-zinc-300 dark:border-zinc-600 pl-2 text-[9px] leading-relaxed">
                                                    <div className="font-bold text-zinc-800 dark:text-zinc-200">{p.code} · {p.name} {p.qty}</div>
                                                    <div className="text-zinc-500">{p.dims} · {p.finish}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SIF preview */}
                                {activeAttachment === 'sif' && (
                                    <div className="max-h-44 overflow-y-auto scrollbar-micro animate-in fade-in duration-200">
                                        <table className="w-full text-[10px]">
                                            <thead className="bg-muted/60 border-b border-border sticky top-0">
                                                <tr>
                                                    <th className="text-left px-3 py-1.5 text-muted-foreground font-bold">Code</th>
                                                    <th className="text-left px-3 py-1.5 text-muted-foreground font-bold">Description</th>
                                                    <th className="text-right px-3 py-1.5 text-muted-foreground font-bold">Qty</th>
                                                    <th className="text-right px-3 py-1.5 text-muted-foreground font-bold">List</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/60">
                                                {[
                                                    { code: 'HMI-WS-2400', desc: 'Locale Workstation',        qty: 24, list: '$10,000' },
                                                    { code: 'HMI-LS-500',  desc: 'Brody WorkLounge',          qty: 12, list: '$7,000'  },
                                                    { code: 'HMI-FU-300',  desc: 'Lateral Filing 3-Drawer',   qty: 6,  list: '$2,100'  },
                                                    { code: 'INSTALL-NYC', desc: 'Installation / Labor',      qty: 1,  list: '—'       },
                                                ].map(r => (
                                                    <tr key={r.code} className="hover:bg-muted/20">
                                                        <td className="px-3 py-2 font-mono text-[9px] text-muted-foreground">{r.code}</td>
                                                        <td className="px-3 py-2 text-foreground font-medium">{r.desc}</td>
                                                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.qty}</td>
                                                        <td className="px-3 py-2 text-right tabular-nums font-bold text-foreground">{r.list}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Footer: meta + download */}
                                <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20">
                                    <span className="text-[9px] text-muted-foreground">
                                        {activeAttachment === 'pdf' ? '12 pages · 4.2 MB' : '4 line items · XLSX · 18 KB'}
                                    </span>
                                    <button
                                        onClick={() => handleDownload(activeAttachment)}
                                        disabled={downloading !== null}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded border border-border text-[10px] font-medium text-muted-foreground hover:bg-muted/30 disabled:opacity-60 transition-colors"
                                    >
                                        {downloading === activeAttachment ? (
                                            <><div className="h-3 w-3 border border-muted-foreground border-t-transparent rounded-full animate-spin shrink-0" /> Downloading…</>
                                        ) : (activeAttachment === 'pdf' ? downloadedPdf : downloadedSif) ? (
                                            <><CheckCircle2 className="h-3 w-3 text-success shrink-0" /> Downloaded</>
                                        ) : (
                                            <><Download className="h-3 w-3 shrink-0" /> Download</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lauren CORE action */}
                {ocr && (
                    <div className="flex items-start gap-2.5 bg-muted/40 border border-border rounded-xl px-3 py-2.5 animate-in fade-in duration-300">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Lauren creates quote <span className="font-medium text-foreground">Q-2026-0089</span> and order <span className="font-medium text-foreground">DOE-2847</span> in CORE · replies to Robert confirming, including the order number in the email subject.
                        </p>
                    </div>
                )}

                {/* Before Strata */}
                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2 text-[10px] text-muted-foreground">
                    Before Strata: Lauren opened each file manually, cross-referenced against OVNIQ — ~45 min per SIF. No system to track the acknowledgement loop.
                </div>

                <button
                    onClick={() => setPhase('validating')}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                >
                    <Sparkles className="h-4 w-4" />
                    Run SIF validation →
                </button>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
            </div>
        )
    }

    // ── Phase: validating ─────────────────────────────────────────────────────
    if (phase === 'validating') {
        return (
            <div className="space-y-4">
                {/* Context banner */}
                <div className="bg-ai/5 border border-ai/20 rounded-xl p-3 flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-foreground">OVNIQ Validation · DOE-2847 · Q-2026-0089</div>
                        <div className="text-muted-foreground mt-0.5">
                            Strata validated the SIF against the CoNY contract via OVNIQ — corrected pricing and returned a corrected SIF. What used to take 65 minutes takes seconds.
                        </div>
                    </div>
                </div>

                {/* Connection bar */}
                <div className="border border-border rounded-xl bg-card px-3.5 py-3">
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Data flow</div>
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="bg-muted/60 border border-border rounded px-2 py-1 font-medium text-foreground">📄 SIF · email adjunto</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-[9px] text-muted-foreground">OCR</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="bg-muted/60 border border-border rounded px-2 py-1 font-medium text-foreground">OVNIQ · Herman Miller</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-[9px] text-muted-foreground">valida</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="bg-muted/60 border border-border rounded px-2 py-1 font-medium text-foreground">CORE · CoNY contract</span>
                    </div>
                </div>

                {/* SIF document preview — collapsible */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <button
                        onClick={() => setSifExpanded(v => !v)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/40 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-ai shrink-0" />
                            <div className="text-left">
                                <div className="text-[10px] font-bold text-foreground">Q-2026-0089 · SIF · Herman Miller</div>
                                <div className="text-[9px] text-muted-foreground">3 line items · 1 issue detected</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-ai/10 text-ai border border-ai/20 px-1.5 py-0.5 rounded-full font-medium">OCR ✓</span>
                            {sifExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                        </div>
                    </button>
                    {sifExpanded && (
                        <div className="border-t border-border px-3.5 py-3 space-y-1.5 animate-in fade-in duration-200">
                            <div className="flex gap-3 pb-2 border-b border-border/60">
                                <span className="text-[10px] text-success font-medium">Valid 2</span>
                                <span className="text-[10px] text-warning font-medium">Issues 1</span>
                                <span className="text-[10px] text-muted-foreground">Total 3</span>
                            </div>
                            {VALIDATION_LINES.map(line => (
                                <div key={line.product} className="flex items-center gap-2 text-[10px]">
                                    <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${line.status === 'ok' ? 'bg-success' : 'bg-warning'}`} />
                                    <span className="text-foreground flex-1">{line.product}</span>
                                    <span className={`tabular-nums ${line.status === 'corrected' ? 'text-warning line-through' : 'text-muted-foreground'}`}>{line.sif}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Validation table */}
                <div className="border border-border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-5 gap-0 bg-muted/40 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <span className="col-span-2">Product</span>
                        <span>SIF</span>
                        <span>OVNIQ</span>
                        <span className="text-right">Conf.</span>
                    </div>
                    {VALIDATION_LINES.slice(0, revealedCount).map((line) => (
                        <div
                            key={line.product}
                            className="border-t border-border animate-in fade-in slide-in-from-left-1 duration-300"
                        >
                            <div className="grid grid-cols-5 gap-0 px-3.5 py-2.5 text-xs items-center">
                                <span className="col-span-2 font-medium text-foreground">{line.product}</span>
                                <span className={`tabular-nums ${line.status === 'corrected' ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                                    {line.sif}
                                </span>
                                <span className={`font-bold tabular-nums ${
                                    line.status === 'ok' ? 'text-success' : 'text-warning'
                                }`}>
                                    {line.status === 'ok'
                                        ? <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {line.contract}</span>
                                        : <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {line.contract}</span>
                                    }
                                </span>
                                <span className={`text-right text-[10px] font-bold tabular-nums ${
                                    line.status === 'ok' ? 'text-success' : 'text-warning'
                                }`}>
                                    {line.conf}
                                </span>
                            </div>

                            {line.status === 'corrected' && (
                                <div className="mx-3.5 mb-3 bg-warning/5 border border-warning/20 rounded-lg px-3 py-2 space-y-1 animate-in fade-in duration-200">
                                    <div className="text-[10px] font-bold text-warning">SIF price $8,100 does not match contract rate</div>
                                    <div className="text-[10px] text-muted-foreground">$7,560 · T-code 18% · list $42,000 · OVNIQ corrected automatically</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Summary — corrected SIF ready */}
                {allRevealed && (
                    <div className="bg-success/5 border border-success/30 rounded-xl p-3 space-y-1.5 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            <span className="text-xs font-bold text-foreground">OVNIQ returned corrected SIF · 1 price adjusted · ready for discount calculation</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground pl-6">
                            Filing Units ×6: $8,100 → $7,560 · T-code 18% applied · corrected SIF uploaded to CORE
                        </div>
                    </div>
                )}

                {allRevealed && (
                    <button
                        onClick={() => setPhase('discount')}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300"
                    >
                        Calculate discount & continue →
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO, SOURCES.OVNIQ] }]} />
            </div>
        )
    }

    // ── Phase: discount ───────────────────────────────────────────────────────
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Context banner */}
            <div className="bg-ai/5 border border-ai/20 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Discount Calculation · DOE-2847</div>
                    <div className="text-muted-foreground mt-0.5">
                        City of NY requires Cost = Sale (no gross profit). Formula: (Sale ÷ List) − 1.
                    </div>
                </div>
            </div>

            {/* Contract type toggle */}
            <div className="border border-border rounded-xl p-3 bg-card space-y-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Contract Type</div>
                <div className="flex gap-2 bg-muted/40 border border-border rounded-lg p-0.5">
                    <button
                        onClick={() => setContractType('city')}
                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                            contractType === 'city'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        ● City of New York
                    </button>
                    <button
                        onClick={() => setContractType('state')}
                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                            contractType === 'state'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        ○ State of New York
                    </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                    Identified from contract number in PO header ·{' '}
                    {contractType === 'city'
                        ? 'CoNY: Cost = Sale (no gross profit)'
                        : 'State NY: different pricing structure applies'}
                </p>
            </div>

            {/* Discount table */}
            <div className="border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 gap-0 bg-muted/40 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="col-span-1">Product</span>
                    <span className="text-right">List</span>
                    <span className="text-right">Sale</span>
                    <span className="text-right">Discount</span>
                </div>
                {contractType === 'city' ? (
                    <>
                        {DISCOUNT_LINES.map((line) => (
                            <div key={line.product} className="grid grid-cols-4 gap-0 px-3.5 py-2.5 text-xs border-t border-border items-start">
                                <span className="font-medium text-foreground text-[11px]">{line.product}</span>
                                <span className="text-right text-muted-foreground tabular-nums text-[11px]">{line.list}</span>
                                <span className="text-right text-muted-foreground tabular-nums text-[11px]">{line.sale}</span>
                                <span className="text-right font-bold text-destructive tabular-nums text-[11px]">{line.pct}</span>
                            </div>
                        ))}
                        <div className="px-3.5 py-2 border-t border-border bg-muted/20">
                            <p className="text-[10px] text-muted-foreground font-mono text-center">
                                Formula: (Sale ÷ List) − 1 = −40.0% · $0 gross profit · City of New York requirement
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="px-3.5 py-6 text-center space-y-1.5 border-t border-border">
                        <p className="text-xs font-semibold text-foreground">State of New York — different pricing structure</p>
                        <p className="text-[11px] text-muted-foreground">
                            State NY contracts use list-based pricing with agency-specific rates.<br />
                            Strata identifies the applicable rate from the contract number in the PO header.
                        </p>
                        <p className="text-[10px] text-ai mt-2">← Select City of New York to see this order's calculation</p>
                    </div>
                )}
            </div>

            {/* Agency fee summary */}
            {contractType === 'city' && (
            <div className="flex items-start gap-2.5 bg-success/5 border border-success/30 rounded-xl px-3 py-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    OVNIQ applied T-code 18% · Expected agency fee:{' '}
                    <span className="font-bold text-foreground">$41,040</span>{' '}
                    across 2 product lines · Order entered as third-party invoice · Herman Miller as vendor
                </p>
            </div>
            )}

            {/* Labor coordination panel */}
            <div className="border border-border rounded-xl bg-muted/30 p-3 space-y-1.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Labor Coordination · Workplace (Wick) — In Progress</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Michael Boyle reviewing labor quote: inside delivery · installation · OT differentials · truck charge · Carpenters.
                    Template loaded in CORE · Michael entering numbers.
                </p>
            </div>

            <button
                onClick={handleApply}
                disabled={applied}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
            >
                Apply discount &amp; continue
                <ChevronRight className="h-4 w-4" />
            </button>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO, SOURCES.OVNIQ] }]} />
        </div>
    )
}
