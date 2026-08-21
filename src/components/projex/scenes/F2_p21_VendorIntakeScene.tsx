/**
 * COMPONENT: F2_p21_VendorIntakeScene (Projex · p2.1)
 * PURPOSE: Coordinator lands in su vendor requests inbox inside the Dealer
 *          Experience · lista de 4-5 requests históricos + CTA `+ Request
 *          new vendor` que abre un modal centered con el form structured
 *          intake. Submit → confirmación in-line + CTA advance a p2.2 donde
 *          Accounting revisa. Replaces the floating form pattern (audit 2026-08-17).
 *
 * SHAPE · list landing + centered modal form (F2 primary shape · Dealer)
 * REUSE · shared/AIEmailComposer.tsx presentation="centered" pattern (Dialog)
 *         Vendor requests list · custom (MACRequests-inspired shape)
 * NOTIF · listen `projex:vendor-intake-open` (AC CTA) → open modal ·
 *         dispatch `projex:vendor-request-submitted` en submit → advance p2.2
 */

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    Sparkles, User, Paperclip, FileText, Send, CheckCircle2,
    ArrowRight, Building2, Wallet, Clock, Truck, Plus, Mail,
    MessageSquare, Circle, X, ClipboardList, Eye,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import ProjexArrivalStrip from '../ProjexArrivalStrip'
import W9DocumentPreview from '../W9DocumentPreview'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { WBD_W9 } from '../../../config/profiles/projex-data/w9Records'

interface VendorRequest {
    id: string
    vendorName: string
    initials: string
    initialsBg: string
    project: string
    submitted: string
    status: 'Approved' | 'In compliance review' | 'Rejected' | 'Draft'
    source: 'Form' | 'Email' | 'Portal'
    urgency?: 'High' | 'Medium' | 'Low'
}

const KELLY_HISTORY: VendorRequest[] = [
    { id: 'VR-2026-142', vendorName: 'Boss Design',      initials: 'BD', initialsBg: 'bg-ai/15 text-ai',            project: 'MWH residential · 12 chairs',   submitted: '3 days ago',   status: 'Approved',            source: 'Form',   urgency: 'Medium' },
    { id: 'VR-2026-141', vendorName: 'Alamir Freight',   initials: 'AL', initialsBg: 'bg-success/15 text-success',  project: 'MWH · freight surcharge',       submitted: '5 days ago',   status: 'Approved',            source: 'Form',   urgency: 'Low' },
    { id: 'VR-2026-139', vendorName: 'Digital Interior', initials: 'DI', initialsBg: 'bg-destructive/15 text-destructive', project: 'Fairport install · AP9',   submitted: '1 week ago',   status: 'In compliance review', source: 'Email',  urgency: 'High' },
    { id: 'VR-2026-137', vendorName: 'Ryan Landscape',   initials: 'RL', initialsBg: 'bg-muted text-muted-foreground', project: 'NCBA exterior · out of scope', submitted: '2 weeks ago', status: 'Rejected',            source: 'Form',   urgency: 'Low' },
]

const STATUS_STYLES: Record<VendorRequest['status'], string> = {
    'Approved':               'bg-success/10 text-success border-success/20',
    'In compliance review':   'bg-warning/10 text-warning border-warning/30',
    'Rejected':               'bg-destructive/10 text-destructive border-destructive/30',
    'Draft':                  'bg-muted text-muted-foreground border-border',
}

const SOURCE_ICON: Record<VendorRequest['source'], React.ElementType> = {
    'Form':   ClipboardList,
    'Email':  Mail,
    'Portal': MessageSquare,
}

type SubmitState = 'idle' | 'submitting' | 'submitted'

export default function F2_p21_VendorIntakeScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const kelly = PROJEX_PERSONAS.kelly
    const daniel = PROJEX_PERSONAS.daniel

    const [modalOpen, setModalOpen] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [submitState, setSubmitState] = useState<SubmitState>('idle')

    // Action Center CTA `Open intake form →` dispatchea `projex:vendor-intake-open`
    // (ver PROJEX_STEP_NOTIFICATIONS['p2.1']) · abre el modal automatically.
    useEffect(() => {
        const open = () => {
            if (submitState === 'idle') setModalOpen(true)
        }
        window.addEventListener('projex:vendor-intake-open', open)
        return () => window.removeEventListener('projex:vendor-intake-open', open)
    }, [submitState])

    const handleSubmit = () => {
        if (submitState !== 'idle') return
        setSubmitState('submitting')
        pauseAwareTimeout(() => {
            setSubmitState('submitted')
            setModalOpen(false)
            window.dispatchEvent(new CustomEvent('projex:vendor-request-submitted'))
        }, 900)
    }
    // Compose the "just landed" row for the submitted state
    const justLanded: VendorRequest | null = submitState === 'submitted' ? {
        id: 'VR-2026-143',
        vendorName: 'Warehouse by Design',
        initials: 'WB',
        initialsBg: 'bg-destructive/15 text-destructive',
        project: 'Denver Financial install · Aug 12-13 · AP9',
        submitted: 'Just now',
        status: 'In compliance review',
        source: 'Form',
        urgency: 'High',
    } : null

    const rows = justLanded ? [justLanded, ...KELLY_HISTORY] : KELLY_HISTORY

    return (
        <>
            <ProjexArrivalStrip
                breadcrumb={['Dealer Experience', 'MAC & Requests', 'Vendors']}
                focus={{
                    label: 'Coordinator · new vendor request pending',
                    icon: <User className="h-3 w-3" aria-hidden="true" />,
                    tone: 'primary',
                }}
                hint={submitState === 'submitted' ? 'Request landed · Accounting queue' : `${KELLY_HISTORY.length} past requests`}
            />

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
                {/* Header */}
                <div>
            <h1 className="text-2xl font-bold text-foreground">
                        {kelly.fullName.split(' ')[0]}&apos;s vendor requests · submit new · structured intake
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Coordinator lands in su queue de requests inside the Dealer Experience · click <strong className="text-foreground">Request new vendor</strong> abre el form structured (VS1 fix · replaces the free-text email a Accounting).
                    </p>
                </div>

                {/* Inbox card */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {/* Inbox header · title + New button */}
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            My vendor requests · {rows.length}
                        </span>
                        <span className="ml-auto flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                                <Circle className="h-1.5 w-1.5 fill-success text-success" aria-hidden="true" />
                                Dealer Experience · live
                            </span>
                            <button
                                onClick={() => setModalOpen(true)}
                                disabled={submitState === 'submitted'}
                                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                Request new vendor
                            </button>
                        </span>
                    </div>

                    {/* Rows */}
                    <ul className="divide-y divide-border">
                        {rows.map(row => {
                            const isJustLanded = row.id === justLanded?.id
                            const SourceIcon = SOURCE_ICON[row.source]
                            return (
                                <li
                                    key={row.id}
                                    className={`
                                        px-4 py-3 flex items-start gap-3 transition-colors
                                        ${isJustLanded ? 'bg-ai-light/40 ring-1 ring-inset ring-ai/40 animate-in fade-in slide-in-from-top-2 duration-500' : 'hover:bg-muted/30'}
                                    `}
                                >
                                    <div className={`h-8 w-8 rounded-full ${row.initialsBg} flex items-center justify-center shrink-0 text-[10px] font-bold`}>
                                        {row.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-foreground">{row.vendorName}</span>
                                            <span className="text-[10px] font-mono text-muted-foreground">{row.id}</span>
                                            <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 border ${STATUS_STYLES[row.status]}`}>
                                                {row.status}
                                            </span>
                                            {isJustLanded && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-ai-light text-ai rounded px-1.5 py-0.5 inline-flex items-center gap-1">
                                                    <Sparkles className="h-2.5 w-2.5" aria-hidden="true" /> Just landed
                                                </span>
                                            )}
                                            <span className="ml-auto text-[10px] font-mono text-muted-foreground shrink-0">
                                                {row.submitted}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                                            <span className="truncate">{row.project}</span>
                                            <span className="text-muted-foreground/50">·</span>
                                            <span className="inline-flex items-center gap-1">
                                                <SourceIcon className="h-3 w-3" aria-hidden="true" />
                                                {row.source}
                                            </span>
                                            {row.urgency && (
                                                <>
                                                    <span className="text-muted-foreground/50">·</span>
                                                    <span className={
                                                        row.urgency === 'High' ? 'text-destructive font-semibold' :
                                                        row.urgency === 'Medium' ? 'text-warning font-semibold' :
                                                        'text-muted-foreground'
                                                    }>
                                                        {row.urgency} urgency
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>

                    {/* Footer · counters */}
                    <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{rows.length} requests</span>
                        <span className="text-muted-foreground/50">·</span>
                        <span>{rows.filter(r => r.status === 'Approved').length} approved</span>
                        <span className="text-muted-foreground/50">·</span>
                        <span>{rows.filter(r => r.status === 'In compliance review').length} in review</span>
                        <span className="text-muted-foreground/50">·</span>
                        <span>{rows.filter(r => r.status === 'Rejected').length} rejected</span>
                    </div>
                </div>

                {/* Confirmation banner + advance CTA · appears after submit */}
                {submitState === 'submitted' && (
                    <div className="rounded-xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground">Request landed in Accounting queue</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                Accounting will review the W-9 + preflight next · nothing hits NetSuite until compliance sign-off.
                            </div>
                        </div>
                        <button
                            onClick={nextStep}
                            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-primary text-primary-foreground py-2 px-3 hover:opacity-90 transition-opacity shadow-sm"
                        >
                            Continue to compliance review
                            <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </button>
                    </div>
                )}

                {/* Anchor · why structured intake */}
                <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
                    <Truck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-xs">
                        <div className="text-foreground font-semibold">Why structured intake matters (VS1)</div>
                        <div className="text-muted-foreground mt-0.5">
                            Free-text email a Accounting bloquea every other payment run · structured intake carries provenance · W-9 upfront · triggers OCR + preflight automatically · Accounting solo reviews.
                        </div>
                    </div>
                </div>

            </div>

            {/* Centered modal · intake form */}
            <Transition appear show={modalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[300]" onClose={() => setModalOpen(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-start justify-center p-4 pt-16">
                            <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                                    {/* Modal header */}
                                    <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-ai" aria-hidden="true" />
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-foreground">New vendor request · structured intake</div>
                                            <div className="text-[11px] text-muted-foreground">Form auto-fills with pre-drafted content for Warehouse by Design</div>
                                        </div>
                                        <button onClick={() => setModalOpen(false)} aria-label="Close" className="ml-auto h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Modal body */}
                                    <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                                        {/* Vendor name */}
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Vendor name</label>
                                            <div className="mt-1 rounded-lg border border-primary/40 bg-background px-3 py-2 text-sm font-medium text-foreground">
                                                Warehouse by Design
                                            </div>
                                        </div>

                                        {/* Reason */}
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Why this vendor · project + scope</label>
                                            <div className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                                                Denver Financial · install crew for phase 2 · Aug 12-13 · quote $3,200 · AP9 install pattern (bills without PO # · needs PM double-check).
                                            </div>
                                        </div>

                                        {/* Payment method + Terms */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Payment method</label>
                                                <div className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground inline-flex items-center gap-1.5 w-full">
                                                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                                    ACH
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Terms</label>
                                                <div className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground inline-flex items-center gap-1.5 w-full">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                                    Net 10
                                                </div>
                                            </div>
                                        </div>

                                        {/* W-9 attach · click to preview */}
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">W-9 attachment</label>
                                            <button
                                                type="button"
                                                onClick={() => setPreviewOpen(true)}
                                                className="w-full mt-1 rounded-lg border-2 border-dashed border-success/40 bg-success/5 px-3 py-4 text-sm hover:bg-success/10 hover:border-success/60 transition-colors group text-left"
                                                aria-label="Preview W-9 document"
                                            >
                                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                                    <FileText className="h-4 w-4 text-success" aria-hidden="true" />
                                                    <span className="text-foreground font-medium">{WBD_W9.fileName}</span>
                                                    <span className="text-[10px] text-muted-foreground tabular-nums">312 KB · signed 2026-03-12</span>
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground bg-background border border-border rounded px-1.5 py-0.5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                                                        <Eye className="h-3 w-3" aria-hidden="true" />
                                                        Preview
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Modal footer */}
                                    <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center gap-2">
                                        <span className="text-[10px] text-muted-foreground flex-1">
                                            Ticket enters Accounting&apos;s queue on submit · nothing sent to NetSuite until compliance sign-off.
                                        </span>
                                        <button
                                            onClick={() => setModalOpen(false)}
                                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground bg-background hover:bg-muted border border-border rounded-md px-2.5 py-1.5 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitState !== 'idle'}
                                            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
                                        >
                                            {submitState === 'submitting' ? (
                                                <>
                                                    <Sparkles className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
                                                    Submitting…
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Submit request
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* W-9 document preview · mock (no real PDF for fictional vendor) */}
            <W9DocumentPreview
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                record={WBD_W9}
            />
        </>
    )
}
