/**
 * COMPONENT: POLaborScene  (a1.2c)
 * PURPOSE: Agency Fee step 2c — Lauren reviews the Purchase Order from NYC DoE
 *          and the Workplace labor quote, confirms the 30-day delivery window,
 *          then enters in CORE and triggers EDI to OVNIQ.
 *
 * Transcript: "Lauren saves PO to R drive, labor quote arrives by email to Michael,
 *              EDI transmits from CORE to OVNIQ automatically."
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { FileText, Download, Eye, CheckCircle2, AlertTriangle, Sparkles, ChevronRight, ArrowRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import ReceivingProcessBar from './ReceivingProcessBar'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface POLaborSceneProps {
    onConfirm?: () => void
}

type ScenePhase = 'review' | 'confirmed'

const PO_ITEMS = [
    { label: 'Workstations', qty: '×24', price: '$144,000' },
    { label: 'Lounge Seating', qty: '×12', price: '$84,000' },
    { label: 'Filing Units', qty: '×6', price: '$7,560' },
]

const LABOR_ITEMS = [
    'Inside Delivery',
    'Installation',
    'OT Differential',
    'Truck Charge',
]

function DocCard({
    icon,
    title,
    subtitle,
    meta,
    children,
    badge,
}: {
    icon: React.ReactNode
    title: string
    subtitle: string
    meta: string
    children?: React.ReactNode
    badge?: React.ReactNode
}) {
    const [previewOpen, setPreviewOpen] = useState(false)
    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border bg-muted/40">
                {icon}
                <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-foreground">{title}</div>
                    <div className="text-[10px] text-muted-foreground">{subtitle}</div>
                </div>
                {badge}
            </div>
            <div className="p-3 space-y-2">
                <div className="text-[10px] text-muted-foreground">{meta}</div>
                {children}
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={() => setPreviewOpen(v => !v)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-[10px] font-semibold text-muted-foreground hover:bg-muted/30 transition-colors"
                    >
                        <Eye className="h-3 w-3" />
                        {previewOpen ? 'Close' : 'Preview'}
                    </button>
                    <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-[10px] font-semibold text-muted-foreground hover:bg-muted/30 transition-colors">
                        <Download className="h-3 w-3" />
                        Download
                    </button>
                </div>
                {previewOpen && (
                    <div className="mt-2 bg-muted/30 border border-border/60 rounded-lg px-3 py-2 animate-in fade-in duration-200">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Document preview</div>
                        {children && <div className="text-[10px] text-muted-foreground space-y-0.5">{children}</div>}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function POLaborScene({ onConfirm }: POLaborSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [phase, setPhase] = useState<ScenePhase>('review')
    const [dateConfirmed, setDateConfirmed] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [ediLines, setEdiLines] = useState(0)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleConfirm = () => {
        setSubmitting(true)
        // Animate EDI lines progressively
        const lines = ['CORE ──EDI──▶ OVNIQ', '✓ Order Q-2026-0089 entered', '✓ Customer acceptance form created in OVNIQ']
        lines.forEach((_, i) => {
            setTimeout(pauseAware(() => setEdiLines(i + 1)), 400 + i * 500)
        })
        setTimeout(pauseAware(() => {
            setSubmitting(false)
            setPhase('confirmed')
            setTimeout(pauseAware(() => onConfirm?.()), 1000)
        }), 400 + lines.length * 500 + 400)
    }

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

    return (
        <div className="space-y-4">
            {/* AI banner */}
            <div className="bg-ai/5 border border-ai/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0" />
                <div className="text-xs">
                    <span className="font-bold text-foreground">2 documents received</span>
                    <span className="text-muted-foreground"> · ready for CORE entry · Q-2026-0089 · DOE-2847</span>
                </div>
            </div>

            {/* PO Card */}
            <DocCard
                icon={<FileText className="h-4 w-4 text-blue-500 shrink-0" />}
                title="Purchase Order · NYC Dept. of Education"
                subtitle="PO-2026-DOE-0089 · May 6, 2026 · $235,560"
                meta="Strata captured digitally — no R-drive save required"
            >
                <div className="divide-y divide-border/50 text-[10px]">
                    {PO_ITEMS.map(item => (
                        <div key={item.label} className="flex justify-between py-1">
                            <span className="text-foreground">{item.label} {item.qty}</span>
                            <span className="font-semibold text-foreground">{item.price}</span>
                        </div>
                    ))}
                </div>
            </DocCard>

            {/* Labor Quote Card */}
            <DocCard
                icon={<FileText className="h-4 w-4 text-violet-500 shrink-0" />}
                title="Labor Quote · Workplace / WIG"
                subtitle="Vendor Order #17706 · Compiled by Michael Boyle"
                meta="Received digitally — no manual email compile needed"
            >
                <div className="flex flex-wrap gap-1 text-[10px]">
                    {LABOR_ITEMS.map(item => (
                        <span key={item} className="bg-muted/60 border border-border rounded px-1.5 py-0.5 text-muted-foreground">{item}</span>
                    ))}
                </div>
            </DocCard>

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
                            type="text"
                            defaultValue="May 14, 2026"
                            readOnly
                            className="w-full text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground"
                        />
                    </div>
                    {!dateConfirmed ? (
                        <button
                            onClick={() => setDateConfirmed(true)}
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
                    <span className="font-medium text-foreground">Before Strata:</span> Lauren saved the PO manually to the R drive (local server — VPN required). The labor quote arrived by email to Michael, who compiled figures by hand and entered them in CORE. Lauren tracked progress in a monthly Excel report.
                </p>
            </div>

            {/* EDI animation while submitting */}
            {submitting && (
                <div className="bg-ai/5 border border-ai/20 rounded-xl px-3.5 py-3 space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="h-3.5 w-3.5 border-2 border-ai border-t-transparent rounded-full animate-spin shrink-0" />
                        <span className="font-bold text-foreground">Submitting to CORE…</span>
                    </div>
                    {Array.from({ length: ediLines }, (_, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground animate-in fade-in duration-300">
                            {i === 0
                                ? <><ArrowRight className="h-3 w-3 text-ai shrink-0" /><span className="font-mono text-ai">{['CORE ──EDI──▶ OVNIQ'][i] ?? ''}</span></>
                                : <><CheckCircle2 className="h-3 w-3 text-success shrink-0" /><span>{['✓ Order Q-2026-0089 entered', '✓ Customer acceptance form created in OVNIQ'][i - 1]}</span></>
                            }
                        </div>
                    ))}
                </div>
            )}

            {/* CTA */}
            {!submitting && (
                <button
                    onClick={handleConfirm}
                    disabled={!dateConfirmed}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
                >
                    Confirm in CORE &amp; transmit via EDI
                    <ChevronRight className="h-4 w-4" />
                </button>
            )}

            {!dateConfirmed && !submitting && (
                <p className="text-[11px] text-muted-foreground text-center">Confirm delivery date above to proceed</p>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO, SOURCES.OVNIQ] }]} />
        </div>
    )
}
