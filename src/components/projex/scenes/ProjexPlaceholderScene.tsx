/**
 * COMPONENT: ProjexPlaceholderScene
 * PURPOSE: F74 Phase 0 · placeholder scene renderer for each of the 5 Projex
 *          flows. Muestra hero + flow badge + descripción + roadmap de scenes
 *          que van a llegar en Phase 1-5.
 *
 *          Se reemplaza scene-por-scene en cada Phase (1 = AP · 2 = Order/PO ·
 *          3 = ACK · 4 = Billing · 5 = Vendor onboarding).
 *
 * DS TOKENS: bg-background · bg-card · text-foreground · text-muted-foreground
 *            · border-border · bg-primary · text-primary-foreground · text-ai
 *
 * SOURCE: scratchpad/projex-notion/_SOT_projex.md (§5 Capability paths)
 */

import { Sparkles, Mail, ShieldCheck, TrendingUp, PackagePlus, Truck, ChevronRight } from 'lucide-react'

type Scene = 'ap' | 'vendor-onboarding' | 'billing' | 'order-po' | 'ack'

interface SceneMeta {
    flowName: string
    flowLetter: string
    icon: React.ElementType
    subtitle: string
    painPoints: string[]
    owner: string
    ownerNote: string
    phaseWhen: string
    metrics: { label: string; value: string }[]
    roadmap: string[]
}

const SCENES: Record<Scene, SceneMeta> = {
    'ap': {
        flowName: 'AP intake & matching',
        flowLetter: 'F1',
        icon: Mail,
        subtitle: 'Vendor bills arrive in the AP inbox · Strata reads them · exact-to-the-penny match against the PO · exceptions rise to the top.',
        painPoints: ['AP1 · 100% manual entry', 'AP2 · partial-invoice match on 100+ line POs', 'AP9 · install-vendor bills without PO #'],
        owner: 'Accounting · Senior Accountant',
        ownerNote: 'Days he spends only on AP · today. Compliance backs up. 2-person Accounting.',
        phaseWhen: 'Phase 1 (next)',
        metrics: [
            { label: 'Bills/mo (all entities)', value: '~224' },
            { label: 'Q4 peak', value: '287' },
            { label: 'Mismatch rate', value: '5-10%' },
            { label: 'Vendors actively paid (12mo)', value: '389' },
        ],
        roadmap: [
            'Morning queue · 12/14 auto-posted overnight',
            'Email intake · Teknion 291-line PO OCR',
            'Line-by-line reconcile · partial ship + variance',
            'Install-vendor exception (no PO #) · AP follow-up tracking',
            'CEO · payment-release approval gate',
            'Posted to NetSuite · audit trail',
        ],
    },
    'vendor-onboarding': {
        flowName: 'Vendor onboarding & compliance',
        flowLetter: 'F2',
        icon: ShieldCheck,
        subtitle: 'Structured intake replaces the free-text email · W-9 OCR · compliance registry with date-indexed alerts · dealer readiness self-service.',
        painPoints: ['VS1 · 733 migrated vendor records', 'VS2 · W-9s undated in SharePoint', 'VS3 · payment run blocked ≈ weekly'],
        owner: 'Coordinator (Coord) → Accounting → Compliance (sign-off)',
        ownerNote: 'Every other payment run today blocks porque vendor no fully set up. Weekly recurring cost.',
        phaseWhen: 'Phase 5',
        metrics: [
            { label: 'Migrated vendor records', value: '733' },
            { label: 'Actively paid (12mo)', value: '389' },
            { label: 'W-9 freshness standard', value: '12 mo' },
            { label: 'Payment run blockers/mo', value: '~4' },
        ],
        roadmap: [
            'Coordinator requests new vendor · structured form',
            'W-9 upload + OCR + preflight (date · 1099 · ACH · W-8 BEN-E)',
            'Compliance compliance sign-off gate',
            'Vendor master · registry entry',
            'Dealer Experience · readiness self-service',
        ],
    },
    'billing': {
        flowName: 'Progress billing & collections',
        flowLetter: 'F3',
        icon: TrendingUp,
        subtitle: 'Milestone alerts fire when the project crosses its billing threshold · shared follow-up queue replaces personal Outlook tasks · AR aging board resurrects the dead tracker.',
        painPoints: ['FC11 · progress invoices fire on judgment', 'FC12 · follow-ups in personal Outlook', 'WC9 · Walls PM-review sin exit criteria', 'AR3 · shared AR tracker dead'],
        owner: 'Coordinator (Furniture) · Walls Director (Walls)',
        ownerNote: 'Coordinators own client invoicing end-to-end. Compliance no valida cada invoice · sí tax-rate and direct-bill Teknion.',
        phaseWhen: 'Phase 4',
        metrics: [
            { label: 'Furniture billing', value: '50/40/10' },
            { label: 'Walls billing', value: '60/30/10' },
            { label: 'Terms', value: 'Net 10 + 1.5%/mo' },
            { label: 'Dashboard cadence', value: 'Tue + Thu' },
        ],
        roadmap: [
            'Milestone threshold alert (50/40/10 · 60/30/10)',
            'Coordinator reviews proforma draft',
            'Walls PM-review gate (WC9)',
            'AR aging board · dead-tracker replacement',
            'AI-drafted collection emails · shared queue',
            'Customer Invoice posted + NetSuite sync',
        ],
    },
    'order-po': {
        flowName: 'Order entry & PO dispatch',
        flowLetter: 'F4',
        icon: PackagePlus,
        subtitle: 'PIF workbook parsed to NetSuite draft order lines · batch PO generation across multiple vendors with draft emails ready for coordinator review (never auto-send).',
        painPoints: ['FC6 · multi-vendor PO issuance = per-vendor loop', 'WC2 · Walls jobs typed line-by-line from PIF'],
        owner: 'Coordinator (Coord)',
        ownerNote: 'MWH project sample · 300 lines · 26 shipping-and-handling manual lines · 26 vendor POs. Cada PO cuesta 5-7 min hoy.',
        phaseWhen: 'Phase 2',
        metrics: [
            { label: 'MWH POs (single project)', value: '26' },
            { label: 'MWH product lines', value: '300+' },
            { label: 'S&H manual lines', value: '26' },
            { label: 'Furniture vendor list', value: '~200' },
        ],
        roadmap: [
            'Designer emails PIF + SIF · intake',
            'PIF-to-Order parse (Walls line-by-line)',
            'SIF import + surcharge/S&H/design-fee manual lines',
            'Batch PO drafts (multi-vendor · 26-PO MWH pattern)',
            'Draft emails per vendor · review before send',
            'Coordinator release · NetSuite POs sent',
        ],
    },
    'ack': {
        flowName: 'Electronic ordering & ACK processing',
        flowLetter: 'F5',
        icon: Truck,
        subtitle: '~70% of the volume is Teknion direct-bill via Teknion Online (SIF upload) · ACK PDF returns · Strata OCR + comparison against NetSuite PMO · designer chain auto-assembled.',
        painPoints: ['FC8 · designer acknowledgement chain (net-new)', 'FC9 · vendor ACKs unstructured PDFs · OCR conf per-vendor'],
        owner: 'Coordinator → Lead Designer / Spec Designer / PM Coordinator (designers)',
        ownerNote: 'Path 5 = client-directed · NO among 12 confirmed-High. OCR confidence per-vendor must score before commit. Teknion CR taxonomy real.',
        phaseWhen: 'Phase 3',
        metrics: [
            { label: 'Teknion product volume', value: '~70%' },
            { label: 'Projects with at least 1 Teknion PO', value: '~80%' },
            { label: 'NetSuite ack-date sentinel', value: '10/10/2050' },
            { label: 'CR types en scope', value: 'leadtime · BIFMA · width · price' },
        ],
        roadmap: [
            'PO placed · Teknion Online SIF upload (~70%)',
            'ACK received · OCR (per-vendor confidence)',
            'ACK vs PMO comparison · 71 lines + CRs',
            'Clear 10/10/2050 sentinel · update PMO line',
            'Designer-chain assembly · running chart',
            'Daily ESD sweep + shipment tracking',
        ],
    },
}

export default function ProjexPlaceholderScene({ scene }: { scene: Scene }) {
    const meta = SCENES[scene]
    const Icon = meta.icon

    return (
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
            {/* Hero card */}
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                    <div className="shrink-0 h-12 w-12 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                            {/* V1 fix · bg-primary/15 text-foreground (was bg-primary/10 text-primary · 1.8:1 contrast fail LAW 2) */}
                            <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">{meta.flowLetter}</span>
                            <span>Projex · Flow demo</span>
                            <span className="text-muted-foreground/60">·</span>
                            {/* V2 fix · bg-ai-light container wraps text-ai (was bare text-ai · fails WCAG AA) */}
                            <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                                <Sparkles className="h-3 w-3" aria-hidden="true" /> Phase 0 · placeholder
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">{meta.flowName}</h1>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{meta.subtitle}</p>
                    </div>
                </div>
            </div>

            {/* Pain points + owner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-2">Pain points targeted</div>
                    <ul className="space-y-1.5">
                        {meta.painPoints.map((pp) => (
                            <li key={pp} className="text-sm text-foreground flex gap-2 items-start">
                                {/* V3 fix · heroicon en vez de unicode ▸ (Rule 05) · text-muted-foreground en vez de text-primary (LAW 2 · 1.8:1 contrast fail) */}
                                <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                                <span>{pp}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-2">Primary owner</div>
                    <div className="text-sm font-semibold text-foreground">{meta.owner}</div>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{meta.ownerNote}</p>
                </div>
            </div>

            {/* Metrics baseline */}
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-3">Baseline metrics (SOT §11)</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {meta.metrics.map((m) => (
                        <div key={m.label} className="rounded-lg bg-muted/40 border border-border/60 p-3">
                            <div className="text-lg font-semibold text-foreground tabular-nums">{m.value}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{m.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Roadmap · scenes que llegan en la Phase correspondiente */}
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-0.5">Interactive scenes · roadmap</div>
                        <h2 className="text-sm font-semibold text-foreground">6 scenes shipping in {meta.phaseWhen}</h2>
                    </div>
                    {/* V4 fix · text-foreground bg-primary/20 (was text-primary bg-primary/10 · same violation as V1) */}
                    <div className="text-[10px] uppercase tracking-wider font-mono text-foreground font-semibold bg-primary/20 rounded-full px-2 py-1">
                        placeholder
                    </div>
                </div>
                <ol className="space-y-1.5">
                    {meta.roadmap.map((r, i) => (
                        <li key={r} className="text-sm text-foreground/90 flex gap-3">
                            <span className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-background border border-border text-[10px] font-mono text-muted-foreground tabular-nums">
                                {i + 1}
                            </span>
                            <span>{r}</span>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Footer note */}
            <p className="text-xs text-muted-foreground text-center pt-2">
                Source of truth · <span className="font-mono">scratchpad/projex-notion/_SOT_projex.md</span> · 1029 líneas · 19 secciones · fidelity alta · Projex-real vocabulary
            </p>
        </div>
    )
}
