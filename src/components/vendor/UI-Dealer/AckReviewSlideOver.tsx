/**
 * SOURCE: UI-Dealer/src/components/AckReviewSlideOver.tsx
 * LIFTED: 2026-08-14 · via F74 Phase 1B.PRE
 * Do not edit in place · re-sync from source when prod evolves.
 * Adaptations belong in sibling wrappers/*.tsx files.
 */
import { X } from 'lucide-react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import { type AckComparisonReport } from './ack-comparison/ComparisonSummaryPanel'
import ComparisonStatusBadge from './ack-comparison/ComparisonStatusBadge'
import PoAckComparisonReview from './ack-comparison/PoAckComparisonReview'
import { MOCK_AIS_REPORT } from './ack-comparison/mockReports'

interface AckReviewSlideOverProps {
    open: boolean
    onClose: () => void
    poId?: string
    ackId?: string
    /** Sends the dealer's note to Expert Hub. The note may be empty. */
    onRequestExpertReview?: (note: string) => void
}

export default function AckReviewSlideOver({ open, onClose, poId, ackId, onRequestExpertReview }: AckReviewSlideOverProps) {
    const reportToUse: AckComparisonReport = {
        ...MOCK_AIS_REPORT,
        ...(poId && { poId }),
        ...(ackId && { ackId })
    }

    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <TransitionChild
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <DialogPanel className="pointer-events-auto w-screen max-w-6xl flex flex-col h-full bg-background border-l border-border shadow-2xl">
                                    {/* Header */}
                                    <div className="px-6 py-5 sm:px-8 border-b border-border bg-card">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <DialogTitle className="text-xl font-bold text-foreground">
                                                        Review Acknowledgment
                                                    </DialogTitle>
                                                    <ComparisonStatusBadge status={reportToUse.comparisonStatus} size="md" />
                                                </div>
                                                <p className="mt-1.5 text-sm text-muted-foreground">
                                                    Side-by-side preview of <span className="font-semibold text-foreground">{reportToUse.poId}</span> vs{' '}
                                                    <span className="font-semibold text-foreground">{reportToUse.ackId}</span>. Add a note and escalate to Expert Hub —
                                                    resolution happens there.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                className="shrink-0 rounded-md bg-background text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                onClick={onClose}
                                            >
                                                <span className="sr-only">Close panel</span>
                                                <X className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content (Scrollable) */}
                                    <div className="flex-1 overflow-y-auto bg-muted/20 p-6 sm:p-8 scrollbar-micro">
                                        <PoAckComparisonReview
                                            report={reportToUse}
                                            showHeading={false}
                                            resetKey={open ? `${reportToUse.ackId}-open` : 'closed'}
                                            onSendToExpert={onRequestExpertReview
                                                ? (note) => { onRequestExpertReview(note); onClose(); }
                                                : undefined
                                            }
                                        />
                                    </div>

                                    {/* Footer — close-only; the primary CTA lives next to the note inside the review */}
                                    <div className="px-6 py-4 border-t border-border bg-card flex justify-end items-center gap-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                                            onClick={onClose}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
