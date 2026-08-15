/**
 * COMPONENT: F5_p52_AckOcrScene (Projex · p5.2)
 * PURPOSE: ACK PDFs return drip-drip por vendor. AcknowledgementUploadModal OCR.
 *          Per-vendor confidence · Teknion 98% · HBF 91% · Alamir 74% review.
 *          FC9 fix · confidence scored antes de committing effort.
 *
 * SHAPE · per-vendor ACK arrival queue with confidence badges (F5 second)
 * REUSE · shared/AcknowledgementUploadModal · expert-hub/ocr/OcrDocCard
 * NOTIF · dispatchea `projex:acks-received` on complete
 */

import { useEffect, useState } from 'react'
import {
    FileText, CheckCircle2, Loader2, AlertTriangle, ArrowRight, Mail,
    Sparkles, Clock,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { VENDOR_ACK_CONF } from '../../../config/profiles/projex-data/teknionAck'

export default function F5_p52_AckOcrScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()

    // Drip-drip arrival · 1 vendor every ~1000ms
    const [arrivedIdx, setArrivedIdx] = useState(0)
    const [done, setDone] = useState(false)

    useEffect(() => {
        if (arrivedIdx < VENDOR_ACK_CONF.length) {
            const cancel = pauseAwareTimeout(() => setArrivedIdx(n => n + 1), 800)
            return cancel
        }
        if (!done) {
            const cancel = pauseAwareTimeout(() => {
                setDone(true)
                window.dispatchEvent(new CustomEvent('projex:acks-received'))
            }, 500)
            return cancel
        }
    }, [arrivedIdx, done, pauseAwareTimeout])

    const arrivedVendors = VENDOR_ACK_CONF.slice(0, arrivedIdx)
    const avgConf = arrivedVendors.length > 0
        ? Math.round(arrivedVendors.reduce((s, v) => s + v.conf, 0) / arrivedVendors.length)
        : 0

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.TEKNION_ONLINE, PROJEX_SOURCES.VENDOR_PORTAL_HBF] },
        { sources: [PROJEX_SOURCES.STRATA_OCR_PJX] },
        { sources: [PROJEX_SOURCES.NETSUITE_PO] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F5</span>
                    <span>Electronic ordering &amp; ACK · step 2</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                        <Sparkles className="h-3 w-3" aria-hidden="true" /> Auto · OCR per vendor
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    ACK received · per-vendor OCR confidence (FC9 fix)
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    ACKs return drip-drip · confidence scored per vendor antes de committing effort. Alamir review-recommended con 74%.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-ai-light flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-ai" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{arrivedVendors.filter(v => v.ackReceived).length}/{VENDOR_ACK_CONF.length}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">ACKs received</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-success" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{avgConf}%</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Avg OCR confidence</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{arrivedVendors.filter(v => v.band === 'review-recommended').length}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Review recommended</div>
                    </div>
                </div>
            </div>

            {/* Per-vendor ACK queue */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        ACK arrival queue · drip-drip por vendor
                    </span>
                    {done ? (
                        <span className="ml-auto text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                            All received
                        </span>
                    ) : (
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-ai">
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                            Monitoring
                        </span>
                    )}
                </div>
                <div className="divide-y divide-border">
                    {VENDOR_ACK_CONF.map((v, i) => {
                        const isArrived = i < arrivedIdx
                        return (
                            <div
                                key={v.vendorCode}
                                className={`
                                    grid grid-cols-[36px_1fr_100px_120px_100px] px-4 py-3 items-center transition-opacity duration-500
                                    ${isArrived ? 'opacity-100 animate-in fade-in slide-in-from-left-1' : 'opacity-40'}
                                `}
                            >
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-muted-foreground">{v.vendorCode}</span>
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm text-foreground font-semibold">{v.vendorName}</div>
                                    <div className="text-[10px] text-muted-foreground">
                                        {v.ackReceivedAt ? `ACK received ${new Date(v.ackReceivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Awaiting ACK…'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    {isArrived && v.ackReceived && (
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold tabular-nums rounded px-1.5 py-0.5 ${
                                            v.band === 'excellent' ? 'bg-success/10 text-success' :
                                            v.band === 'good' ? 'bg-ai-light text-ai' :
                                            'bg-warning/10 text-warning'
                                        }`}>
                                            {v.conf}%
                                        </span>
                                    )}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {isArrived && v.ackReceived && (
                                        <span className={
                                            v.band === 'excellent' ? 'text-success' :
                                            v.band === 'good' ? 'text-ai' :
                                            'text-warning'
                                        }>{v.band}</span>
                                    )}
                                </div>
                                <div className="text-right">
                                    {isArrived && v.ackReceived ? (
                                        <CheckCircle2 className="h-4 w-4 text-success inline" aria-hidden="true" />
                                    ) : isArrived ? (
                                        <Clock className="h-4 w-4 text-muted-foreground inline" aria-hidden="true" />
                                    ) : (
                                        <Loader2 className="h-4 w-4 text-ai animate-spin inline" aria-hidden="true" />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {done && (
                <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <span className="text-foreground font-semibold">4 ACKs received · 2 pending</span>
                        <span className="text-muted-foreground"> · Teknion ACK ready for comparison · Alamir needs review antes de commit (conf 74%).</span>
                    </div>
                    <button
                        onClick={nextStep}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        Open PMO comparison
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            )}

            <DataSourcesBar groups={dataGroups} label="ACK OCR · per-vendor confidence · FC9 fix" />
        </div>
    )
}
