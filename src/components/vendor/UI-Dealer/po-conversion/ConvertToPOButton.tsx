/**
 * SDB-1315 · FE-01 — ConvertToPOButton
 *
 * Entry-point CTA that starts a quote-to-PO conversion. Renders on the
 * quote detail page when the quote is APPROVED and no active conversion
 * exists.
 *
 * Flow: click → confirmation dialog → initiateQuoteConversion → redirect
 *
 * Gap fixes vs Jira:
 *   · Added confirmation dialog before initiating (was direct click)
 *   · Added hasActiveConversion prop to disable when one exists
 */

import { useState } from 'react'
import { Fragment } from 'react'
import { clsx } from 'clsx'
import { ArrowRight, AlertTriangle, Loader2, Package, X } from 'lucide-react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { useInitiateConversion } from './hooks'

interface ConvertToPOButtonProps {
    quoteId: string
    quoteStatus: string
    /** True when a conversion is already in progress for this quote. */
    hasActiveConversion?: boolean
    /** Fires when conversion completes — parent navigates to review page. */
    onConversionStarted?: (quoteId: string) => void
}

export default function ConvertToPOButton({
    quoteId,
    quoteStatus,
    hasActiveConversion = false,
    onConversionStarted,
}: ConvertToPOButtonProps) {
    const { loading, error, execute } = useInitiateConversion()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [showError, setShowError] = useState(false)

    const isApproved = quoteStatus === 'APPROVED'
    const canConvert = isApproved && !hasActiveConversion

    const handleConfirm = async () => {
        setShowError(false)
        try {
            await execute()
            setDialogOpen(false)
            onConversionStarted?.(quoteId)
        } catch {
            setShowError(true)
        }
    }

    const disabledReason = !isApproved
        ? 'Quote must be approved first'
        : hasActiveConversion
          ? 'A conversion is already in progress'
          : undefined

    return (
        <>
            <button
                type="button"
                onClick={() => canConvert && setDialogOpen(true)}
                disabled={!canConvert}
                title={disabledReason}
                className={clsx(
                    'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200',
                    canConvert
                        ? 'bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:opacity-90 shadow-sm'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
            >
                <Package className="w-4 h-4" />
                Convert to Purchase Orders
                <ArrowRight className="w-4 h-4" />
            </button>

            {/* Confirmation dialog (FE-01 requirement) */}
            <Transition show={dialogOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-[100]"
                    onClose={() => !loading && setDialogOpen(false)}
                >
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm" />
                    </TransitionChild>

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl overflow-hidden">
                                <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
                                    <div className="p-3 rounded-xl bg-primary/10">
                                        <Package className="w-5 h-5 text-foreground dark:text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <DialogTitle className="text-base font-bold text-foreground">
                                            Convert to Purchase Orders?
                                        </DialogTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This will freeze a snapshot of the current quote and split
                                            the line items by vendor into separate PO drafts.
                                        </p>
                                    </div>
                                    {!loading && (
                                        <button
                                            onClick={() => setDialogOpen(false)}
                                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="px-6 py-4 space-y-3">
                                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                        <span>
                                            The snapshot will be valid for 72 hours. You can review
                                            and approve the vendor split before any PO is sent.
                                        </span>
                                    </div>
                                </div>

                                {showError && (
                                    <div className="px-6 py-3 bg-red-500/5 text-xs text-red-600 dark:text-red-400 font-semibold">
                                        Conversion failed. Please try again.
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
                                    <button
                                        type="button"
                                        onClick={() => setDialogOpen(false)}
                                        disabled={loading}
                                        className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirm}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Converting…
                                            </>
                                        ) : (
                                            <>
                                                <Package className="w-3.5 h-3.5" />
                                                Convert
                                            </>
                                        )}
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}
