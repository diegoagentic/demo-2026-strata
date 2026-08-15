/**
 * SDB-1315 · FE-05 — FinalizePOButton
 *
 * Two-step transition DRAFT → FINALIZED. Click opens a confirm dialog
 * that warns the user line items will be locked. On success the button
 * becomes a disabled "Finalized ✓" indicator.
 *
 * States:
 *   · DRAFT     → "Finalize PO" (active)
 *   · confirm   → dialog open with warning text
 *   · loading   → spinner inside the dialog confirm CTA
 *   · FINALIZED → "Finalized ✓" (disabled success)
 *   · SUBMITTED → hidden
 */

import { useState } from 'react'
import { clsx } from 'clsx'
import { Check, Loader2, Lock, X } from 'lucide-react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import type { POStatus } from './types'
import { useFinalizePO } from './hooks'

interface FinalizePOButtonProps {
    poNumber: string
    status: POStatus
    /** Whether the current user has the dealer_admin role. Default true for demo. */
    hasDealerAdminRole?: boolean
    onFinalized?: () => void
}

export default function FinalizePOButton({
    poNumber,
    status,
    hasDealerAdminRole = true,
    onFinalized,
}: FinalizePOButtonProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { loading, error, execute } = useFinalizePO()
    const [showError, setShowError] = useState(false)

    if (status === 'SUBMITTED') return null
    // FE-05: only visible when DRAFT + dealer_admin role
    if (!hasDealerAdminRole) return null

    const isFinalized = status === 'FINALIZED'
    const isDraft = status === 'DRAFT'

    const handleConfirm = async () => {
        setShowError(false)
        try {
            await execute()
            setDialogOpen(false)
            onFinalized?.()
        } catch {
            setShowError(true)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => isDraft && setDialogOpen(true)}
                disabled={!isDraft}
                className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
                    isDraft
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                        : 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30 cursor-default'
                )}
            >
                {isFinalized ? (
                    <>
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        Finalized
                    </>
                ) : (
                    <>
                        <Lock className="w-3.5 h-3.5" />
                        Finalize PO
                    </>
                )}
            </button>

            {/* Confirm dialog */}
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
                                    <div className="p-3 rounded-xl bg-amber-500/10">
                                        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <DialogTitle className="text-base font-bold text-foreground">
                                            Finalize {poNumber}?
                                        </DialogTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This locks the line items and enables vendor
                                            submission. Finalized POs cannot be edited —
                                            create a revision instead.
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

                                {showError && (
                                    <div className="px-6 py-3 bg-red-500/5 text-xs text-red-600 dark:text-red-400 font-semibold">
                                        Finalization failed. Please try again.
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-2 px-6 py-4">
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
                                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Finalizing…
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-3.5 h-3.5" />
                                                Finalize
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
