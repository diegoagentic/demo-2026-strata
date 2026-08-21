/**
 * COMPONENT: F5_p56_ShipmentTrackingScene (Projex · p5.6)
 * PURPOSE: OrderTrackerScene grid daily · sweeps 20 PMO lines · Shipment
 *          Notification (SN) inbound events · TrackingModal per shipment.
 *          Daily "Daily Report — From POs_Projex Inc." saved-search style.
 *
 * SHAPE · shipment tracking grid + SN events (F5 closing)
 * REUSE · bfi/OrderTrackerScene · shared/TrackingModal · strata-ds Tracking atom
 */

import { useState } from 'react'
import {
    Truck, Package, CheckCircle2, Loader2, Clock, ArrowRight,
    RotateCcw, Search, Wrench,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { NCBA_SHIPMENTS, type ShipmentSN } from '../../../config/profiles/projex-data/teknionAck'

const STATUS_META: Record<ShipmentSN['status'], { label: string; cls: string; icon: React.ElementType }> = {
    'in-production':      { label: 'In production',      cls: 'bg-ai-light text-ai',                icon: Loader2 },
    'shipping-scheduled': { label: 'Shipping scheduled', cls: 'bg-warning/10 text-warning',         icon: Clock },
    'shipped':            { label: 'Shipped',            cls: 'bg-success/10 text-success',         icon: Truck },
    'delivered':          { label: 'Delivered',          cls: 'bg-success/20 text-success',         icon: CheckCircle2 },
}

export default function F5_p56_ShipmentTrackingScene() {
    const { goToStep, steps } = useDemo()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedShipment, setSelectedShipment] = useState<ShipmentSN | null>(null)

    const filteredShipments = NCBA_SHIPMENTS.filter(s =>
        !searchQuery ||
        s.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.vendorCode.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const restart = () => {
        const first = steps.findIndex(s => s.id === 'p5.1')
        if (first >= 0) goToStep(first)
    }

    const statusCounts = {
        'in-production':      NCBA_SHIPMENTS.filter(s => s.status === 'in-production').length,
        'shipping-scheduled': NCBA_SHIPMENTS.filter(s => s.status === 'shipping-scheduled').length,
        'shipped':            NCBA_SHIPMENTS.filter(s => s.status === 'shipped').length,
        'delivered':          NCBA_SHIPMENTS.filter(s => s.status === 'delivered').length,
    }
    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
            <h1 className="text-2xl font-bold text-foreground">
                    Daily ESD sweep + shipment tracking · Shipment Notifications
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    OrderTrackerScene daily · "Daily Report — From POs_Projex Inc." saved-search style · Multi-Line-Edit bulk refresh.
                </p>
            </div>

            {/* F83.A · Status hero removed · counts pueden vivir en el filter
                 bar debajo · match prod que no tiene KPI heroes standalone. */}

            {/* Search + Multi-Line Edit callout */}
            <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search SN # · PO # · vendor…"
                        className="w-full pl-9 pr-3 py-1.5 text-[11px] bg-background border border-input rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:text-muted-foreground"
                    />
                </div>
                <button className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-primary/15 hover:bg-primary/25 text-foreground rounded-lg px-2.5 py-1.5 transition-colors">
                    <Wrench className="h-3 w-3" aria-hidden="true" />
                    Multi-Line Edit tool · bulk refresh
                </button>
                <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
                    Daily sweep · 08:00 AM · next Tue Aug 19
                </span>
            </div>

            {/* Shipment grid */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        NCBA shipments · daily saved-search style
                    </span>
                </div>
                <div className="divide-y divide-border">
                    <div className="grid grid-cols-[100px_100px_60px_50px_110px_140px_140px] px-4 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span>SN #</span>
                        <span>PO #</span>
                        <span>Vendor</span>
                        <span className="text-right">Lines</span>
                        <span>ESD</span>
                        <span>Status</span>
                        <span>Tracking</span>
                    </div>
                    {filteredShipments.map(sn => {
                        const meta = STATUS_META[sn.status]
                        const isSelected = selectedShipment?.id === sn.id
                        return (
                            <button
                                key={sn.id}
                                onClick={() => setSelectedShipment(isSelected ? null : sn)}
                                className={`
                                    w-full text-left grid grid-cols-[100px_100px_60px_50px_110px_140px_140px] px-4 py-2 items-center text-xs transition-colors
                                    ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'}
                                `}
                            >
                                <span className="text-foreground font-mono truncate">{sn.id}</span>
                                <span className="text-foreground font-mono truncate">{sn.poNumber}</span>
                                <span className="text-[10px] font-bold text-muted-foreground">{sn.vendorCode}</span>
                                <span className="text-right text-foreground tabular-nums">{sn.lineCount}</span>
                                <span className="text-foreground tabular-nums">{sn.esd}</span>
                                <span>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${meta.cls}`}>
                                        {meta.label}
                                    </span>
                                </span>
                                <span className="text-[11px] text-muted-foreground font-mono truncate">
                                    {sn.trackingNumber ?? '—'}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Selected shipment detail */}
            {selectedShipment && (
                <div className="rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3 flex items-start gap-3 animate-in fade-in duration-300">
                    <Truck className="h-5 w-5 text-foreground shrink-0 mt-1" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <div className="text-foreground font-semibold">{selectedShipment.id} · {selectedShipment.poNumber}</div>
                        <div className="text-muted-foreground mt-1">
                            {selectedShipment.vendorCode} · {selectedShipment.lineCount} lines · ESD {selectedShipment.esd}
                            {selectedShipment.carrier && ` · via ${selectedShipment.carrier}`}
                            {selectedShipment.trackingNumber && ` · tracking ${selectedShipment.trackingNumber}`}
                        </div>
                    </div>
                </div>
            )}

            {/* Wrap · restart or advance */}
            <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-sm">
                    <span className="text-foreground font-semibold">F5 electronic ordering &amp; ACK complete</span>
                    <span className="text-muted-foreground"> · NCBA sentinel clear · designer chain assembled · 6 shipments tracked. Coordinator closes the MWH cycle · monitor deliveries.</span>
                </div>
                <button
                    onClick={restart}
                    className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    Replay F5
                </button>
                <span className="text-[10px] text-muted-foreground">or explore other flows via sidebar →</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            </div>

        </div>
    )
}
