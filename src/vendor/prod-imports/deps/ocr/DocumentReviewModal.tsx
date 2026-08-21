import { Fragment, useState, useMemo, useEffect } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, ExternalLink, CheckCircle2, ChevronDown, Download, FileText, Pencil, Plus, Trash2, Box, Info, Eye, Link2, CornerDownRight, Loader2, Sparkles } from 'lucide-react'
import type { OcrDocCardData, OcrDocType } from './OcrDocCard'
import CatalogVerifyPill from './CatalogVerifyPill'
import AITrainingConsentModal from './AITrainingConsentModal'
import DocTypeChip from './DocTypeChip'
import PdfPreviewModal from '../comparison/PdfPreviewModal'
import TransactionVerifyPill from '../TransactionVerifyPill'

interface DocumentReviewModalProps {
    isOpen: boolean
    onClose: () => void
    doc: OcrDocCardData | null
    onSave?: (doc: OcrDocCardData) => void
    /** FB-06a / FB-10 · opens the feedback composer with this doc as auto-attached context. */
    onSendFeedback?: (doc: OcrDocCardData) => void
    onDownloadOriginal?: (doc: OcrDocCardData) => void
    /** F84.21 · Diego 2026-08-21 · optional initial tab · lets the caller
     *  land the user on Linked Documents (e.g. F2 p2.2 · post-registration
     *  the linked list is the point of the visit). Defaults to 'header'. */
    initialTab?: 'header' | 'lineItems' | 'linked'
}

interface FieldRow {
    label: string
    value: string
    editable?: boolean
}

interface Section {
    title: string
    rows: FieldRow[]
}

interface LineItem {
    id: string
    productNumber: string
    description: string
    catalogCode?: string
    manufacturerCode?: string
    quantity: number
    uom: string
    listPrice: number
    sellPrice: number
    productCost: number
    discount: number
}

// Mock factory — generates plausible header sections per document.
// In a real build these would come from the OCR pipeline.
function buildHeaderSections(doc: OcrDocCardData): Section[] {
    const baseLabel = doc.type === 'Quote' ? 'Quote' : doc.type === 'Purchase Order' ? 'PO' : 'Document'
    const isQuote = doc.type === 'Quote'
    return [
        {
            title: `${baseLabel.toUpperCase()} INFO`,
            rows: [
                { label: `${baseLabel} Number`, value: doc.name.replace(/\.[^.]+$/, '').replace(/[_]/g, '-').slice(0, 16) || 'S-QUO017792', editable: true },
                { label: `${baseLabel} Date`, value: 'Feb 10, 2026', editable: true },
                ...(isQuote ? [{ label: 'Expiration Date', value: 'May 11, 2026', editable: true }] : []),
            ],
        },
        {
            title: 'VENDOR',
            rows: [
                { label: 'Vendor Name', value: doc.vendor, editable: true },
                { label: 'Vendor Address', value: '600 Eagle Drive, Bensenville, IL 60106, USA', editable: true },
            ],
        },
        {
            title: 'DEALER',
            rows: [
                { label: 'Dealer Name', value: 'Custer Inc.', editable: true },
                { label: 'Dealer Address', value: '217 Grandville Ave. SW, Grand Rapids, MI 49503, USA', editable: true },
            ],
        },
        {
            title: 'SHIPPING',
            rows: [
                { label: 'Freight Included', value: 'No', editable: true },
            ],
        },
        {
            title: 'PROJECT',
            rows: [
                { label: 'Project Name', value: 'MATTAWAN MIDDLE SCHOOLS', editable: true },
            ],
        },
        {
            title: 'FINANCIALS',
            rows: [
                { label: `${baseLabel} Total`, value: '$161,571.02' },
                { label: 'Subtotal', value: '$155,111.02' },
                { label: 'Product Subtotal', value: '$155,111.02' },
                { label: 'D&I Subtotal', value: '$0.00', editable: true },
                { label: 'Tax Subtotal', value: '$0.00', editable: true },
                { label: 'Tax Rate', value: '0.00%', editable: true },
                { label: 'Sales Tax', value: '$0.00', editable: true },
                { label: 'Shipping Total', value: '$6,460.00', editable: true },
                { label: 'Payment Terms', value: 'Net 30', editable: true },
                { label: 'Currency', value: 'USD ($) - US Dollar' },
            ],
        },
    ]
}

function buildLineItems(doc: OcrDocCardData): LineItem[] {
    const all: LineItem[] = [
        { id: 'li-1', productNumber: 'HMBS244-D', description: 'Mobile Booth Seating - Half Circle - 24"W x 92"L', quantity: 4, uom: 'EA', listPrice: 29410, sellPrice: 9094.31, productCost: 9094.31, discount: 0 },
        { id: 'li-2', productNumber: 'MCTNP488-42-D', description: 'Mobile Conversation Table - Open Sides - 48"W x 96"L x 42"H', quantity: 5, uom: 'EA', listPrice: 10163, sellPrice: 3142.65, productCost: 3142.65, discount: 0 },
        { id: 'li-3', productNumber: 'MFB5P245-D', description: 'Mobile Folding Booth Seating with Table - Package - 60"W x 80"L x 40"H', quantity: 8, uom: 'EA', listPrice: 28909, sellPrice: 8939.39, productCost: 8939.39, discount: 0 },
        { id: 'li-4', productNumber: 'MST1012-D', description: 'Mobile Stool Table - Rectangle - 30"W x 10"L - 12 Stools', quantity: 11, uom: 'EA', listPrice: 8183, sellPrice: 2530.39, productCost: 2530.39, discount: 0 },
        { id: 'li-5', productNumber: 'PTRX4230-D', description: 'Social Table - Round - 42" Diameter x 30"H', quantity: 4, uom: 'EA', listPrice: 2968, sellPrice: 917.78, productCost: 917.78, discount: 0 },
    ]
    return all.slice(0, Math.max(1, Math.min(doc.lineItems || all.length, all.length)))
}

function formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

// ── Linked Documents (traceability) ───────────────────────────────────────
// Transaction documents flow through a lifecycle: Quote → Purchase Order →
// Acknowledgment → Invoice. Linked Documents shows ONLY upstream sources — the
// documents that led to the current one — never downstream documents (a PO has
// no Acknowledgment yet at the time it exists). Grounded in the Strata docs
// (COI-DEMO-FLOWS / referencePoNumber): a PO links to its Quote; an ACK links to
// its PO and the originating Quote; an Invoice links to its ACK/PO/Quote. Mock
// data for the demo — a real build would resolve these from the document graph.
type ChainRelation = 'source' | 'current'

interface LinkedDoc {
    id: string
    name: string
    vendor: string
    type: OcrDocType
    relation: ChainRelation
    relationLabel: string
    status: string
    date: string
    isCurrent: boolean
}

const LIFECYCLE: { type: OcrDocType; prefix: string }[] = [
    { type: 'Quote', prefix: 'QT' },
    { type: 'Purchase Order', prefix: 'PO' },
    { type: 'Acknowledgment', prefix: 'ACK' },
    { type: 'Invoice', prefix: 'INV' },
]

const TYPE_NOUN: Record<OcrDocType, string> = {
    'Quote': 'quote',
    'Purchase Order': 'PO',
    'Acknowledgment': 'ACK',
    'Invoice': 'invoice',
}

// Returns the upstream ancestry (oldest → immediate parent) followed by the
// current document as the final node. Returns just the current node for a Quote
// (no upstream); the caller renders an empty state in that case.
function buildUpstreamChain(doc: OcrDocCardData): LinkedDoc[] {
    const idx = LIFECYCLE.findIndex(s => s.type === doc.type)
    if (idx === -1) return []
    const vendorSlug = doc.vendor.replace(/[^A-Za-z0-9]+/g, '') || 'Vendor'
    const num = doc.name.match(/\d{3,}/)?.[0] ?? '1027'
    const immediateParentIdx = idx - 1
    return LIFECYCLE.slice(0, idx + 1).map((stage, i) => {
        const isCurrent = i === idx
        const isImmediateParent = i === immediateParentIdx
        const relationLabel =
            isCurrent ? 'This document'
            : isImmediateParent ? `Source ${TYPE_NOUN[stage.type]}`
            : `Originating ${TYPE_NOUN[stage.type]}`
        const status = isCurrent
            ? (doc.status === 'processed' || doc.status === 'completed' ? 'Reviewed' : 'Pending review')
            : 'Approved'
        return {
            id: isCurrent ? doc.id : `${stage.prefix}-${num}`,
            name: isCurrent ? doc.name : `${stage.prefix}-${num}_${vendorSlug}.pdf`,
            vendor: doc.vendor,
            type: stage.type,
            relation: isCurrent ? 'current' : 'source',
            relationLabel,
            status,
            date: doc.date,
            isCurrent,
        }
    })
}

function relationBadgeClasses(relation: ChainRelation): string {
    switch (relation) {
        case 'source': return 'bg-info/10 text-info dark:bg-info/10 dark:text-info'
        case 'current': return 'bg-primary text-primary-foreground'
    }
}

function EditableValue({ value, editable, onChange }: { value: string; editable?: boolean; onChange?: (v: string) => void }) {
    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    if (!editable) return <span className="text-sm text-foreground">{value}</span>
    if (isEditing) {
        return (
            <input
                value={draft}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => { setIsEditing(false); onChange?.(draft) }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') { setIsEditing(false); onChange?.(draft) }
                    if (e.key === 'Escape') { setIsEditing(false); setDraft(value) }
                }}
                className="text-sm bg-background border border-primary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 w-full max-w-md"
            />
        )
    }
    return (
        <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 text-sm text-foreground hover:bg-muted rounded-md px-2 py-1 -my-1 -mx-2 transition-colors group"
        >
            <span>{value}</span>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    )
}

export default function DocumentReviewModal({ isOpen, onClose, doc, onSave, onSendFeedback, onDownloadOriginal, initialTab = 'header' }: DocumentReviewModalProps) {
    const [tab, setTab] = useState<'header' | 'lineItems' | 'linked'>(initialTab)
    /** F84.23 · Diego 2026-08-21 · quick "loading extracted fields" overlay
     *  every time the modal opens · gives a tangible sense of Strata
     *  processing the doc before the panels reveal. */
    const [processing, setProcessing] = useState(false)
    useEffect(() => {
        if (!isOpen) return
        setProcessing(true)
        const t = setTimeout(() => setProcessing(false), 900)
        return () => clearTimeout(t)
    }, [isOpen, doc?.id])
    const [exportOpen, setExportOpen] = useState(false)
    const [previewDoc, setPreviewDoc] = useState<LinkedDoc | null>(null)

    const sections = useMemo(() => doc ? buildHeaderSections(doc) : [], [doc])
    const chain = useMemo(() => doc ? buildUpstreamChain(doc) : [], [doc])
    const linkedCount = chain.filter(d => !d.isCurrent).length
    // Local mutable copy so users can replace a SKU via the catalog verify popover.
    const [lineItems, setLineItems] = useState<LineItem[]>([])
    // Change tracking — drives whether the consent modal opens on Save.
    const [editedCount, setEditedCount] = useState(0)
    const [replacedCount, setReplacedCount] = useState(0)
    const [showConsent, setShowConsent] = useState(false)

    useEffect(() => {
        setLineItems(doc ? buildLineItems(doc) : [])
        setEditedCount(0)
        setReplacedCount(0)
        setShowConsent(false)
    }, [doc])

    const trackEdit = () => setEditedCount(c => c + 1)

    const handleReplaceSku = (originalSku: string, newSku: string) => {
        setLineItems(prev => prev.map(li => li.productNumber === originalSku ? { ...li, productNumber: newSku } : li))
        setReplacedCount(c => c + 1)
    }

    if (!doc) return null

    const isReviewed = doc.status === 'processed' || doc.status === 'completed'
    const confidence = 92

    const totals = lineItems.reduce(
        (acc, li) => ({
            qty: acc.qty + li.quantity,
            list: acc.list + li.listPrice,
            sell: acc.sell + li.sellPrice,
            cost: acc.cost + li.productCost,
        }),
        { qty: 0, list: 0, sell: 0, cost: 0 }
    )

    const finalizeSave = () => {
        onSave?.(doc)
        onClose()
    }

    const handleSave = () => {
        // Only open the consent modal if the user actually changed something
        // during this session — pure-read sessions skip the prompt.
        if (editedCount + replacedCount > 0) {
            setShowConsent(true)
        } else {
            finalizeSave()
        }
    }

    const handleConsentAccept = () => {
        setShowConsent(false)
        finalizeSave()
    }

    const handleConsentDecline = () => {
        setShowConsent(false)
        finalizeSave()
    }

    const handleConsentCancel = () => {
        setShowConsent(false)
        // Stay on the review modal, keep counters / edits intact.
    }

    const handleExportSif = () => {
        setExportOpen(false)
        // Simulated SIF export — real impl would download a .sif file.
        const blob = new Blob([JSON.stringify({ doc: doc.name, sections, lineItems }, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${doc.vendor.replace(/\s+/g, '-')}-${doc.id}.sif`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <>
        <Transition show={isOpen} as={Fragment}>
            {/* F83.S · Diego 2026-08-21 · z-index raised from z-[200] to z-[400]
                so the modal renders above the demo tour sidebar (w-80 · z-[300]).
                Left inset offset applied to the panel container below so the
                modal centers in the visible content area, not covered by the
                sidebar. This is a demo-tour structural adaptation · not a
                business-logic change · re-sync from prod DocumentReviewModal
                keeps this override in place. */}
            <Dialog onClose={onClose} className="relative z-[400]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    {/* F84.3 · backdrop offset so it doesn't cover the demo
                        tour sidebar (w-80 · fixed left-0 · z-[300]). */}
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
                        <DialogPanel className="w-[95vw] max-w-[1600px] h-[95vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="currentColor"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"/></svg>
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-bold text-foreground">Document Review</h2>
                                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                            {/* F84.15 · Diego 2026-08-21 · highlight the doc type when
                                                the file is a W-9 form · gives the vendor onboarding
                                                path a clear "this is a W-9" anchor next to the
                                                filename. Structural adaptation · preserve on prod
                                                re-sync. */}
                                            {/\bW-?9\b/i.test(doc.name) && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-ai/15 text-ai rounded-md px-2 py-0.5 shrink-0">
                                                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                                                    IRS Form W-9
                                                </span>
                                            )}
                                            {/* F84.19 · Diego 2026-08-21 · same chip pattern for Proforma docs. */}
                                            {/\bproforma\b/i.test(doc.name) && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-warning/15 text-warning rounded-md px-2 py-0.5 shrink-0">
                                                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/></svg>
                                                    Proforma Invoice
                                                </span>
                                            )}
                                            <p className="text-sm text-muted-foreground truncate">{doc.vendor} · {doc.name}</p>
                                            <TransactionVerifyPill orderId={doc.id} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {onSendFeedback && (
                                        <button
                                            onClick={() => onSendFeedback(doc)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-info bg-info/10 border border-info/30 rounded-lg hover:bg-info/20 transition-colors"
                                            title="Report an issue or share feedback about this document"
                                        >
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                            </svg>
                                            Send feedback
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDownloadOriginal?.(doc)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        View Original PDF
                                    </button>
                                    {isReviewed ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-success/10 text-success dark:bg-success/15 dark:text-success">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Reviewed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Pending Review
                                        </span>
                                    )}
                                    <button
                                        onClick={onClose}
                                        aria-label="Close"
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs row */}
                            <div className="px-6 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => setTab('header')}
                                        className={`relative py-3 text-sm font-bold transition-colors ${
                                            tab === 'header' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Header Fields
                                        {tab === 'header' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                                    </button>
                                    <button
                                        onClick={() => setTab('lineItems')}
                                        className={`relative py-3 text-sm font-bold inline-flex items-center gap-2 transition-colors ${
                                            tab === 'lineItems' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Line Items
                                        <span className="text-[10px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{lineItems.length}</span>
                                        {tab === 'lineItems' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                                    </button>
                                    <button
                                        onClick={() => setTab('linked')}
                                        className={`relative py-3 text-sm font-bold inline-flex items-center gap-2 transition-colors ${
                                            tab === 'linked' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <Link2 className="h-3.5 w-3.5" />
                                        Linked Documents
                                        <span className="text-[10px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{linkedCount}</span>
                                        {tab === 'linked' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                                    </button>
                                </div>
                                {/* Export dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setExportOpen(o => !o)}
                                        onBlur={() => setTimeout(() => setExportOpen(false), 150)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        Export
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </button>
                                    {exportOpen && (
                                        <div className="absolute right-0 mt-1 w-60 bg-card border border-border rounded-xl shadow-xl z-10 p-1.5">
                                            <button
                                                onClick={handleExportSif}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700/60 rounded-lg transition-colors"
                                            >
                                                <Download className="h-4 w-4 text-muted-foreground" />
                                                Export to SIF
                                            </button>
                                            <button
                                                onClick={() => { setExportOpen(false); onDownloadOriginal?.(doc) }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700/60 rounded-lg transition-colors"
                                            >
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                Download Original PDF
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* F84.23 · quick processing overlay on open · fades out
                                after ~900ms so the panels reveal with a tangible
                                "Strata just processed the doc" feel. */}
                            {processing && (
                                <div className="flex-1 overflow-hidden flex flex-col items-center justify-center py-16 gap-3 animate-in fade-in duration-200">
                                    <div className="h-12 w-12 rounded-full bg-ai/15 flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 text-ai animate-spin" aria-hidden="true" />
                                    </div>
                                    <div className="text-sm font-semibold text-foreground inline-flex items-center gap-1.5">
                                        <Sparkles className="h-4 w-4 text-ai" aria-hidden="true" />
                                        Loading document data
                                    </div>
                                    <div className="text-xs text-muted-foreground">Extracting fields · resolving linked records…</div>
                                </div>
                            )}

                            {/* Body */}
                            {!processing && (
                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                {tab === 'header' && (
                                    <div className="space-y-6">
                                        {/* F84.19 · Diego 2026-08-21 · when the doc is a Proforma,
                                            surface a highlighted "Proforma Invoice · attached"
                                            preamble at the top of Header Fields with the billing
                                            fields that matter for the F3 progress-billing flow
                                            (tranche · deposit · balance · payment terms · due date
                                            · attachment reference). Structural adaptation to the
                                            vendor prod-import · preserve on re-sync. */}
                                        {/\bproforma\b/i.test(doc.name) && (
                                            <div className="border-2 border-warning/50 rounded-xl overflow-hidden">
                                                <div className="bg-warning/10 px-4 py-2.5 flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-md bg-warning/20 flex items-center justify-center shrink-0">
                                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-warning" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>
                                                    </div>
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-warning">Proforma Invoice · attached</span>
                                                    <button className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-background border border-border text-foreground hover:bg-muted transition-colors">
                                                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                                                        {doc.name}
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 p-4 text-xs">
                                                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                                        <span className="text-muted-foreground">Project</span>
                                                        <span className="text-foreground font-semibold">{doc.vendor}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                                        <span className="text-muted-foreground">Draw</span>
                                                        <span className="text-foreground font-semibold">40% tranche · Furniture 50/40/10</span>
                                                    </div>
                                                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                                        <span className="text-muted-foreground">Tranche amount</span>
                                                        <span className="text-foreground font-bold tabular-nums">$58,240.00</span>
                                                    </div>
                                                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                                        <span className="text-muted-foreground">Deposit applied</span>
                                                        <span className="text-success tabular-nums">− $14,560.00</span>
                                                    </div>
                                                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                                        <span className="text-muted-foreground">Balance due</span>
                                                        <span className="text-foreground font-bold tabular-nums">$43,680.00</span>
                                                    </div>
                                                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                                        <span className="text-muted-foreground">Payment terms</span>
                                                        <span className="text-foreground font-semibold">Net 10 · 1.5%/mo late fee</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Milestone <span className="text-[10px] text-warning">(threshold hit)</span></span>
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 rounded-md px-1.5 py-0.5">
                                                            50% ordered · W32
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Send to</span>
                                                        <span className="text-foreground font-mono text-[11px]">ap@fairport-hq.com</span>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-2.5 border-t border-border bg-muted/20 text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                                                    <svg viewBox="0 0 24 24" className="h-3 w-3 text-warning" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6"/><path d="M12 22v-6"/><path d="M4.93 4.93l4.24 4.24"/><path d="M14.83 14.83l4.24 4.24"/><path d="M2 12h6"/><path d="M22 12h-6"/></svg>
                                                    Save to approve and queue for Coordinator send · Cancel to return the draft to the shared queue for edits.
                                                </div>
                                            </div>
                                        )}

                                        {/* F84.17 · Diego 2026-08-21 · when the doc is a W-9, surface a
                                            highlighted "Compliance Registry Entry" preamble at the top
                                            of Header Fields · shows the indexed fields (TIN · entity
                                            type · signed date · expiration + alert · readiness self-
                                            service status) that matter for vendor onboarding. Structural
                                            adaptation to the vendor prod-import · preserve on re-sync. */}
                                        {/\bW-?9\b/i.test(doc.name) && (
                                            <div className="border-2 border-ai/50 rounded-xl overflow-hidden">
                                                <div className="bg-ai-light px-4 py-2.5 flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-md bg-ai/20 flex items-center justify-center shrink-0">
                                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-ai" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                                                    </div>
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-ai">Compliance Registry Entry · indexed</span>
                                                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-success/15 text-success">
                                                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                                        Readiness self-service · live
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 p-4 text-xs">
                                                    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2">
                                                        <span className="text-muted-foreground shrink-0">Legal name</span>
                                                        <span className="text-right min-w-0">
                                                            <span className="text-foreground font-semibold block truncate">{doc.vendor}</span>
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-success bg-success/10 rounded-md px-1 py-0.5 mt-0.5">
                                                                <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                                                                Extracted · 98%
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2">
                                                        <span className="text-muted-foreground shrink-0">TIN (masked)</span>
                                                        <span className="text-right min-w-0">
                                                            <span className="text-foreground font-mono block">••-•••4728</span>
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-success bg-success/10 rounded-md px-1 py-0.5 mt-0.5">
                                                                <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                                                                Extracted · 96%
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2">
                                                        <span className="text-muted-foreground shrink-0">Entity type</span>
                                                        <span className="text-right min-w-0">
                                                            <span className="text-foreground font-semibold block">LLC · single-member</span>
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-success bg-success/10 rounded-md px-1 py-0.5 mt-0.5">
                                                                <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                                                                Extracted · 94%
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2">
                                                        <span className="text-muted-foreground shrink-0">1099 flag</span>
                                                        <span className="text-right min-w-0">
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded-md px-1.5 py-0.5">
                                                                Yes · 1099-NEC eligible
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-ai bg-ai/10 rounded-md px-1 py-0.5 mt-0.5 ml-1">
                                                                <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                                                                Derived
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2">
                                                        <span className="text-muted-foreground shrink-0">Signed date <span className="text-[10px] text-ai">(indexed)</span></span>
                                                        <span className="text-right min-w-0">
                                                            <span className="text-foreground font-semibold block">2026-03-12</span>
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-success bg-success/10 rounded-md px-1 py-0.5 mt-0.5">
                                                                <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                                                                Extracted · 92%
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-2">
                                                        <span className="text-muted-foreground shrink-0">Expires</span>
                                                        <span className="text-right min-w-0">
                                                            <span className="text-warning font-semibold block">2027-03-12</span>
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-warning bg-warning/10 rounded-md px-1 py-0.5 mt-0.5">
                                                                Alert 30d before
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <span className="text-muted-foreground shrink-0">OFAC screen</span>
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded-md px-1.5 py-0.5">
                                                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                            Clear · 08:14 AM
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <span className="text-muted-foreground shrink-0">ACH routing</span>
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded-md px-1.5 py-0.5">
                                                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                            Verified · Plaid
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {sections.map(section => (
                                            <div key={section.title}>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <Box className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{section.title}</h3>
                                                </div>
                                                <div className="border border-border rounded-xl overflow-hidden">
                                                    <div className="grid grid-cols-[200px_1fr] bg-muted/30 border-b border-border px-4 py-2">
                                                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Field</div>
                                                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Value</div>
                                                    </div>
                                                    {section.rows.map(row => (
                                                        <div key={row.label} className="grid grid-cols-[200px_1fr] px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                                                            <div className="text-sm text-muted-foreground">{row.label}</div>
                                                            <EditableValue value={row.value} editable={row.editable} onChange={trackEdit} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {tab === 'lineItems' && (
                                    <div className="border border-border rounded-xl overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[1340px]">
                                                <thead>
                                                    <tr className="border-b border-border bg-muted/30">
                                                        <th className="px-3 py-3 w-10">
                                                            <button title="Add row" className="h-7 w-7 rounded-full bg-foreground/90 text-background flex items-center justify-center hover:bg-foreground transition-colors">
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Product Number</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Description</th>
                                                        <th
                                                            className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3"
                                                            title={
                                                                'Catalog verification — each SKU is checked against the Strata Catalog Database (vendor catalogs + historical orders + replacement catalogs). ' +
                                                                'Verified = the SKU exists and is active. Sync = the SKU is not in the catalog; click for AI-suggested replacements. ' +
                                                                'Source: Strata internal catalog + vendor feed (last refreshed 12h ago).'
                                                            }
                                                        >
                                                            <span className="inline-flex items-center gap-1 cursor-help">
                                                                Verification
                                                                <Info className="h-3 w-3 text-muted-foreground/70" />
                                                            </span>
                                                        </th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Catalog<br/>Code</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Manufacturer<br/>Code</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Quantity</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">UOM</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">List Price</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Sell Price</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Product Cost</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Discount</th>
                                                        <th className="px-3 py-3 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {lineItems.map(li => (
                                                        <tr key={li.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                                                            <td className="px-3 py-3"></td>
                                                            <td className="px-3 py-3"><EditableValue value={li.productNumber} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={li.description} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><CatalogVerifyPill sku={li.productNumber} onUseReplacement={handleReplaceSku} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={li.catalogCode || '—'} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={li.manufacturerCode || '—'} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={String(li.quantity)} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={li.uom} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={formatCurrency(li.listPrice)} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={formatCurrency(li.sellPrice)} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={formatCurrency(li.productCost)} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={`${li.discount.toFixed(2)}%`} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3 text-right">
                                                                <button aria-label="Remove line" className="p-1 rounded-md text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/15 transition-colors">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-muted/20 font-bold">
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3 text-sm text-foreground">{totals.qty}</td>
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3 text-sm text-foreground">{formatCurrency(totals.list)}</td>
                                                        <td className="px-3 py-3 text-sm text-foreground">{formatCurrency(totals.sell)}</td>
                                                        <td className="px-3 py-3 text-sm text-foreground">{formatCurrency(totals.cost)}</td>
                                                        <td className="px-3 py-3 text-sm text-foreground">0.00</td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {tab === 'linked' && (
                                    <div className="max-w-3xl space-y-5">
                                        {/* F84.24 · Diego 2026-08-21 · attached files section for W-9
                                            and Proforma docs · shows the source PDF as linked plus
                                            the compliance folder link · gives the Linked Documents
                                            tab something to render for docs that don't have an
                                            upstream lifecycle chain (Quote-type W-9 / Proforma).
                                            Structural adaptation to the vendor prod-import ·
                                            preserve on re-sync. */}
                                        {(/\bW-?9\b/i.test(doc.name) || /\bproforma\b/i.test(doc.name)) && (
                                            <div className="border-2 border-ai/40 rounded-xl overflow-hidden">
                                                <div className="bg-ai-light px-4 py-2.5 flex items-center gap-2">
                                                    <Link2 className="h-4 w-4 text-ai" aria-hidden="true" />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-ai">Attached files</span>
                                                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-success/15 text-success">
                                                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                        Linked · date-indexed
                                                    </span>
                                                </div>
                                                <div className="divide-y divide-border">
                                                    <div className="flex items-center gap-3 px-4 py-3">
                                                        <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                                                            <FileText className="h-5 w-5 text-foreground" aria-hidden="true" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-bold text-foreground truncate">{doc.name}</div>
                                                            <div className="text-[11px] text-muted-foreground">Source PDF · {doc.date} · OCR confidence 92%</div>
                                                        </div>
                                                        <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-md px-2 py-1 transition-colors">
                                                            <Eye className="h-3 w-3" aria-hidden="true" />
                                                            Preview
                                                        </button>
                                                        <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-md px-2 py-1 transition-colors">
                                                            <Download className="h-3 w-3" aria-hidden="true" />
                                                            Download
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-3 px-4 py-3">
                                                        <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                                                            <Link2 className="h-5 w-5 text-foreground" aria-hidden="true" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-bold text-foreground truncate">Compliance folder · {doc.vendor}</div>
                                                            <div className="text-[11px] text-muted-foreground">SharePoint mirror · index this doc · expiration alerts scheduled</div>
                                                        </div>
                                                        <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-md px-2 py-1 transition-colors">
                                                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                                            Open folder
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-2">
                                            <Link2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">Document lifecycle</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Source documents that led to this one — upstream in the Quote → PO → Acknowledgment → Invoice flow.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Per stakeholder (Reynier · 29-jun) · el backend solo enlaza los
                                            documentos cuando pasan por human-in-the-loop y llegan a Reconciled.
                                            Si el doc no está reconciled · mostrar empty state explicativo. */}
                                        {doc.status !== 'processed' && doc.status !== 'completed' ? (
                                            <div className="flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl py-12 px-6">
                                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                                    <Link2 className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm font-semibold text-foreground">Not linked yet</p>
                                                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                                    Documents are linked automatically once they pass review and reach the <strong>Reconciled</strong> stage.
                                                    Review the fields and accept this {TYPE_NOUN[doc.type]} to trigger the link.
                                                </p>
                                            </div>
                                        ) : linkedCount === 0 ? (
                                            <div className="flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl py-12 px-6">
                                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm font-semibold text-foreground">This is the originating document</p>
                                                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                                    No upstream source documents — a {TYPE_NOUN[doc.type]} starts the transaction chain.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {chain.map((node, i) => (
                                                    <div key={node.id + i} className="relative">
                                                        {/* Connector line to the next node */}
                                                        {i < chain.length - 1 && (
                                                            <span className="absolute left-[19px] top-[44px] bottom-[-12px] w-px bg-border" aria-hidden="true" />
                                                        )}
                                                        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                                                            node.isCurrent
                                                                ? 'border-primary bg-primary/10'
                                                                : 'border-border bg-card hover:bg-muted/30'
                                                        }`}>
                                                            {/* Lifecycle node dot */}
                                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                                                                node.isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                                            }`}>
                                                                {node.isCurrent ? <FileText className="h-4 w-4" /> : <CornerDownRight className="h-4 w-4" />}
                                                            </div>

                                                            {/* Doc info */}
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-sm font-bold text-foreground truncate">{node.name}</span>
                                                                    <DocTypeChip type={node.type} size="sm" />
                                                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${relationBadgeClasses(node.relation)}`}>
                                                                        {node.relationLabel}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                                    {node.id} · {node.status} · {node.date}
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            {node.isCurrent ? (
                                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full shrink-0">You are here</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setPreviewDoc(node)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors shrink-0"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                    Preview
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            )}

                            {/* Footer · Send feedback se movió al header como prominent action */}
                            <div className="border-t border-border px-6 py-4 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-medium">{confidence}% confidence</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                            <polyline points="17 21 17 13 7 13 7 21"/>
                                            <polyline points="7 3 7 8 15 8"/>
                                        </svg>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>

        <AITrainingConsentModal
            isOpen={showConsent}
            editedCount={editedCount}
            replacedCount={replacedCount}
            onAccept={handleConsentAccept}
            onDecline={handleConsentDecline}
            onCancel={handleConsentCancel}
        />

        {/* Reuses the existing PDF preview component to render a linked document. */}
        <PdfPreviewModal
            isOpen={!!previewDoc}
            onClose={() => setPreviewDoc(null)}
            doc={previewDoc ? { id: previewDoc.id, name: previewDoc.name, vendor: previewDoc.vendor, type: previewDoc.type } : null}
        />
        </>
    )
}
