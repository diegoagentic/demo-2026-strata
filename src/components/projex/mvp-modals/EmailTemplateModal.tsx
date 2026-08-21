/**
 * F84 · EmailTemplateModal · reusable email template send.
 * Used by F4 p4.3 (PO dispatch email) + F5 p5.3 (approval chain email).
 *
 * Prod shape reference: expert-hub / quote-converter compose modals ·
 * header (icon + short title + status pill · muted meta strip) · body =
 * subject + recipient chips + body preview + optional AI polish · footer =
 * Cancel + Send. F83.S positioning contract.
 *
 * F84.8 · Diego 2026-08-21 · recipient picker · when the scene passes
 * `suggestedRecipients`, the modal shows a small picker where the sender
 * can add/remove chips before hitting Send. Backwards-compatible · when
 * only `recipients` is passed the modal renders the original static chips.
 */

import { Fragment, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    Mail, Send, CheckCircle2, Loader2, X, Sparkles, Plus, RotateCcw,
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
    /** F84.8 · optional pool of extra recipients the sender can add via a
     *  small picker (chip list). If provided, the header switches to
     *  "Choose recipients" style with add/remove affordances. */
    suggestedRecipients?: Recipient[]
    subject: string
    body: string
    sendLabel?: string
    sentMessage?: string
}

/** F84.9 · Strata AI suggestions per tone/operation. Each rewrites the
 *  body in place · presenter can revert to the original draft anytime. */
type SuggestionMode = 'friendlier' | 'firmer' | 'shorter' | 'add-totals'
interface Suggestion {
    id: SuggestionMode
    label: string
    icon: 'sparkles'
    /** Rewriter that receives the current body and returns a new draft. */
    rewrite: (body: string) => string
}

const DEFAULT_SUGGESTIONS: Suggestion[] = [
    {
        id: 'friendlier',
        label: 'Friendlier',
        icon: 'sparkles',
        rewrite: (body) =>
            body
                .replace(/^Hi team,?\s*/im, 'Hi team, hope you\'re having a great week —\n\n')
                .replace(/Please acknowledge with ESDs at your earliest convenience\./i,
                    'Whenever it\'s convenient, could you send back the ESDs? Really appreciate the quick turnaround.')
                .replace(/Please approve or flag/i, 'Whenever you get a moment, could you approve or flag'),
    },
    {
        id: 'firmer',
        label: 'Firmer',
        icon: 'sparkles',
        rewrite: (body) =>
            body
                .replace(/^Hi team,?\s*/im, 'Team,\n\n')
                .replace(/Please acknowledge with ESDs at your earliest convenience\./i,
                    'Please return the ESDs today · install schedule cannot slip.')
                .replace(/Please approve or flag/i, 'Please approve or flag today')
                .replace(/Thanks,/i, 'Regards,'),
    },
    {
        id: 'shorter',
        label: 'Shorter',
        icon: 'sparkles',
        rewrite: (body) => {
            const lines = body.split('\n').filter(l => l.trim().length > 0)
            const head = lines.slice(0, 2).join('\n')
            const tail = lines[lines.length - 1] ?? ''
            return `${head}\n\nDetails attached · please acknowledge.\n\n${tail}`
        },
    },
    {
        id: 'add-totals',
        label: 'Add totals',
        icon: 'sparkles',
        rewrite: (body) =>
            body.includes('Grand total')
                ? body
                : body.replace(/(Please acknowledge|Please approve|Whenever)/i,
                    'Grand total across all POs · $487,320 (26 orders · 6 anchor vendors).\n\n$1'),
    },
]

export default function EmailTemplateModal({
    isOpen,
    onClose,
    onSent,
    title,
    metaLine,
    recipients,
    suggestedRecipients,
    subject,
    body,
    sendLabel = 'Send',
    sentMessage = 'Sent',
}: EmailTemplateModalProps) {
    const [stage, setStage] = useState<'idle' | 'sending' | 'sent'>('idle')
    const [selected, setSelected] = useState<Recipient[]>(recipients)
    /** F84.9 · editable subject + body. Track original for revert. */
    const [editableSubject, setEditableSubject] = useState(subject)
    const [editableBody, setEditableBody] = useState(body)
    const [activeSuggestion, setActiveSuggestion] = useState<SuggestionMode | null>(null)

    const handleSend = () => {
        if (stage !== 'idle') return
        setStage('sending')
        setTimeout(() => {
            setStage('sent')
            onSent?.()
        }, 900)
    }

    const removeRecipient = (email: string) => {
        setSelected(prev => prev.filter(r => r.email !== email))
    }
    const addRecipient = (r: Recipient) => {
        setSelected(prev => (prev.some(x => x.email === r.email) ? prev : [...prev, r]))
    }
    const applySuggestion = (s: Suggestion) => {
        setEditableBody(s.rewrite(editableBody))
        setActiveSuggestion(s.id)
    }
    const resetContent = () => {
        setEditableSubject(subject)
        setEditableBody(body)
        setActiveSuggestion(null)
    }
    const isEdited = editableSubject !== subject || editableBody !== body

    const pool = suggestedRecipients ?? []
    const availableFromPool = pool.filter(r => !selected.some(x => x.email === r.email))
    const showPicker = pool.length > 0

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
                                    <span className="text-muted-foreground pt-1">To</span>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-1.5">
                                            {selected.map(r => (
                                                <span key={r.email} className="inline-flex items-center gap-1 bg-muted/50 border border-border rounded-full pl-2 pr-1 py-0.5">
                                                    <span className="text-foreground font-medium">{r.name}</span>
                                                    {r.role && <span className="text-muted-foreground">· {r.role}</span>}
                                                    {showPicker && stage === 'idle' && (
                                                        <button
                                                            onClick={() => removeRecipient(r.email)}
                                                            aria-label={`Remove ${r.name}`}
                                                            className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                        >
                                                            <X className="h-3 w-3" aria-hidden="true" />
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                            {selected.length === 0 && (
                                                <span className="text-[11px] italic text-muted-foreground">No recipients selected · add at least one below.</span>
                                            )}
                                        </div>

                                        {showPicker && stage === 'idle' && availableFromPool.length > 0 && (
                                            <div className="pt-2 border-t border-border/60 space-y-1.5">
                                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                                                    Suggested
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {availableFromPool.map(r => (
                                                        <button
                                                            key={r.email}
                                                            onClick={() => addRecipient(r)}
                                                            className="inline-flex items-center gap-1 bg-background border border-dashed border-border rounded-full pl-1.5 pr-2 py-0.5 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/50 transition-colors"
                                                        >
                                                            <Plus className="h-3 w-3" aria-hidden="true" />
                                                            <span className="font-medium">{r.name}</span>
                                                            {r.role && <span className="opacity-70">· {r.role}</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <span className="text-muted-foreground pt-1">Subject</span>
                                    {stage === 'idle' ? (
                                        <input
                                            type="text"
                                            value={editableSubject}
                                            onChange={(e) => setEditableSubject(e.target.value)}
                                            className="w-full text-foreground font-semibold text-xs bg-background border border-input rounded-md px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                        />
                                    ) : (
                                        <span className="text-foreground font-semibold">{editableSubject}</span>
                                    )}
                                </div>

                                {/* F84.9 · Strata AI suggestion toolbar · rewrites the body
                                    in place · presenter reverts anytime. */}
                                {stage === 'idle' && (
                                    <div className="pt-3 border-t border-border">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                                                <Sparkles className="h-3 w-3 text-ai" aria-hidden="true" />
                                                Strata suggestions
                                            </span>
                                            {DEFAULT_SUGGESTIONS.map(s => {
                                                const active = activeSuggestion === s.id
                                                return (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => applySuggestion(s)}
                                                        className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-1 border transition-colors ${
                                                            active
                                                                ? 'bg-ai-light text-ai border-ai/50'
                                                                : 'bg-background text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground'
                                                        }`}
                                                    >
                                                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                                                        {s.label}
                                                    </button>
                                                )
                                            })}
                                            {isEdited && (
                                                <button
                                                    onClick={resetContent}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ml-auto"
                                                    title="Restore original draft"
                                                >
                                                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                        <textarea
                                            value={editableBody}
                                            onChange={(e) => { setEditableBody(e.target.value); setActiveSuggestion(null) }}
                                            rows={12}
                                            className="w-full text-foreground leading-relaxed text-[13px] bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 resize-y whitespace-pre-line"
                                        />
                                    </div>
                                )}
                                {stage !== 'idle' && (
                                    <div className="pt-3 border-t border-border">
                                        <div className="text-foreground leading-relaxed whitespace-pre-line text-[13px]">
                                            {editableBody}
                                        </div>
                                    </div>
                                )}
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
                                            disabled={selected.length === 0}
                                            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                            {sendLabel}
                                            {showPicker && selected.length > 0 && (
                                                <span className="ml-1 text-[10px] font-semibold opacity-80">· {selected.length}</span>
                                            )}
                                        </button>
                                    </>
                                )}
                                {stage === 'sending' && (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ai py-2 px-4">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                        Sending to {selected.length} recipient{selected.length === 1 ? '' : 's'}…
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
