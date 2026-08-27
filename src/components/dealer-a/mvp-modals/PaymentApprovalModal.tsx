/**
 * F84 · PaymentApprovalModal · used by F1 p1.3.
 *
 * Compliance approves the Tuesday ACH batch. Prod shape references:
 * expert-hub ComparisonReviewModal header (icon + short title + status pill
 * · muted meta strip · body scroll · footer with 3 primary actions Accept /
 * Review / Reject · same pattern applied here).
 *
 * Zero decoration · zero KPI heros · zero warning banners. Modal overlay
 * positioning follows F83.S (z-[400] + md:pl-[336px]).
 */

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    Wallet, CheckCircle2, ShieldAlert, AlertTriangle, X, Loader2,
    MessageSquare, XCircle, Send, Check, RotateCcw, ChevronDown, ChevronRight,
    ArrowRight, Eye,
} from 'lucide-react'
// F86.21 · Diego 2026-08-27 · bill preview reuses the lifted iframe PDF
// preview (SOURCE: expert-hub/PdfPreviewModal). F86.21.3 · swapped from
// DocumentReviewModal (OCR fields modal) after live review · the Approver
// wants the raw invoice PDF as-scanned, not the extracted-fields view.
import PdfPreviewModal from '../../../vendor/prod-imports/deps/comparison/PdfPreviewModal'

interface PaymentApprovalModalProps {
    isOpen: boolean
    onClose: () => void
    onApproved?: () => void
}

// F86.22 · Diego 2026-08-27 · warning taxonomy · replaces the boolean
// `duplicate?: boolean` with a discriminated union so the batch can carry
// heterogeneous warnings (currently duplicate + rate-mismatch · easy to
// extend). Every warning carries the metadata needed to render its
// popover, badge, and suggested override text via warningCopy() below.
type WarningType = 'duplicate' | 'rate-mismatch'
type WarningInfo =
    | { type: 'duplicate' }
    | { type: 'rate-mismatch'; poAmount: number }

interface PaymentRow {
    id: string
    vendor: string
    entity: 'Dealer A' | 'Dealer A Corp.' | 'Culture LLC'
    invoiceNumber: string
    amount: number
    /** F86.6 · Diego 2026-08-21 · CEO ask · surface Order GP ($ + %) so the
        Approver reviewing this batch has margin context per bill, not just
        the payable amount. Values reflect the underlying order's gross
        profit dollars and percentage. */
    orderGpAmount: number
    orderGpPct: number
    /** F86.22 · Diego 2026-08-27 · when set, this bill is flagged for the
        Approver and cannot ship until resolved via the header warning chip
        popover. Held / override-cleared / sent-back tracked per-bill in
        `warningResolutions`. */
    warning?: WarningInfo
}

// F86.11 · Diego 2026-08-21 · CEO ask · realistic vendor volume so the
// vendor-grouped view has meaning · one big vendor (Teknion · 8 bills)
// balances a couple of small ones · this is the shape the Approver
// actually reviews (batch of ~26 across 6 vendors).
const BATCH: PaymentRow[] = [
    // Teknion · biggest vendor · 8 bills
    { id: 'PJX-BILL-8483', vendor: 'Teknion',            entity: 'Dealer A',      invoiceNumber: 'TEK-2026-0847',   amount: 24429.06, orderGpAmount:  5133, orderGpPct: 21 },
    { id: 'PJX-BILL-8476', vendor: 'Teknion',            entity: 'Dealer A Corp.', invoiceNumber: 'TEK-2026-0851',   amount: 18240.55, orderGpAmount:  3648, orderGpPct: 20 },
    { id: 'PJX-BILL-8484', vendor: 'Teknion',            entity: 'Dealer A',      invoiceNumber: 'TEK-2026-0858',   amount:  8420.00, orderGpAmount:  1852, orderGpPct: 22 },
    { id: 'PJX-BILL-8485', vendor: 'Teknion',            entity: 'Dealer A',      invoiceNumber: 'TEK-2026-0862',   amount:  6180.20, orderGpAmount:  1298, orderGpPct: 21 },
    { id: 'PJX-BILL-8486', vendor: 'Teknion',            entity: 'Dealer A Corp.', invoiceNumber: 'TEK-2026-0871',   amount:  4720.00, orderGpAmount:   991, orderGpPct: 21 },
    { id: 'PJX-BILL-8487', vendor: 'Teknion',            entity: 'Dealer A',      invoiceNumber: 'TEK-2026-0874',   amount:  3255.00, orderGpAmount:   683, orderGpPct: 21 },
    { id: 'PJX-BILL-8488', vendor: 'Teknion',            entity: 'Dealer A',      invoiceNumber: 'TEK-2026-0879',   amount:  2115.80, orderGpAmount:   445, orderGpPct: 21 },
    { id: 'PJX-BILL-8489', vendor: 'Teknion',            entity: 'Culture LLC',   invoiceNumber: 'TEK-2026-0883',   amount:  1240.00, orderGpAmount:   260, orderGpPct: 21 },
    // HBF · 5 bills
    { id: 'PJX-BILL-8472', vendor: 'HBF',                entity: 'Dealer A',      invoiceNumber: 'HBF-24911',       amount: 12420.00, orderGpAmount:  3105, orderGpPct: 25 },
    // F86.22 · rate-mismatch warning · $2,140 invoice vs $2,000 acknowledged
    // PO · $140 (7%) over · freight-surcharge override story.
    { id: 'PJX-BILL-8477', vendor: 'HBF',                entity: 'Dealer A',      invoiceNumber: 'HBF-24915',       amount:  2140.00, orderGpAmount:   535, orderGpPct: 25, warning: { type: 'rate-mismatch', poAmount: 2000 } },
    { id: 'PJX-BILL-8490', vendor: 'HBF',                entity: 'Dealer A Corp.', invoiceNumber: 'HBF-24920',       amount:  5620.00, orderGpAmount:  1405, orderGpPct: 25 },
    { id: 'PJX-BILL-8491', vendor: 'HBF',                entity: 'Dealer A',      invoiceNumber: 'HBF-24924',       amount:  3180.00, orderGpAmount:   795, orderGpPct: 25 },
    { id: 'PJX-BILL-8492', vendor: 'HBF',                entity: 'Dealer A',      invoiceNumber: 'HBF-24927',       amount:  1240.00, orderGpAmount:   310, orderGpPct: 25 },
    // Nelson and Company · 4 bills
    { id: 'PJX-BILL-8475', vendor: 'Nelson and Company', entity: 'Dealer A',      invoiceNumber: 'NLC-99120',       amount:  6720.00, orderGpAmount:  1546, orderGpPct: 23 },
    { id: 'PJX-BILL-8493', vendor: 'Nelson and Company', entity: 'Dealer A',      invoiceNumber: 'NLC-99138',       amount:  4210.50, orderGpAmount:   968, orderGpPct: 23 },
    { id: 'PJX-BILL-8494', vendor: 'Nelson and Company', entity: 'Dealer A Corp.', invoiceNumber: 'NLC-99145',       amount:  2840.00, orderGpAmount:   653, orderGpPct: 23 },
    { id: 'PJX-BILL-8495', vendor: 'Nelson and Company', entity: 'Dealer A',      invoiceNumber: 'NLC-99152',       amount:  1620.00, orderGpAmount:   373, orderGpPct: 23 },
    // Boss Design · 3 bills
    { id: 'PJX-BILL-8473', vendor: 'Boss Design',        entity: 'Dealer A',      invoiceNumber: 'BDG-00-1928',     amount:  3855.40, orderGpAmount:   848, orderGpPct: 22 },
    { id: 'PJX-BILL-8496', vendor: 'Boss Design',        entity: 'Dealer A',      invoiceNumber: 'BDG-00-1935',     amount:  2140.00, orderGpAmount:   471, orderGpPct: 22 },
    { id: 'PJX-BILL-8497', vendor: 'Boss Design',        entity: 'Dealer A Corp.', invoiceNumber: 'BDG-00-1942',     amount:  1280.00, orderGpAmount:   282, orderGpPct: 22 },
    // Alamir · 4 bills
    { id: 'PJX-BILL-8474', vendor: 'Alamir',             entity: 'Dealer A Corp.', invoiceNumber: 'AL-2026-08-0033', amount:   892.00, orderGpAmount:   214, orderGpPct: 24 },
    { id: 'PJX-BILL-8480', vendor: 'Alamir',             entity: 'Culture LLC',   invoiceNumber: 'AL-2026-08-0041', amount:   445.00, orderGpAmount:   107, orderGpPct: 24 },
    { id: 'PJX-BILL-8498', vendor: 'Alamir',             entity: 'Dealer A',      invoiceNumber: 'AL-2026-08-0048', amount:  1620.00, orderGpAmount:   389, orderGpPct: 24 },
    { id: 'PJX-BILL-8500', vendor: 'Alamir',             entity: 'Dealer A',      invoiceNumber: 'AL-2026-08-0055', amount:   980.00, orderGpAmount:   235, orderGpPct: 24 },
    // West Elm Contract · 2 bills
    { id: 'PJX-BILL-8501', vendor: 'West Elm Contract',  entity: 'Dealer A',      invoiceNumber: 'WEC-2026-0311',   amount:  4820.00, orderGpAmount:  1013, orderGpPct: 21 },
    { id: 'PJX-BILL-8502', vendor: 'West Elm Contract',  entity: 'Dealer A',      invoiceNumber: 'WEC-2026-0318',   amount:  2140.00, orderGpAmount:   449, orderGpPct: 21 },
    // Duplicate held · Nelson NLC-99120 · triggers the Compliance advisory
    // F86.22 · migrated from boolean `duplicate: true` to the new warning
    // shape · same behavior · headline/detail/prefill sourced from warningCopy.
    { id: 'PJX-DUP-8499',  vendor: 'Nelson and Company', entity: 'Dealer A',      invoiceNumber: 'NLC-99120',       amount:  6720.00, orderGpAmount:  1546, orderGpPct: 23, warning: { type: 'duplicate' } },
]

type Stage =
    | 'idle'
    | 'approving' | 'approved'
    | 'rejecting' | 'rejected'

// F86.22 · Diego 2026-08-27 · per-warning copy · one source of truth
// for headline · detail · badge label · suggested override prefill.
// Add a new warning type here + extend WarningInfo above · everything
// downstream (chip label, popover, badge, prefill) picks it up.
interface WarningCopy {
    headline: string
    detail: string
    badge: string
    suggestedOverride: string
}
function fmtUsd(n: number) {
    return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function warningCopy(row: PaymentRow): WarningCopy | null {
    if (!row.warning) return null
    switch (row.warning.type) {
        case 'duplicate':
            return {
                headline: 'Duplicate held',
                detail: `Matches a remittance already sent on 2026-07-08 · same amount (${fmtUsd(row.amount)}), same invoice number, same vendor.`,
                badge: 'Duplicate',
                suggestedOverride: `Reissued invoice · original ${row.invoiceNumber} was voided on Aug 20 · vendor confirmed the re-invoice against the same PO.`,
            }
        case 'rate-mismatch': {
            const delta = row.amount - row.warning.poAmount
            const pct = row.warning.poAmount > 0 ? Math.round((delta / row.warning.poAmount) * 100) : 0
            return {
                headline: 'Amount above PO',
                detail: `Invoice ${fmtUsd(row.amount)} · PO acknowledged ${fmtUsd(row.warning.poAmount)} · ${fmtUsd(delta)} (${pct}%) over.`,
                badge: 'Rate mismatch',
                suggestedOverride: `Vendor confirmed the ${fmtUsd(delta)} delta as freight surcharge · matches PO change order approved Aug 22 · release as invoiced.`,
            }
        }
    }
}

// F84.36 · per-row decision · Compliance can approve/reject each bill
// individually before releasing the batch. Duplicates stay `held` and
// cannot flip. Default `pending` for the rest.
type RowDecision = 'pending' | 'approved' | 'rejected' | 'held'

export default function PaymentApprovalModal({ isOpen, onClose, onApproved }: PaymentApprovalModalProps) {
    const [stage, setStage] = useState<Stage>('idle')
    const [rejectReason, setRejectReason] = useState('')
    const [rowDecisions, setRowDecisions] = useState<Record<string, RowDecision>>(() =>
        Object.fromEntries(BATCH.map(b => [b.id, b.warning ? 'held' as const : 'pending' as const])),
    )
    // F86.11 · Diego 2026-08-21 · CEO ask · group bills by vendor with
    // expand-to-detail so 100+ bills per vendor stay reviewable.
    // F86.23 · Diego 2026-08-27 · seed the featured first vendor (see
    // vendorGroups sort pin below) as expanded so the audience immediately
    // sees the collapsible/expandable pattern with both child rows on
    // screen · no need to click first to understand the interaction.
    const [expandedVendors, setExpandedVendors] = useState<Set<string>>(() => new Set(['West Elm Contract']))
    const toggleVendor = (vendor: string) => {
        setExpandedVendors(prev => {
            const next = new Set(prev)
            if (next.has(vendor)) next.delete(vendor)
            else next.add(vendor)
            return next
        })
    }

    // F86.12 · Diego 2026-08-21 · warning spotlight + bulk guardrail.
    // F86.13 · Diego 2026-08-21 · resolution moved to a per-bill row popover
    // triggered by a warning chip in the header. The top blocker card is gone.
    // F86.22 · Diego 2026-08-27 · single-value duplicateResolution replaced
    // with a per-billId map so the batch can carry N heterogeneous warnings
    // and each resolves independently. `resolutionFor(billId)` reads with
    // a `'held'` default. Same for override reasons — one draft per bill.
    type Resolution = 'held' | 'approved-override' | 'sent-back'
    const [warningResolutions, setWarningResolutions] = useState<Record<string, Resolution>>({})
    const [overrideReasons, setOverrideReasons] = useState<Record<string, string>>({})
    const resolutionFor = (billId: string): Resolution => warningResolutions[billId] ?? 'held'
    const setResolutionFor = (billId: string, r: Resolution) =>
        setWarningResolutions(prev => ({ ...prev, [billId]: r }))
    const setOverrideReasonFor = (billId: string, text: string) =>
        setOverrideReasons(prev => ({ ...prev, [billId]: text }))
    const overrideReasonFor = (billId: string | null): string =>
        (billId && overrideReasons[billId]) || ''
    // F86.13 · which bill's warning popover is open. Only one at a time.
    const [activeWarningBillId, setActiveWarningBillId] = useState<string | null>(null)
    // F86.13 · when multi-warning · which list dropdown is open on the chip
    const [showWarningsList, setShowWarningsList] = useState(false)
    // F86.15 · pre-flight confirmation before release · lists what's ready,
    // what's pending, what's held. Click Continue on the footer to open.
    const [showPreflight, setShowPreflight] = useState(false)
    // F86.21 · which bill (if any) is being previewed as PDF · null = closed.
    const [previewBill, setPreviewBill] = useState<PaymentRow | null>(null)
    // F86.19 · which vendor groups are expanded in the preflight · seeded to
    // just the first vendor on each modal open so the Approver lands on
    // detail-visible-by-default without a scroll-wall.
    const [expandedPreflight, setExpandedPreflight] = useState<Set<string>>(new Set())
    const togglePreflightVendor = (vendor: string) => {
        setExpandedPreflight(prev => {
            const next = new Set(prev)
            if (next.has(vendor)) next.delete(vendor)
            else next.add(vendor)
            return next
        })
    }
    // Per-vendor comments · scoped to the vendor record for audit trail
    // (F86.12 · replaces the old batch-level Leave comment button).
    const [vendorComments, setVendorComments] = useState<Record<string, string>>({})
    const [commentingVendor, setCommentingVendor] = useState<string | null>(null)
    const [commentDraft, setCommentDraft] = useState('')
    // Refs per vendor row · lets the warning chip scroll to the vendor.
    const vendorRefs = useRef<Record<string, HTMLDivElement | null>>({})
    // F86.13 · refs per bill row · anchors the row-anchored warning popover.
    const billRowRefs = useRef<Record<string, HTMLDivElement | null>>({})

    // F86.13 · warnings array · supports N held / flagged bills. Currently
    // only the duplicate contributes · structure lets us add rate-mismatch,
    // CFO-held etc. later without another rewrite.
    // F86.22 · Diego 2026-08-27 · Warning type carries per-warning copy so
    // headline/detail/badge/suggestedOverride all live in one place
    // (warningCopy() at module top). `warnings` is the UNRESOLVED subset ·
    // used to drive the chip label, dropdown list, popover, and the "next"
    // auto-advance. `allWarnings` is the full list (resolved + unresolved)
    // used by the dropdown to keep resolved entries visible.
    type Warning = {
        billId: string
        vendor: string
        invoiceNumber: string
        type: WarningType
        headline: string
        detail: string
        badge: string
        suggestedOverride: string
    }
    const allWarnings: Warning[] = useMemo(() => {
        return BATCH.filter(b => b.warning).map(b => {
            const copy = warningCopy(b)!
            return {
                billId: b.id,
                vendor: b.vendor,
                invoiceNumber: b.invoiceNumber,
                type: b.warning!.type,
                headline: copy.headline,
                detail: copy.detail,
                badge: copy.badge,
                suggestedOverride: copy.suggestedOverride,
            }
        })
    }, [])
    const warnings: Warning[] = useMemo(
        () => allWarnings.filter(w => resolutionFor(w.billId) === 'held'),
        [allWarnings, warningResolutions],
    )
    const warningsByBill = useMemo(() => {
        const map: Record<string, Warning> = {}
        for (const w of allWarnings) map[w.billId] = w
        return map
    }, [allWarnings])
    const warningCount = allWarnings.length
    const heldWarningsCount = warnings.length
    const resolvedWarningsCount = warningCount - heldWarningsCount

    const releasable = BATCH.filter(b => !b.warning)

    // F86.11 · Vendor-level aggregation · sorted by total amount desc so
    // the biggest payments read first (that's where the risk lives).
    type VendorGroup = {
        vendor: string
        bills: PaymentRow[]
        billsCount: number
        amountTotal: number
        gpTotal: number
        gpPct: number
        heldCount: number
        approvedCount: number
        rejectedCount: number
        pendingCount: number
    }
    const vendorGroups: VendorGroup[] = useMemo(() => {
        const map = new Map<string, PaymentRow[]>()
        for (const row of BATCH) {
            const list = map.get(row.vendor) ?? []
            list.push(row)
            map.set(row.vendor, list)
        }
        const groups: VendorGroup[] = []
        for (const [vendor, bills] of map) {
            let amountTotal = 0, gpTotal = 0, heldCount = 0, approvedCount = 0, rejectedCount = 0, pendingCount = 0
            for (const b of bills) {
                amountTotal += b.amount
                gpTotal += b.orderGpAmount
                // F86.22 · heldCount is now "warning bills still held"
                // (not "any warning bill") so the vendor pill clears once
                // its warning is resolved (override / send-back).
                if (b.warning) {
                    if (resolutionFor(b.id) === 'held') heldCount += 1
                } else {
                    const d = rowDecisions[b.id]
                    if (d === 'approved') approvedCount += 1
                    else if (d === 'rejected') rejectedCount += 1
                    else pendingCount += 1
                }
            }
            groups.push({
                vendor,
                bills,
                billsCount: bills.length,
                amountTotal,
                gpTotal,
                gpPct: amountTotal > 0 ? Math.round((gpTotal / amountTotal) * 100) : 0,
                heldCount, approvedCount, rejectedCount, pendingCount,
            })
        }
        // F86.23 · Diego 2026-08-27 · pin the 2-bill vendor (West Elm
        // Contract) to the top for pedagogy · lets the audience see the
        // collapsible/expandable pattern with a small child list without
        // scrolling. The rest keep the amount-desc order so the risk
        // reads first as usual.
        groups.sort((a, b) => {
            if (a.vendor === 'West Elm Contract') return -1
            if (b.vendor === 'West Elm Contract') return 1
            return b.amountTotal - a.amountTotal
        })
        return groups
    }, [rowDecisions, warningResolutions])
    const counts = useMemo(() => {
        let approved = 0, rejected = 0, pending = 0, approvedTotal = 0
        for (const row of releasable) {
            const d = rowDecisions[row.id]
            if (d === 'approved') { approved += 1; approvedTotal += row.amount }
            else if (d === 'rejected') { rejected += 1 }
            else { pending += 1 }
        }
        return { approved, rejected, pending, approvedTotal }
    }, [rowDecisions, releasable])
    const totalReleasable = releasable.reduce((s, b) => s + b.amount, 0)
    // F86.16 · Diego 2026-08-27 · removed the old "impliedApprove" shortcut
    // that auto-released pending bills when the Approver hadn't touched
    // anything. Real ACH releases require explicit sign-off · per-row or
    // per-vendor Approve-all. Nothing ships silently.
    // F86.20 · Diego 2026-08-27 · override-cleared warnings ARE approved
    // for release · fold them into the release totals so they show up in the
    // preflight and count toward the wire. F86.22 · per-warning · a bill's
    // override is cleared iff its own resolution === 'approved-override'.
    const overrideBills = useMemo(
        () => BATCH.filter(b => b.warning && resolutionFor(b.id) === 'approved-override'),
        [warningResolutions],
    )
    const sentBackBills = useMemo(
        () => BATCH.filter(b => b.warning && resolutionFor(b.id) === 'sent-back'),
        [warningResolutions],
    )
    const overrideTotal = overrideBills.reduce((s, b) => s + b.amount, 0)
    const releaseCount = counts.approved + overrideBills.length
    const releaseTotal = counts.approvedTotal + overrideTotal
    const canRelease = releaseCount > 0

    // F86.15 · preflight summary · only explicitly approved bills go into the
    // release. Held stays outside. Pending is surfaced as an unreviewed count
    // so the Approver sees exactly what they skipped.
    // F86.18 · Diego 2026-08-27 · include the actual bill list per vendor so
    // the Approver can see line-item detail (invoice number + amount) before
    // confirming the wire · not just a vendor rollup.
    const preflightBreakdown = useMemo(() => {
        // F86.20 · include override-cleared duplicates in the release list.
        const willRelease = [
            ...releasable.filter(r => rowDecisions[r.id] === 'approved'),
            ...overrideBills,
        ]
        const byVendor = new Map<string, { vendor: string; count: number; total: number; bills: PaymentRow[] }>()
        for (const r of willRelease) {
            const cur = byVendor.get(r.vendor) ?? { vendor: r.vendor, count: 0, total: 0, bills: [] }
            cur.count += 1
            cur.total += r.amount
            cur.bills.push(r)
            byVendor.set(r.vendor, cur)
        }
        const vendors = [...byVendor.values()].sort((a, b) => b.total - a.total)
        const heldBills = BATCH.filter(b => b.warning && resolutionFor(b.id) === 'held')
        const pendingCount = releasable.filter(r => rowDecisions[r.id] === 'pending').length
        const pendingTotal = releasable
            .filter(r => rowDecisions[r.id] === 'pending')
            .reduce((s, r) => s + r.amount, 0)
        return { vendors, heldBills, pendingCount, pendingTotal }
    }, [releasable, rowDecisions, warningResolutions, overrideBills])

    // F86.19 · seed the first vendor as expanded whenever the preflight opens
    // fresh · lets the Approver see line-item detail without needing to click.
    // Uses functional set to avoid clobbering a mid-session manual expansion.
    useEffect(() => {
        if (!showPreflight) return
        const first = preflightBreakdown.vendors[0]?.vendor
        if (!first) return
        setExpandedPreflight(new Set([first]))
    }, [showPreflight])

    const setDecision = (id: string, decision: RowDecision) => {
        if (stage !== 'idle') return
        setRowDecisions(prev => {
            if (prev[id] === 'held') return prev
            return { ...prev, [id]: prev[id] === decision ? 'pending' : decision }
        })
    }

    // F86.11 · Diego 2026-08-21 · vendor-level bulk actions · flip every
    // non-held bill for a vendor to the same decision in one click.
    const setVendorDecision = (vendor: string, decision: RowDecision) => {
        if (stage !== 'idle') return
        setRowDecisions(prev => {
            const next = { ...prev }
            for (const b of BATCH) {
                if (b.vendor === vendor && !b.warning) next[b.id] = decision
            }
            return next
        })
    }

    // F86.12 · Diego 2026-08-21 · scroll + expand a vendor group so the
    // Approver can see the held bill they need to resolve.
    const spotlightVendor = (vendor: string) => {
        setExpandedVendors(prev => {
            const next = new Set(prev)
            next.add(vendor)
            return next
        })
        requestAnimationFrame(() => {
            const el = vendorRefs.current[vendor]
            if (el && typeof el.scrollIntoView === 'function') {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        })
    }

    // F86.13 · open the row-anchored warning popover on a specific bill.
    // Guardrail · closes any batch-level escalation composer first (one
    // composer at a time). Also auto-expands + scrolls to the row.
    const openWarningPopover = (billId: string) => {
        if (stage === 'rejecting') {
            setStage('idle')
            setRejectReason('')
        }
        setShowWarningsList(false)
        const bill = BATCH.find(b => b.id === billId)
        if (!bill) return
        setExpandedVendors(prev => {
            const next = new Set(prev)
            next.add(bill.vendor)
            return next
        })
        setActiveWarningBillId(billId)
        requestAnimationFrame(() => {
            const el = billRowRefs.current[billId] ?? vendorRefs.current[bill.vendor]
            if (el && typeof el.scrollIntoView === 'function') {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        })
    }
    const closeWarningPopover = () => {
        setActiveWarningBillId(null)
    }

    // F86.22 · after a warning is resolved · auto-advance to the next
    // unresolved warning (Nielsen 7 · efficient N>1 navigation). If none
    // left, close the popover. Used by both override-confirm and send-back.
    const advanceOrClose = (justResolvedBillId: string) => {
        const next = allWarnings.find(w =>
            w.billId !== justResolvedBillId && resolutionFor(w.billId) === 'held',
        )
        if (next) {
            openWarningPopover(next.billId)
        } else {
            setActiveWarningBillId(null)
        }
    }

    // F86.22 · per-bill override + send-back · handlers take an explicit
    // billId so they work with N warnings. Prior single-value state model
    // (setDuplicateResolution) is gone.
    const handleOverrideConfirm = (billId: string) => {
        const text = (overrideReasons[billId] ?? '').trim()
        if (!text) return
        setResolutionFor(billId, 'approved-override')
        advanceOrClose(billId)
    }
    const handleSendWarningBack = (billId: string) => {
        // F86.17 · sending a held warning back escalates ONLY that item to
        // Compliance · it does NOT terminate the batch. F86.22 · now per-bill.
        setResolutionFor(billId, 'sent-back')
        advanceOrClose(billId)
    }
    const handleSaveVendorComment = () => {
        if (!commentingVendor || !commentDraft.trim()) return
        setVendorComments(prev => ({ ...prev, [commentingVendor]: commentDraft.trim() }))
        setCommentingVendor(null)
        setCommentDraft('')
    }

    const handleApprove = () => {
        if (stage !== 'idle' || !canRelease) return
        setStage('approving')
        setTimeout(() => {
            setStage('approved')
            onApproved?.()
        }, 1200)
    }

    const handleConfirmReject = () => {
        if (!rejectReason.trim()) return
        setStage('rejected')
    }

    const statusPill = () => {
        if (stage === 'approved') return { cls: 'bg-success/15 text-success', icon: <CheckCircle2 className="h-3 w-3" aria-hidden="true" />, label: 'Released' }
        if (stage === 'rejected') return { cls: 'bg-destructive/15 text-destructive', icon: <XCircle className="h-3 w-3" aria-hidden="true" />, label: 'Rejected · returned to Compliance' }
        return { cls: 'bg-primary/15 text-foreground', icon: <ShieldAlert className="h-3 w-3" aria-hidden="true" />, label: 'Pending Approver review' }
    }
    const pill = statusPill()

    return (
        <>
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[400]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-y-0 right-0 left-0 md:left-[320px] bg-foreground/50 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>
                <div className="fixed inset-0 flex items-start justify-center p-4 sm:p-8 md:pl-[336px] overflow-y-auto">
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <DialogPanel className="w-full max-w-6xl my-auto bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]">
                            {/* Header · prod ComparisonReviewModal shape */}
                            <div className="p-5 border-b border-border">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Wallet className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                                        <h2 className="text-base font-bold text-foreground">Tue payment run · release ACH batch</h2>
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${pill.cls}`}>
                                            {pill.icon}
                                            {pill.label}
                                        </span>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        aria-label="Close payment run"
                                        className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                                    >
                                        <X className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                    <span>Bills tab · Tue 08:15 AM</span>
                                    <span>·</span>
                                    <span>{releasable.length} bills</span>
                                    <span>·</span>
                                    <span className="tabular-nums text-foreground font-semibold">${totalReleasable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    {/* F86.13 · warning chip · single click when N=1, dropdown list when N>1 */}
                                    {warnings.length > 0 && (
                                        <>
                                            <span>·</span>
                                            <div className="relative">
                                                {/* F86.14 · Diego 2026-08-21 · chip uses brand primary
                                                    per Strata DS · bg-primary + text-primary-foreground
                                                    (LAW-compliant pairing) so the trigger reads as a
                                                    first-class CTA. Warning tone stays via the icon
                                                    color and the popover contents. Hover pattern is
                                                    the DS-standard opacity shift. */}
                                                {/* F86.22 · chip label carries N>1 progress · Nielsen 1
                                                    (system status). When at least one warning has been
                                                    resolved, chip switches from "N HELD" to
                                                    "{resolved} OF {total} RESOLVED · {held} LEFT" so
                                                    the Approver sees they're making progress. */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (warningCount === 1) {
                                                            openWarningPopover(warnings[0].billId)
                                                        } else {
                                                            setShowWarningsList(s => !s)
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground bg-primary hover:opacity-90 rounded-full px-3 py-1 shadow-sm transition-opacity"
                                                    title={warningCount === 1 ? 'Jump to the flagged bill · resolve to release' : 'Show all warnings'}
                                                    aria-label={resolvedWarningsCount > 0
                                                        ? `${resolvedWarningsCount} of ${warningCount} warnings resolved · ${heldWarningsCount} left`
                                                        : `${heldWarningsCount} warning${heldWarningsCount === 1 ? '' : 's'} held · resolve`}
                                                    aria-expanded={warningCount > 1 ? showWarningsList : undefined}
                                                    aria-haspopup={warningCount > 1 ? 'menu' : undefined}
                                                >
                                                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                                    {resolvedWarningsCount > 0
                                                        ? <>{resolvedWarningsCount} of {warningCount} resolved · {heldWarningsCount} left</>
                                                        : <>{heldWarningsCount} warning{heldWarningsCount === 1 ? '' : 's'} held</>}
                                                    {warningCount === 1
                                                        ? <ArrowRight className="h-3 w-3" aria-hidden="true" />
                                                        : <ChevronDown className={`h-3 w-3 transition-transform ${showWarningsList ? 'rotate-180' : ''}`} aria-hidden="true" />}
                                                </button>
                                                {warningCount > 1 && showWarningsList && (
                                                    <>
                                                        <div className="fixed inset-0 z-[419]" onClick={() => setShowWarningsList(false)} aria-hidden="true" />
                                                        <div
                                                            role="menu"
                                                            className="absolute left-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-[420] p-1"
                                                        >
                                                            <div className="px-3 py-2 border-b border-border mb-1 flex items-center justify-between">
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Warnings this batch</p>
                                                                <p className="text-[10px] tabular-nums text-muted-foreground">
                                                                    <span className="text-foreground font-bold">{resolvedWarningsCount}</span> / {warningCount} resolved
                                                                </p>
                                                            </div>
                                                            {/* F86.22 · iterate ALL warnings (not just held) so the
                                                                Approver can review what they did. Resolved entries
                                                                get a check icon + muted styling · held entries get
                                                                the warning icon + full color. Clicking any entry
                                                                still opens its row popover. */}
                                                            {allWarnings.map(w => {
                                                                const r = resolutionFor(w.billId)
                                                                const isResolved = r !== 'held'
                                                                const icon = r === 'approved-override'
                                                                    ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                                                                    : r === 'sent-back'
                                                                        ? <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                                                                        : <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                                                                const status = r === 'approved-override'
                                                                    ? 'cleared'
                                                                    : r === 'sent-back'
                                                                        ? 'escalated'
                                                                        : 'held'
                                                                return (
                                                                    <button
                                                                        key={w.billId}
                                                                        role="menuitem"
                                                                        type="button"
                                                                        onClick={() => openWarningPopover(w.billId)}
                                                                        className={`w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-muted rounded-lg transition-colors ${isResolved ? 'opacity-70' : ''}`}
                                                                    >
                                                                        {icon}
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-xs font-semibold text-foreground truncate">{w.vendor}</div>
                                                                            <div className="text-[10px] text-muted-foreground font-mono">
                                                                                {w.invoiceNumber} · <span className="uppercase tracking-wider">{w.badge}</span> · <span className="italic">{status}</span>
                                                                            </div>
                                                                        </div>
                                                                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 mt-1" aria-hidden="true" />
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {(counts.approved > 0 || counts.rejected > 0) && (
                                        <>
                                            <span>·</span>
                                            {counts.approved > 0 && (
                                                <span className="tabular-nums text-success inline-flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                    {counts.approved} approved
                                                </span>
                                            )}
                                            {counts.rejected > 0 && (
                                                <span className="tabular-nums text-destructive inline-flex items-center gap-1 ml-1">
                                                    <XCircle className="h-3 w-3" aria-hidden="true" />
                                                    {counts.rejected} rejected
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* F86.11 · Body · vendor-grouped queue · one row per vendor
                                with expand-to-detail · CEO ask · flat 300-bill list didn't
                                scale · vendors are the natural chunk. Minimalist aesthetic ·
                                ultra-thin dividers · muted status pastels · monospace meta ·
                                generous whitespace · Strata DS tokens throughout. */}
                            <div className="flex-1 overflow-y-auto">

                                {/* F86.13 · Top blocker card removed · resolution moved to a
                                    row-anchored popover triggered by the header warning chip.
                                    See openWarningPopover() + the popover render below the body. */}

                                {/* F86.22 · one card per cleared override · with N warnings
                                    the batch may carry multiple approved overrides · each
                                    reads back with its own reason for the audit trail. */}
                                {overrideBills.length > 0 && (
                                    <div className="mx-6 mt-5 mb-2 space-y-2">
                                        {overrideBills.map(b => {
                                            const copy = warningCopy(b)
                                            return (
                                                <div key={b.id} className="border border-success/40 bg-success/5 rounded-xl px-5 py-3 flex items-start gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                                                    <div className="flex-1 min-w-0 text-xs">
                                                        <div className="text-foreground font-semibold">{copy?.badge ?? 'Warning'} override approved</div>
                                                        <div className="text-muted-foreground italic line-clamp-2 mt-0.5">&ldquo;{overrideReasons[b.id]}&rdquo;</div>
                                                        <div className="text-muted-foreground mt-0.5">{b.vendor} · {b.invoiceNumber} · release cleared for this batch.</div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Column header · 8 columns · same grid as vendor + bill rows */}
                                <div className="grid grid-cols-[28px_1fr_140px_140px_140px_150px_140px] px-6 py-3 bg-muted/40 border-b border-border text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sticky top-0 z-10">
                                    <span></span>
                                    <span>Vendor / Bill</span>
                                    <span className="text-right">Bills</span>
                                    <span className="text-right">Amount</span>
                                    <span className="text-right">Order GP</span>
                                    <span className="text-right">Status</span>
                                    <span className="text-right">Actions</span>
                                </div>

                                <div className="divide-y divide-border">
                                    {vendorGroups.map(g => {
                                        const isExpanded = expandedVendors.has(g.vendor)
                                        const vendorLocked = stage !== 'idle'
                                        const releasableBills = g.billsCount - g.heldCount
                                        // F86.12 · vendor is blocked from bulk-approve when it
                                        // carries a held bill that hasn't been resolved yet.
                                        // F86.22 · heldCount already gates on per-bill resolution
                                        // (see vendorGroups memo) · vendor bulk-approve is blocked
                                        // iff at least one held warning remains in the vendor.
                                        const vendorHasBlocker = g.heldCount > 0
                                        // Rollup status pill · consolidated view of the vendor
                                        const rolledStatus = (() => {
                                            if (vendorHasBlocker)
                                                return { cls: 'bg-warning/15 text-warning', label: 'Held · needs decision' }
                                            if (g.approvedCount === releasableBills && releasableBills > 0)
                                                return { cls: 'bg-success/10 text-success', label: 'All approved' }
                                            if (g.rejectedCount === releasableBills && releasableBills > 0)
                                                return { cls: 'bg-destructive/10 text-destructive', label: 'All rejected' }
                                            if (g.approvedCount > 0 || g.rejectedCount > 0)
                                                return { cls: 'bg-info/10 text-info', label: `${g.approvedCount} ok · ${g.rejectedCount} no` }
                                            return { cls: 'bg-muted text-muted-foreground', label: 'Pending' }
                                        })()
                                        return (
                                            <div
                                                key={g.vendor}
                                                ref={(el) => { vendorRefs.current[g.vendor] = el }}
                                            >
                                                {/* Vendor summary row · click to expand */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleVendor(g.vendor)}
                                                    className={`w-full grid grid-cols-[28px_1fr_140px_140px_140px_150px_140px] px-6 py-4 text-sm items-center text-left transition-colors ${isExpanded ? 'bg-muted/30' : 'hover:bg-muted/20'}`}
                                                    aria-expanded={isExpanded}
                                                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${g.vendor} bills`}
                                                >
                                                    <span className="text-muted-foreground">
                                                        {isExpanded ? <ChevronDown className="h-4 w-4" aria-hidden="true" /> : <ChevronRight className="h-4 w-4" aria-hidden="true" />}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <div className="text-foreground font-semibold truncate">{g.vendor}</div>
                                                        <div className="text-[11px] text-muted-foreground mt-0.5">
                                                            {g.billsCount} bill{g.billsCount === 1 ? '' : 's'}
                                                            {g.heldCount > 0 && <span className="text-warning"> · {g.heldCount} held</span>}
                                                        </div>
                                                    </div>
                                                    <span className="text-right text-muted-foreground tabular-nums">{g.billsCount}</span>
                                                    <span className="text-right text-foreground tabular-nums font-semibold">
                                                        ${g.amountTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-right tabular-nums">
                                                        <span className="text-foreground font-semibold">${g.gpTotal.toLocaleString()}</span>
                                                        <span className="text-[11px] text-muted-foreground ml-1">{g.gpPct}%</span>
                                                    </span>
                                                    <span className="text-right">
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${rolledStatus.cls}`}>
                                                            {rolledStatus.label}
                                                        </span>
                                                    </span>
                                                    <div
                                                        className="flex items-center gap-1 justify-end"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {/* F86.13 · bulk approve blocked when the vendor has a
                                                            held bill · click opens the row popover on the offending
                                                            bill so the Approver resolves it inline. */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (vendorHasBlocker) {
                                                                    const held = g.bills.find(b => b.warning && resolutionFor(b.id) === 'held')
                                                                    if (held) openWarningPopover(held.id)
                                                                    return
                                                                }
                                                                setVendorDecision(g.vendor, 'approved')
                                                            }}
                                                            disabled={vendorLocked || releasableBills === 0 || vendorHasBlocker}
                                                            title={vendorHasBlocker ? 'Resolve the held bill first · click to open' : 'Approve all bills for this vendor'}
                                                            aria-label={`Approve all bills for ${g.vendor}`}
                                                            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-success bg-background hover:bg-success/10 border border-success/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setVendorDecision(g.vendor, 'rejected')}
                                                            disabled={vendorLocked || releasableBills === 0}
                                                            title="Reject all bills for this vendor"
                                                            aria-label={`Reject all bills for ${g.vendor}`}
                                                            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-destructive bg-background hover:bg-destructive/10 border border-destructive/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setVendorDecision(g.vendor, 'pending')}
                                                            disabled={vendorLocked || (g.approvedCount + g.rejectedCount) === 0}
                                                            title="Reset all bills for this vendor to pending"
                                                            aria-label={`Reset ${g.vendor} to pending`}
                                                            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground bg-background hover:text-foreground hover:bg-muted border border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            <RotateCcw className="h-3 w-3" aria-hidden="true" />
                                                        </button>
                                                        {/* F86.12 · per-vendor comment · scoped note that
                                                            attaches to this vendor's row for the release audit. */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setCommentingVendor(g.vendor)
                                                                setCommentDraft(vendorComments[g.vendor] ?? '')
                                                                setExpandedVendors(prev => new Set(prev).add(g.vendor))
                                                            }}
                                                            disabled={vendorLocked}
                                                            title={vendorComments[g.vendor] ? 'Edit comment' : 'Leave a comment on this vendor'}
                                                            aria-label={`Leave comment on ${g.vendor}`}
                                                            className={`inline-flex items-center justify-center h-7 w-7 rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                                                vendorComments[g.vendor]
                                                                    ? 'text-info bg-info/10 border-info/40'
                                                                    : 'text-muted-foreground bg-background hover:text-foreground hover:bg-muted border-border'
                                                            }`}
                                                        >
                                                            <MessageSquare className="h-3 w-3" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </button>

                                                {/* F86.12 · per-vendor comment composer + saved chip */}
                                                {isExpanded && commentingVendor === g.vendor && (
                                                    <div className="px-6 py-3 border-t border-border bg-info/5 space-y-2">
                                                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Comment on {g.vendor}</div>
                                                        <textarea
                                                            value={commentDraft}
                                                            onChange={(e) => setCommentDraft(e.target.value)}
                                                            rows={2}
                                                            placeholder={`e.g. Confirmed volume discount schedule with ${g.vendor} · reviewer OK · release.`}
                                                            className="w-full text-xs bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-info/40 placeholder:text-muted-foreground"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            {/* F86.16 · Diego 2026-08-27 · promoted to a bordered secondary
                                                                so it reads as an actual button, not a text link. */}
                                                            <button
                                                                type="button"
                                                                onClick={() => { setCommentingVendor(null); setCommentDraft('') }}
                                                                className="inline-flex items-center text-xs font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-lg px-3 py-1.5 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleSaveVendorComment}
                                                                disabled={!commentDraft.trim()}
                                                                className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold bg-info text-white rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                                            >
                                                                Save comment
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {isExpanded && commentingVendor !== g.vendor && vendorComments[g.vendor] && (
                                                    <div className="px-6 py-2 border-t border-border bg-info/5 flex items-start gap-2 text-[11px] text-muted-foreground">
                                                        <MessageSquare className="h-3 w-3 text-info shrink-0 mt-0.5" aria-hidden="true" />
                                                        <div className="flex-1 min-w-0 italic line-clamp-2">&ldquo;{vendorComments[g.vendor]}&rdquo;</div>
                                                    </div>
                                                )}

                                                {/* Detail rows · indented per-bill · only when expanded */}
                                                {isExpanded && g.bills.map(row => {
                                                    const decision = rowDecisions[row.id]
                                                    // F86.22 · warning presence (not just 'duplicate') drives
                                                    // the row's warning tint, stripe, and locked-decision state.
                                                    const rowTint = row.warning
                                                        ? 'bg-warning/[0.06]'
                                                        : decision === 'approved'
                                                            ? 'bg-success/[0.04]'
                                                            : decision === 'rejected'
                                                                ? 'bg-destructive/[0.04]'
                                                                : 'bg-background'
                                                    const rowLocked = stage !== 'idle' || !!row.warning
                                                    const rowStripe = row.warning ? 'border-l-4 border-l-warning' : 'border-l-4 border-l-transparent'
                                                    return (
                                                        <div
                                                            key={row.id}
                                                            ref={(el) => { billRowRefs.current[row.id] = el }}
                                                            className={`relative grid grid-cols-[28px_1fr_140px_140px_140px_150px_140px] px-6 py-2.5 text-xs items-center border-t border-border/60 ${rowTint} ${rowStripe}`}
                                                        >
                                                            <span></span>
                                                            {/* F86.21.3 · Diego 2026-08-27 · reverted the invoice-
                                                                number-as-hyperlink · preview lives as a proper
                                                                Eye action button in the Actions column so ALL
                                                                actions read as buttons in one place. */}
                                                            <div className="min-w-0 pl-6">
                                                                <div className={`font-mono ${decision === 'rejected' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                                    {row.invoiceNumber}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                                                    {row.entity} · <span className="font-mono">{row.id}</span>
                                                                </div>
                                                            </div>
                                                            <span></span>
                                                            <div className={`text-right tabular-nums ${decision === 'rejected' ? 'text-muted-foreground line-through' : 'text-foreground'} font-semibold`}>
                                                                ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </div>
                                                            <div className={`text-right tabular-nums ${decision === 'rejected' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                                <span className="font-semibold">${row.orderGpAmount.toLocaleString()}</span>
                                                                <span className="text-[10px] text-muted-foreground ml-1">{row.orderGpPct}%</span>
                                                            </div>
                                                            <div className="text-right">
                                                                {/* F86.22 · row status pill · per-warning · badge label
                                                                    picked from warningCopy so DUPLICATE vs RATE MISMATCH
                                                                    read at a glance without opening the popover
                                                                    (Nielsen 6 · recognition, not recall). */}
                                                                {row.warning && resolutionFor(row.id) === 'held' ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openWarningPopover(row.id)}
                                                                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-warning bg-warning/15 hover:bg-warning/25 rounded-full px-2 py-0.5 border border-warning/40 transition-colors"
                                                                        title="Open warning · resolve"
                                                                    >
                                                                        <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                                                                        {warningCopy(row)?.badge ?? 'Warning'} · held
                                                                    </button>
                                                                ) : row.warning && resolutionFor(row.id) === 'approved-override' ? (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success bg-success/10 rounded-full px-2 py-0.5">
                                                                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                                        {warningCopy(row)?.badge ?? 'Warning'} · cleared
                                                                    </span>
                                                                ) : row.warning && resolutionFor(row.id) === 'sent-back' ? (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/10 rounded-full px-2 py-0.5">
                                                                        <XCircle className="h-3 w-3" aria-hidden="true" />
                                                                        Sent to Compliance
                                                                    </span>
                                                                ) : decision === 'approved' ? (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success bg-success/10 rounded-full px-2 py-0.5">
                                                                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                                        Approved
                                                                    </span>
                                                                ) : decision === 'rejected' ? (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/10 rounded-full px-2 py-0.5">
                                                                        <XCircle className="h-3 w-3" aria-hidden="true" />
                                                                        Rejected
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 justify-end">
                                                                {/* F86.21.3 · always-visible preview button ·
                                                                    opens the raw invoice PDF in a floating
                                                                    iframe · leftmost so it sits before the
                                                                    decision buttons in every state. */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPreviewBill(row)}
                                                                    aria-label={`Preview ${row.invoiceNumber}`}
                                                                    title="Preview bill PDF"
                                                                    className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground bg-background hover:text-foreground hover:bg-muted border border-border transition-colors"
                                                                >
                                                                    <Eye className="h-3 w-3" aria-hidden="true" />
                                                                </button>
                                                                {row.warning && resolutionFor(row.id) === 'held' ? (
                                                                    <>
                                                                        {/* F86.14 · info trigger stays for the popover · actions
                                                                            (Approve override / Send back) live inline in the row
                                                                            so the user resolves without hopping to a floating panel.
                                                                            F86.22 · prefill + send handlers are per-bill. */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openWarningPopover(row.id)}
                                                                            aria-label={`Why is ${row.invoiceNumber} held`}
                                                                            title="Why is this held?"
                                                                            className="inline-flex items-center justify-center h-6 w-6 rounded-md text-warning bg-warning/10 hover:bg-warning/20 border border-warning/40 transition-colors"
                                                                        >
                                                                            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                // F86.22 · prefill sourced from warningCopy per warning
                                                                                // type · no more hardcoded NLC-99120 sentence.
                                                                                if (stage === 'rejecting') { setStage('idle'); setRejectReason('') }
                                                                                setActiveWarningBillId(row.id)
                                                                                setOverrideReasonFor(row.id, warningCopy(row)?.suggestedOverride ?? '')
                                                                            }}
                                                                            aria-label={`Approve override for ${row.invoiceNumber}`}
                                                                            title="Approve override"
                                                                            className="inline-flex items-center justify-center h-6 w-6 rounded-md text-success bg-background hover:bg-success/10 border border-success/40 transition-colors"
                                                                        >
                                                                            <Check className="h-3 w-3" aria-hidden="true" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleSendWarningBack(row.id)}
                                                                            aria-label={`Send ${row.invoiceNumber} back to Compliance`}
                                                                            title="Send back to Compliance"
                                                                            className="inline-flex items-center justify-center h-6 w-6 rounded-md text-destructive bg-background hover:bg-destructive/10 border border-destructive/40 transition-colors"
                                                                        >
                                                                            <X className="h-3 w-3" aria-hidden="true" />
                                                                        </button>
                                                                    </>
                                                                ) : row.warning && resolutionFor(row.id) === 'sent-back' ? (
                                                                    <span className="text-[10px] text-muted-foreground italic">escalated</span>
                                                                ) : row.warning ? (
                                                                    <span className="text-[10px] text-muted-foreground italic">override</span>
                                                                ) : (decision === 'approved' || decision === 'rejected') ? (
                                                                    <button
                                                                        onClick={() => setDecision(row.id, 'pending')}
                                                                        disabled={rowLocked}
                                                                        aria-label={`Reset ${row.invoiceNumber}`}
                                                                        title="Reset to pending"
                                                                        className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground bg-background hover:text-foreground hover:bg-muted border border-border transition-colors disabled:opacity-40"
                                                                    >
                                                                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            onClick={() => setDecision(row.id, 'approved')}
                                                                            disabled={rowLocked}
                                                                            aria-label={`Approve ${row.invoiceNumber}`}
                                                                            title="Approve this bill"
                                                                            className="inline-flex items-center justify-center h-6 w-6 rounded-md text-success bg-background hover:bg-success/10 border border-success/40 transition-colors disabled:opacity-40"
                                                                        >
                                                                            <Check className="h-3 w-3" aria-hidden="true" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setDecision(row.id, 'rejected')}
                                                                            disabled={rowLocked}
                                                                            aria-label={`Reject ${row.invoiceNumber}`}
                                                                            title="Reject this bill"
                                                                            className="inline-flex items-center justify-center h-6 w-6 rounded-md text-destructive bg-background hover:bg-destructive/10 border border-destructive/40 transition-colors disabled:opacity-40"
                                                                        >
                                                                            <X className="h-3 w-3" aria-hidden="true" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>

                                                            {/* F86.13 · Row-anchored warning popover · appears
                                                                only when this bill is the active warning target.
                                                                Absolutely positioned relative to the row · slides
                                                                in from the right on wider viewports, falls back to
                                                                below on narrow ones (max-w constraint + hidden overflow). */}
                                                            {/* F86.14 · Inline override composer · slides into the same
                                                                anchor as the info popover · appears only when the user
                                                                clicks the Approve-override action in the row. */}
                                                            {activeWarningBillId === row.id && warningsByBill[row.id] && overrideReasons[row.id] && (() => {
                                                                const rowIndex = allWarnings.findIndex(w => w.billId === row.id)
                                                                const nextWarning = allWarnings.find(w => w.billId !== row.id && resolutionFor(w.billId) === 'held')
                                                                return (
                                                                    <div className="absolute right-6 top-full mt-2 z-[420] w-[380px] max-w-[calc(100vw-4rem)] bg-card border border-warning/60 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                                                                        <div className="absolute -top-1.5 right-24 h-3 w-3 rotate-45 bg-card border-l border-t border-warning/60" aria-hidden="true" />
                                                                        <div className="p-4 space-y-3">
                                                                            <div className="flex items-start gap-2.5">
                                                                                <div className="h-8 w-8 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                                                                                    <Check className="h-4 w-4 text-success" aria-hidden="true" />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-sm font-bold text-foreground">Approve override · reason required</div>
                                                                                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Compliance keeps this on the audit trail for the release record.</p>
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setOverrideReasonFor(row.id, '')}
                                                                                    aria-label="Cancel override"
                                                                                    className="p-1 -m-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                                                                                >
                                                                                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                                                                                </button>
                                                                            </div>
                                                                            <textarea
                                                                                value={(overrideReasons[row.id] ?? '').trim()}
                                                                                onChange={(e) => setOverrideReasonFor(row.id, e.target.value || ' ')}
                                                                                rows={2}
                                                                                autoFocus
                                                                                placeholder="e.g. Reissued invoice · original was voided · vendor confirmed Aug 20."
                                                                                className="w-full text-xs bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-warning/40 placeholder:text-muted-foreground"
                                                                            />
                                                                            <div className="flex items-center gap-2">
                                                                                {/* F86.16 · promoted to bordered secondary so it reads as
                                                                                    an actual button next to the primary override CTA. */}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setOverrideReasonFor(row.id, '')}
                                                                                    className="inline-flex items-center text-xs font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-lg px-3 py-1.5 transition-colors"
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleOverrideConfirm(row.id)}
                                                                                    disabled={!(overrideReasons[row.id] ?? '').trim()}
                                                                                    className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                                                                >
                                                                                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                                                                    Send override
                                                                                </button>
                                                                            </div>
                                                                            {/* F86.22 · N>1 progress + next-warning link.
                                                                                Hidden when there's only one warning. Auto-advance
                                                                                still happens on confirm via advanceOrClose · this
                                                                                link lets the user skip to another one without resolving. */}
                                                                            {warningCount > 1 && (
                                                                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border text-[10px]">
                                                                                    <span className="text-muted-foreground tabular-nums">Warning {rowIndex + 1} of {warningCount}</span>
                                                                                    {nextWarning && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => openWarningPopover(nextWarning.billId)}
                                                                                            className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors"
                                                                                        >
                                                                                            Next → {nextWarning.invoiceNumber}
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })()}

                                                            {/* F86.14 · Row-anchored info popover · info-only now
                                                                (actions live in the row). Opens on the AlertTriangle
                                                                info trigger · closes with X or when the user starts
                                                                the inline override composer. */}
                                                            {activeWarningBillId === row.id && warningsByBill[row.id] && !overrideReasons[row.id] && (() => {
                                                                const w = warningsByBill[row.id]
                                                                const rowIndex = allWarnings.findIndex(x => x.billId === row.id)
                                                                const nextWarning = allWarnings.find(x => x.billId !== row.id && resolutionFor(x.billId) === 'held')
                                                                return (
                                                                    <div className="absolute right-6 top-full mt-2 z-[420] w-[340px] max-w-[calc(100vw-4rem)] bg-card border border-warning/60 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                                                                        <div className="absolute -top-1.5 right-24 h-3 w-3 rotate-45 bg-card border-l border-t border-warning/60" aria-hidden="true" />
                                                                        <div className="p-4 space-y-3">
                                                                            <div className="flex items-start gap-2.5">
                                                                                <div className="h-8 w-8 rounded-full bg-warning/15 flex items-center justify-center shrink-0">
                                                                                    <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-sm font-bold text-foreground">{w.headline}</div>
                                                                                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{w.detail}</p>
                                                                                    <p className="text-[10px] text-muted-foreground mt-2 italic">Use the actions in the row · approve override or send back to Compliance.</p>
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={closeWarningPopover}
                                                                                    aria-label="Close info"
                                                                                    className="p-1 -m-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                                                                                >
                                                                                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                                                                                </button>
                                                                            </div>
                                                                            {/* F86.22 · N>1 progress + next-warning link. */}
                                                                            {warningCount > 1 && (
                                                                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border text-[10px]">
                                                                                    <span className="text-muted-foreground tabular-nums">Warning {rowIndex + 1} of {warningCount}</span>
                                                                                    {nextWarning && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => openWarningPopover(nextWarning.billId)}
                                                                                            className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors"
                                                                                        >
                                                                                            Next → {nextWarning.invoiceNumber}
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })()}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>

                            </div>

                            {/* F86.12 · Post-release payoff · simplified from the old "handoff
                                to Dealer flows" mix · confirmation first, follow-up second. */}
                            {stage === 'approved' && (
                                <div className="px-6 py-4 border-t border-border bg-success/5 flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                                    <div className="flex-1 min-w-0 text-xs">
                                        <div className="text-sm font-bold text-foreground">
                                            Batch released · ${releaseTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sent · {releaseCount} bills posted to NetSuite
                                        </div>
                                        {(counts.rejected > 0 || sentBackBills.length > 0) && (
                                            <div className="text-muted-foreground mt-1">
                                                {counts.rejected > 0 && <>{counts.rejected} rejected returned to Compliance</>}
                                                {counts.rejected > 0 && sentBackBills.length > 0 && <> · </>}
                                                {sentBackBills.length > 0 && <>{sentBackBills.length} warning{sentBackBills.length === 1 ? '' : 's'} escalated for re-cut</>}
                                            </div>
                                        )}
                                        <div className="text-[11px] text-muted-foreground mt-1">Vendor remittance detail queued in the Dealer Experience.</div>
                                    </div>
                                </div>
                            )}

                            {/* F86.12 · Send-back reason capture (repurposed reject flow ·
                                covers both the top-level "send batch back" and the
                                "keep duplicate held · send back" path from the blocker). */}
                            {stage === 'rejecting' && (
                                <div className="px-6 py-4 border-t border-border bg-destructive/5 space-y-3">
                                    <div className="flex items-center gap-2 text-xs">
                                        <XCircle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
                                        <span className="text-foreground font-semibold">Send batch back to Compliance · reason required</span>
                                        <span className="text-muted-foreground">· all per-vendor decisions in this session are discarded</span>
                                    </div>
                                    {(counts.approved > 0 || counts.rejected > 0) && (
                                        <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
                                            Discarding · {counts.approved} approved · {counts.rejected} rejected · returning the full batch untouched.
                                        </div>
                                    )}
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={3}
                                        placeholder="e.g. Batch total is above the Tuesday cash-flow target · move Boss Design + one Alamir to Thursday."
                                        className="w-full text-xs bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 placeholder:text-muted-foreground"
                                    />
                                </div>
                            )}
                            {stage === 'rejected' && (
                                <div className="px-6 py-4 border-t border-border bg-destructive/5 flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                                    <div className="flex-1 min-w-0 text-xs">
                                        <div className="text-foreground font-semibold">Batch sent back to Compliance</div>
                                        <div className="text-muted-foreground mt-1 line-clamp-2 italic">&ldquo;{rejectReason}&rdquo;</div>
                                        <div className="text-muted-foreground mt-1">Nothing released · Compliance re-cuts the batch based on the note.</div>
                                    </div>
                                </div>
                            )}

                            {/* F86.12 · New footer · left decisions counter · right release CTA
                                with dynamic label. Batch-level Leave-comment removed (moved to
                                per-vendor). Reject renamed to Send batch back. Release button
                                describes the actual transition (ACH send), not "approve again". */}
                            <div className="px-6 py-4 border-t border-border bg-muted/10 flex items-center gap-3 flex-wrap">
                                {stage === 'idle' && (
                                    <>
                                        {/* Left · decisions counter chip */}
                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                {counts.approved > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-success">
                                                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                        <span className="tabular-nums font-semibold">{counts.approved}</span> approved
                                                    </span>
                                                )}
                                                {counts.rejected > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-destructive">
                                                        <XCircle className="h-3 w-3" aria-hidden="true" />
                                                        <span className="tabular-nums font-semibold">{counts.rejected}</span> rejected
                                                    </span>
                                                )}
                                                {counts.pending > 0 && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <span className="tabular-nums font-semibold">{counts.pending}</span> pending
                                                    </span>
                                                )}
                                                {/* F86.22 · per-warning counts drive the chips · the three
                                                    resolution states can co-exist across warnings. */}
                                                {heldWarningsCount > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-warning">
                                                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                                        <span className="tabular-nums font-semibold">{heldWarningsCount}</span> held
                                                    </span>
                                                )}
                                                {overrideBills.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-success">
                                                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                        <span className="tabular-nums font-semibold">{overrideBills.length}</span> override{overrideBills.length === 1 ? '' : 's'} cleared
                                                    </span>
                                                )}
                                                {sentBackBills.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-destructive">
                                                        <XCircle className="h-3 w-3" aria-hidden="true" />
                                                        <span className="tabular-nums font-semibold">{sentBackBills.length}</span> escalated
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right · destructive escalation + primary release */}
                                        <button
                                            onClick={() => { setActiveWarningBillId(null); setStage('rejecting') }}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive bg-background hover:bg-destructive/5 border border-destructive/40 rounded-lg px-3 py-2 transition-colors"
                                        >
                                            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                            Send batch back
                                        </button>
                                        {/* F86.15 · Diego 2026-08-27 · Continue is the review trigger,
                                            not the terminal action. Opens a preflight modal listing
                                            what will actually ship + surfacing pending/held so nothing
                                            releases by accident. Terminal Release CTA lives INSIDE
                                            the preflight modal. Applies Nielsen 5 (error prevention
                                            via confirmation) + Krug law 2 (extra click is fine when
                                            each is confidence-building). */}
                                        <button
                                            onClick={() => setShowPreflight(true)}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                                        >
                                            Continue
                                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                        </button>
                                    </>
                                )}

                                {stage === 'approving' && (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ai py-2 px-4 ml-auto">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                        Sending ACH entries to the bank…
                                    </div>
                                )}

                                {stage === 'rejecting' && (
                                    <>
                                        <div className="flex-1" />
                                        <button
                                            onClick={() => { setStage('idle'); setRejectReason('') }}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-lg px-3 py-2 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmReject}
                                            disabled={!rejectReason.trim()}
                                            className="inline-flex items-center gap-1.5 bg-destructive text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                            Confirm send back
                                        </button>
                                    </>
                                )}

                                {(stage === 'approved' || stage === 'rejected') && (
                                    <button
                                        onClick={onClose}
                                        className="ml-auto inline-flex items-center gap-1.5 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>

        {/* F86.15 · Diego 2026-08-27 · preflight confirmation.
            Opens when Approver clicks Continue in the footer. Lists what
            will ship (grouped by vendor) + surfaces any held blockers or
            untouched pending bills so nothing releases by accident.
            Nested Dialog · z-[460] to clear the parent modal (z-[400]). */}
        <Transition show={showPreflight} as={Fragment}>
            <Dialog onClose={() => setShowPreflight(false)} className="relative z-[460]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-y-0 right-0 left-0 md:left-[320px] bg-foreground/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-4 md:pl-[336px]">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        {/* F86.18 · bumped from max-w-lg to max-w-2xl so the vendor
                            list has room for per-bill detail rows without feeling cramped. */}
                        <DialogPanel className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                            {/* Header · F86.18 · icon container uses the semantic bg-primary
                                + text-primary-foreground pairing so the icon has WCAG-safe
                                contrast on the brand tone (prior bg-primary/10 + text-primary
                                failed AA on our lime brand). */}
                            <div className="px-5 py-4 flex items-start justify-between gap-3 border-b border-border">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                                        <Send className="h-4.5 w-4.5 text-primary-foreground" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base font-bold text-foreground">Review before releasing</h2>
                                        <p className="text-[11px] text-muted-foreground">Confirm what ships in this ACH batch</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPreflight(false)}
                                    aria-label="Close"
                                    className="p-1.5 -m-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Body · scrolls if the vendor list is long · F86.18 · 70vh
                                so more bills fit on a laptop viewport before scrolling. */}
                            <div className="max-h-[70vh] overflow-y-auto">
                                {/* Blocker · held items must be resolved first */}
                                {preflightBreakdown.heldBills.length > 0 && (
                                    <div className="px-5 py-4 border-b border-border bg-warning/5">
                                        <div className="flex items-start gap-2.5">
                                            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs font-bold text-warning">
                                                    {preflightBreakdown.heldBills.length} bill{preflightBreakdown.heldBills.length === 1 ? '' : 's'} still held · release blocked
                                                </div>
                                                <ul className="mt-1.5 space-y-0.5">
                                                    {preflightBreakdown.heldBills.map(b => (
                                                        <li key={b.id} className="text-[11px] text-foreground/80">
                                                            <span className="font-semibold">{b.vendor}</span>
                                                            <span className="text-muted-foreground"> · {b.invoiceNumber} · ${b.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <p className="mt-1.5 text-[11px] text-muted-foreground">
                                                    Resolve each held item (approve override or send back) before releasing the batch.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* F86.16 · Pending · never auto-included. Approver must
                                    approve rows individually or by vendor before release. */}
                                {preflightBreakdown.pendingCount > 0 && (
                                    <div className="px-5 py-3 border-b border-border bg-muted/30">
                                        <div className="flex items-start gap-2.5">
                                            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                                            <div className="text-[11px] text-foreground/80 min-w-0 flex-1">
                                                <div>
                                                    <span className="font-bold">{preflightBreakdown.pendingCount} bill{preflightBreakdown.pendingCount === 1 ? '' : 's'}</span> pending review · ${preflightBreakdown.pendingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · <span className="font-bold">not included</span> in this release.
                                                </div>
                                                <div className="mt-1 text-muted-foreground">
                                                    Approve them individually (check per row) or by vendor (<span className="font-semibold text-foreground/80">Approve all</span> in each group) to include them.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Ready to release · vendor rollup */}
                                <div className="px-5 py-4">
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            Ready to release
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            <span className="tabular-nums font-bold text-foreground">{releaseCount}</span> bill{releaseCount === 1 ? '' : 's'} · <span className="tabular-nums font-bold text-foreground">${releaseTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                    {preflightBreakdown.vendors.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
                                            <div className="text-xs font-bold text-foreground mb-1">Nothing approved yet</div>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                Nothing will release. Go back and approve at least one bill · click the <Check className="inline h-3 w-3 -mt-0.5" aria-hidden="true" /> per row, or <span className="font-semibold text-foreground/80">Approve all</span> on a vendor.
                                            </p>
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                                            {preflightBreakdown.vendors.map(v => {
                                                const isOpen = expandedPreflight.has(v.vendor)
                                                return (
                                                    <li key={v.vendor} className="bg-background">
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePreflightVendor(v.vendor)}
                                                            aria-expanded={isOpen}
                                                            className="w-full px-3 py-2 flex items-center justify-between gap-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                <ChevronRight
                                                                    className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                                                                    aria-hidden="true"
                                                                />
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="text-xs font-bold text-foreground truncate">{v.vendor}</div>
                                                                    <div className="text-[10px] text-muted-foreground">{v.count} bill{v.count === 1 ? '' : 's'}</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-xs font-bold text-foreground tabular-nums shrink-0">
                                                                ${v.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </div>
                                                        </button>
                                                        {isOpen && (
                                                            <ul className="divide-y divide-border">
                                                                {v.bills.map(b => (
                                                                    <li key={b.id} className="pl-9 pr-3 py-1.5 grid grid-cols-[1fr_auto_auto] items-center gap-3 text-[11px]">
                                                                        <div className="min-w-0">
                                                                            <div className="font-mono text-foreground truncate">{b.invoiceNumber}</div>
                                                                            <div className="text-[10px] text-muted-foreground truncate">{b.entity} · <span className="font-mono">{b.id}</span></div>
                                                                        </div>
                                                                        <div className="text-muted-foreground tabular-nums text-right">
                                                                            <span className="font-semibold text-foreground/80">${b.orderGpAmount.toLocaleString()}</span>
                                                                            <span className="ml-1 text-[10px]">{b.orderGpPct}% GP</span>
                                                                        </div>
                                                                        <div className="font-semibold text-foreground tabular-nums text-right min-w-[80px]">
                                                                            ${b.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    )}
                                </div>

                                {/* F86.17 · escalated-separately note · when the Approver sent
                                    warning items to Compliance, surface that here so they see
                                    those are already handled outside this batch. F86.22 · counts
                                    escalated warnings across types (not just duplicates). */}
                                {sentBackBills.length > 0 && (
                                    <div className="px-5 pb-3 -mt-1">
                                        <div className="text-[11px] text-muted-foreground">
                                            <span className="tabular-nums font-bold text-foreground">{sentBackBills.length}</span> warning{sentBackBills.length === 1 ? '' : 's'} escalated to Compliance separately · Compliance re-cuts before next run.
                                        </div>
                                    </div>
                                )}

                                {/* Returned to Compliance summary */}
                                {counts.rejected > 0 && (
                                    <div className="px-5 pb-4 -mt-1">
                                        <div className="text-[11px] text-muted-foreground">
                                            <span className="tabular-nums font-bold text-foreground">{counts.rejected}</span> bill{counts.rejected === 1 ? '' : 's'} rejected · returned to Compliance
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-border px-5 py-3 flex items-center gap-2 bg-muted/20">
                                {/* F86.16 · bordered secondary so the escape hatch is as easy
                                    to see as the primary Confirm across from it. */}
                                <button
                                    onClick={() => setShowPreflight(false)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-lg transition-colors"
                                >
                                    Back to review
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPreflight(false)
                                        handleApprove()
                                    }}
                                    disabled={!canRelease || preflightBreakdown.heldBills.length > 0}
                                    title={
                                        preflightBreakdown.heldBills.length > 0
                                            ? 'Resolve the held item(s) before releasing'
                                            : !canRelease
                                                ? 'Approve at least one bill first'
                                                : undefined
                                    }
                                    className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                    Confirm release
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>

        {/* F86.21.3 · Diego 2026-08-27 · raw invoice PDF preview · reuses
            the lifted iframe PDF modal. Rendered as the last sibling in
            the fragment · zClass elevates above the parent (z-[400]) and
            the preflight (z-[460]). Closing returns to whatever was open. */}
        <PdfPreviewModal
            isOpen={previewBill !== null}
            onClose={() => setPreviewBill(null)}
            doc={previewBill ? {
                id: previewBill.id,
                name: previewBill.invoiceNumber,
                vendor: previewBill.vendor,
                type: 'Bill',
            } : null}
            zClass="z-[470]"
        />
        </>
    )
}
