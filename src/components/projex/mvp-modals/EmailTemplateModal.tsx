/**
 * F84 · EmailTemplateModal · reusable email template send.
 * Used by F4 p4.3 (PO dispatch email) + F5 p5.3 (approval chain email).
 *
 * Prod shape reference: expert-hub / quote-converter compose modals ·
 * header (icon + short title + status pill · muted meta strip) · body =
 * subject + recipient chips + body preview + optional AI polish · footer =
 * Cancel + Send. F83.S positioning contract.
 */

import { Fragment, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    Mail, Send, CheckCircle2, Loader2, X, Sparkles,
} from 'lucide-react'

interface Recipient {
    name: string
    email: string
    role?: string
}

interface EmailTemplateModalProps {
    isOpen: boolean
    onClose: () => void
    onSent?: () => void
    title: string
    metaLine: string
    recipients: Recipient[]
    subject: string
    body: string
    sendLabel?: string
    sentMessage?: string
}

export default function EmailTemplateModal({
    isOpen,
    onClose,
    onSent,
    title,
    metaLine,
    recipients,
    subject,
    body,
    sendLabel = 'Send',
    sentMessage = 'Sent',
}: EmailTemplateModalProps) {
    const [stage, setStage] = useState<'idle' | 'sending' | 'sent'>('idle')

    const handleSend = () => {
        if (stage !== 'idle') return
        setStage('sending')
        setTimeout(() => {
            setStage('sent')
            onSent?.()
        }, 900)
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[400]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-y-0 right-0 left-0 md:left-[320px] bg-foreground/50 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>
                <div className="fixed inset-0 flex items-start justify-center p-4 sm:p-8 md:pl-[336px] overflow-y-auto">
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <DialogPanel className="w-full max-w-2xl my-auto bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]">
                            {/* Header */}
                            <div className="p-5 border-b border-border">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                                        <h2 className="text-base font-bold text-foreground">{title}</h2>
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${stage === 'sent' ? 'bg-success/15 text-success' : 'bg-ai-light text-ai'}`}>
                                            {stage === 'sent'
                                                ? <><CheckCircle2 className="h-3 w-3" aria-hidden="true" /> {sentMessage}</>
                                                : <><Sparkles className="h-3 w-3" aria-hidden="true" /> AI drafted · human review</>}
                                        </span>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        aria-label="Close email"
                                        className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                                    >
                                        <X className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="text-xs text-muted-foreground">{metaLine}</div>
                            </div>

                            {/* Body · email compose */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
                                <div className="grid grid-cols-[60px_1fr] gap-y-2 gap-x-3 text-xs">
                                    <span className="text-muted-foreground">To</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {recipients.map(r => (
                                            <span key={r.email} className="inline-flex items-center gap-1 bg-muted/50 border border-border rounded-full px-2 py-0.5">
                                                <span className="text-foreground font-medium">{r.name}</span>
                                                {r.role && <span className="text-muted-foreground">· {r.role}</span>}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-muted-foreground">Subject</span>
                                    <span className="text-foreground font-semibold">{subject}</span>
                                </div>
                                <div className="pt-3 border-t border-border">
                                    <div className="text-foreground leading-relaxed whitespace-pre-line text-[13px]">
                                        {body}
                                    </div>
                                </div>
                            </div>

                            {/* Footer · Send */}
                            <div className="px-5 py-4 border-t border-border bg-muted/10 flex items-center gap-3">
                                <div className="text-xs text-muted-foreground flex-1">
                                    Human sign-off preserved · Strata drafts · Coordinator sends.
                                </div>
                                {stage === 'idle' && (
                                    <>
                                        <button
                                            onClick={onClose}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-lg px-3 py-2 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                        >
                                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                            {sendLabel}
                                        </button>
                                    </>
                                )}
                                {stage === 'sending' && (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ai py-2 px-4">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                        Sending…
                                    </div>
                                )}
                                {stage === 'sent' && (
                                    <button
                                        onClick={onClose}
                                        className="inline-flex items-center gap-1.5 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                        Continue
                                    </button>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
