/**
 * SDB-1315 · FE-06 — SubmitPODialog
 *
 * Sends a FINALIZED PO to the vendor via the selected adapter (EDI /
 * Email / Portal). Three-phase UI: compose → sending → result.
 *
 * On success the status transitions to SUBMITTED. On failure the dialog
 * stays open and shows the error detail with a retry CTA and a link to
 * try a different adapter.
 */

import { useState } from 'react'
import { clsx } from 'clsx'
import {
    AlertTriangle,
    CheckCircle2,
    Globe,
    Loader2,
    Mail,
    MonitorSmartphone,
    Send,
    X,
} from 'lucide-react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import type { SubmissionAdapter } from './types'
import { useSubmitPO } from './hooks'

interface SubmitPODialogProps {
    isOpen: boolean
    poNumber: string
    vendorName: string
    totalAmount: number
    onClose: () => void
    onSubmitted?: () => void
}

type Phase = 'compose' | 'sending' | 'success' | 'failed'

const ADAPTERS: Array<{
    id: SubmissionAdapter
    label: string
    description: string
    icon: typeof Send
}> = [
    {
        id: 'edi',
        label: 'EDI',
        description: 'Automated electronic data interchange — fastest option',
        icon: MonitorSmartphone,
    },
    {
        id: 'email',
        label: 'Email',
        description: 'Send a formatted email to the vendor contact',
        icon: Mail,
    },
    {
        id: 'portal',
        label: 'Vendor Portal',
        description: "Submit via the vendor's self-service portal",
        icon: Globe,
    },
]

const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function SubmitPODialog({
    isOpen,
    poNumber,
    vendorName,
    totalAmount,
    onClose,
    onSubmitted,
}: SubmitPODialogProps) {
    const [adapter, setAdapter] = useState<SubmissionAdapter>('edi')
    const [notes, setNotes] = useState('')
    const [phase, setPhase] = useState<Phase>('compose')
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const { execute } = useSubmitPO()

    const reset = () => {
        setPhase('compose')
        setErrorMsg(null)
        setNotes('')
        setAdapter('edi')
    }

    const handleClose = () => {
        if (phase === 'sending') return
        reset()
        onClose()
    }

    const handleSubmit = async () => {
        setPhase('sending')
        setErrorMsg(null)
        try {
            await execute()
            setPhase('success')
            onSubmitted?.()
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Submission failed')
            setPhase('failed')
        }
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={handleClose}>
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
                        {/* FE-15: full-screen on mobile (<768px), card on desktop */}
                        <DialogPanel className="w-full max-w-lg bg-card dark:bg-zinc-800 rounded-2xl md:rounded-2xl border border-border shadow-2xl overflow-hidden max-md:fixed max-md:inset-0 max-md:rounded-none max-md:max-w-none max-md:border-0">

                            {/* Header */}
                            <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
                                <div className="p-3 rounded-xl bg-green-500/10">
                                    <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-base font-bold text-foreground">
                                        Submit {poNumber}
                                    </DialogTitle>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {vendorName} · {fmt(totalAmount)}
                                    </p>
                                </div>
                                {phase !== 'sending' && (
                                    <button
                                        onClick={handleClose}
                                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* ── Compose phase ─────────────────────── */}
                            {phase === 'compose' && (
                                <div className="p-6 space-y-4">
                                    {/* Adapter picker */}
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            Delivery method
                                        </label>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            {ADAPTERS.map((a) => {
                                                const Icon = a.icon
                                                const selected = adapter === a.id
                                                return (
                                                    <button
                                                        key={a.id}
                                                        type="button"
                                                        onClick={() => setAdapter(a.id)}
                                                        className={clsx(
                                                            'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all',
                                                            selected
                                                                ? 'bg-primary/10 border-primary/40 ring-2 ring-primary/30'
                                                                : 'bg-card dark:bg-zinc-900 border-border hover:border-primary/30'
                                                        )}
                                                    >
                                                        <Icon className={clsx('w-5 h-5', selected ? 'text-foreground dark:text-primary' : 'text-muted-foreground')} />
                                                        <span className="text-[10px] font-bold text-foreground">{a.label}</span>
                                                        <span className="text-[9px] text-muted-foreground leading-tight">{a.description}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label
                                                htmlFor="submit-notes"
                                                className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
                                            >
                                                Notes (optional)
                                            </label>
                                            <span className="text-[9px] text-muted-foreground tabular-nums">
                                                {notes.length}/500
                                            </span>
                                        </div>
                                        <textarea
                                            id="submit-notes"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                                            rows={3}
                                            placeholder="Add a note for the vendor…"
                                            className="mt-1.5 w-full resize-none rounded-lg bg-card dark:bg-zinc-900 border border-border px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ── Sending phase ─────────────────────── */}
                            {phase === 'sending' && (
                                <div className="px-6 py-12 flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    <p className="text-sm font-semibold text-foreground">
                                        Submitting to {vendorName}…
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        via {ADAPTERS.find((a) => a.id === adapter)?.label}
                                    </p>
                                </div>
                            )}

                            {/* ── Success phase ─────────────────────── */}
                            {phase === 'success' && (
                                <div className="px-6 py-10 flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="w-14 h-14 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                                        <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="text-sm font-bold text-foreground">
                                        PO submitted successfully
                                    </p>
                                    <p className="text-[11px] text-muted-foreground text-center max-w-xs">
                                        {poNumber} has been sent to {vendorName} via{' '}
                                        {ADAPTERS.find((a) => a.id === adapter)?.label}.
                                    </p>
                                </div>
                            )}

                            {/* ── Failed phase ──────────────────────── */}
                            {phase === 'failed' && (
                                <div className="px-6 py-8 flex flex-col items-center justify-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center">
                                        <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
                                    </div>
                                    <p className="text-sm font-bold text-foreground">
                                        Submission failed
                                    </p>
                                    <p className="text-[11px] text-muted-foreground text-center max-w-xs">
                                        {errorMsg || 'An unknown error occurred.'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                        >
                                            Retry
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPhase('compose')}
                                            className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                        >
                                            Try different method
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            {(phase === 'compose' || phase === 'success') && (
                                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        {phase === 'success' ? 'Done' : 'Cancel'}
                                    </button>
                                    {phase === 'compose' && (
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-green-600 text-white hover:opacity-90 transition-opacity"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            Submit to vendor
                                        </button>
                                    )}
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
