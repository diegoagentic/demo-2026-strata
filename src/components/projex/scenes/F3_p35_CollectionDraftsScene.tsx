/**
 * COMPONENT: F3_p35_CollectionDraftsScene (Projex · p3.5)
 * PURPOSE: Strata drafts 5 collection emails staged por bucket. Shared queue
 *          Isabella+Alec (FC12 fix). AIEmailComposer con Friendlier/Firmer/
 *          Shorter tone polish. Per-draft send · never batch auto.
 *
 * SHAPE · shared draft queue (left) + email composer (right)
 * REUSE · mbi/AIEmailDraftsPanel shape · shared/AIEmailComposer tone toolbar
 * NOTIF · dispatchea `projex:draft-sent` on send · advance p3.6 when 3+ sent
 */

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    Sparkles, Mail, Send, CheckCircle2, Loader2, Wand2,
    ArrowRight, User, Clock, Users, Edit3, RotateCcw, X,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import { useHighlightOnAcClick } from '../hooks/useHighlightOnAcClick'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { COLLECTION_DRAFTS, PROJEX_AR_RECORDS } from '../../../config/profiles/projex-data/arAging'

type Tone = 'original' | 'friendlier' | 'firmer' | 'shorter'

const TONE_LABELS: Record<Tone, string> = {
    original: 'Original',
    friendlier: 'Friendlier',
    firmer: 'Firmer',
    shorter: 'Shorter',
}

// Simplified tone transform demo
function toneRewrite(body: string, tone: Tone): string {
    if (tone === 'original') return body
    if (tone === 'shorter') {
        const lines = body.split('\n').filter(l => l.trim())
        return lines.slice(0, 2).join('\n\n')
    }
    if (tone === 'friendlier') return body.replace(/Please/g, 'Hey · could you').replace(/Thanks/g, 'Thanks so much')
    if (tone === 'firmer') return body.replace(/Please/g, 'Per policy').replace(/Would you/g, 'You must')
    return body
}

export default function F3_p35_CollectionDraftsScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()

    const [selectedId, setSelectedId] = useState<string>(COLLECTION_DRAFTS[0].id)
    const [tone, setTone] = useState<Tone>('original')
    const [sentIds, setSentIds] = useState<Set<string>>(new Set())
    const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent'>('idle')
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [lastSent, setLastSent] = useState<{ customer: string; invoice: string; amount: number } | null>(null)

    const activeDraft = COLLECTION_DRAFTS.find(d => d.id === selectedId) ?? COLLECTION_DRAFTS[0]
    const activeRecord = PROJEX_AR_RECORDS.find(r => r.id === activeDraft.recordId)
    const rewrittenBody = toneRewrite(activeDraft.body, tone)

    // Manual editable body · seeded from tone-rewritten baseline · user can edit
    // freely · tone click or draft-switch re-seeds. `manualEdits` tracks divergence.
    const [body, setBody] = useState<string>(rewrittenBody)
    const [manualEdits, setManualEdits] = useState(false)

    useEffect(() => {
        setBody(rewrittenBody)
        setManualEdits(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, tone])

    const handleBodyChange = (val: string) => {
        setBody(val)
        setManualEdits(val !== rewrittenBody)
    }

    const handleResetToTone = () => {
        setBody(rewrittenBody)
        setManualEdits(false)
    }

    // F76 · AC click highlights Send button (per-draft · never batch auto-send)
    const highlight = useHighlightOnAcClick('projex:drafts-open')

    const handleSend = () => {
        if (sendState !== 'idle') return
        setSendState('sending')
        pauseAwareTimeout(() => {
            setSendState('sent')
            setSentIds(prev => new Set([...prev, selectedId]))
            setLastSent({
                customer: activeRecord?.customer ?? 'Customer',
                invoice: activeRecord?.invoiceNumber ?? activeDraft.recordId,
                amount: activeRecord?.amount ?? 0,
            })
            window.dispatchEvent(new CustomEvent('projex:draft-sent'))
            // Open confirmation modal · user decides next action
            pauseAwareTimeout(() => setConfirmOpen(true), 400)
        }, 900)
    }

    const handleContinueToNextStep = () => {
        setConfirmOpen(false)
        nextStep()
    }

    const handleSendNextDraft = () => {
        setConfirmOpen(false)
        setSendState('idle')
        const nextUnsent = COLLECTION_DRAFTS.find(d => d.id !== selectedId && !sentIds.has(d.id))
        if (nextUnsent) {
            setSelectedId(nextUnsent.id)
            setTone('original')
        }
    }

    const remainingUnsent = COLLECTION_DRAFTS.filter(d => d.id !== selectedId && !sentIds.has(d.id)).length

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.NETSUITE_BILL] },
        { sources: [PROJEX_SOURCES.STRATA_COMPOSER] },
        { sources: [PROJEX_SOURCES.AP_INBOX_PJX] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F3</span>
                    <span>Progress billing · step 5</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                        <Sparkles className="h-3 w-3" aria-hidden="true" /> AI drafts
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    AI-drafted collection emails · shared queue (Isabella + Alec)
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    5 drafts staged por bucket · Friendlier/Firmer/Shorter tone polish · never batch auto-send · FC12 fix.
                </p>
            </div>

            {/* Layout · shared queue (izq · 380px) + email composer (der) */}
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 items-start">

                {/* Shared queue · Isabella + Alec drafts */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Shared draft queue
                        </span>
                        <span className="ml-auto text-[10px] font-bold tabular-nums bg-primary/15 text-foreground rounded px-1.5 py-0.5">
                            {COLLECTION_DRAFTS.length - sentIds.size} pending
                        </span>
                    </div>
                    <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
                        {COLLECTION_DRAFTS.map(d => {
                            const isSelected = d.id === selectedId
                            const isSent = sentIds.has(d.id)
                            const record = PROJEX_AR_RECORDS.find(r => r.id === d.recordId)
                            const authorMeta = d.authoredBy === 'alec'
                                ? { name: PROJEX_PERSONAS.alec.fullName.split(' ')[0], color: 'bg-warning/15 text-warning' }
                                : d.authoredBy === 'isabella'
                                ? { name: PROJEX_PERSONAS.isabella.fullName.split(' ')[0], color: 'bg-ai/15 text-ai' }
                                : { name: 'Strata AI', color: 'bg-ai-light text-ai' }
                            return (
                                <button
                                    key={d.id}
                                    onClick={() => { setSelectedId(d.id); setTone('original') }}
                                    disabled={isSent}
                                    className={`
                                        w-full text-left px-3 py-2.5 transition-colors
                                        ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'}
                                        ${isSent ? 'opacity-60' : ''}
                                    `}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground truncate">{record?.customer}</span>
                                                {isSent && (
                                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                                                        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                                                        Sent
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">{record?.invoiceNumber}</div>
                                            <div className="text-[11px] text-foreground truncate mt-1">{d.subject}</div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold rounded px-1.5 py-0.5 ${authorMeta.color}`}>
                                                    <User className="h-2.5 w-2.5" aria-hidden="true" />
                                                    {authorMeta.name}
                                                </span>
                                                <span className={`text-[9px] font-bold rounded px-1.5 py-0.5 ${
                                                    d.tone === 'friendly' ? 'bg-success/10 text-success' :
                                                    d.tone === 'firm' ? 'bg-warning/10 text-warning' :
                                                    'bg-destructive/10 text-destructive'
                                                }`}>
                                                    {d.tone}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground tabular-nums ml-auto">
                                                    ${record?.amount.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                    <div className="px-3 py-2 border-t border-border bg-muted/20 flex items-center gap-2 text-[10px]">
                        <Clock className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                        <span className="text-muted-foreground">Alec sees same queue instantly · FC12 fix</span>
                    </div>
                </div>

                {/* Email composer */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Draft · {activeRecord?.customer}
                        </span>
                        <span className={`ml-auto text-[10px] font-bold rounded px-1.5 py-0.5 ${
                            activeDraft.tone === 'friendly' ? 'bg-success/10 text-success' :
                            activeDraft.tone === 'firm' ? 'bg-warning/10 text-warning' :
                            'bg-destructive/10 text-destructive'
                        }`}>
                            {activeDraft.tone} tone
                        </span>
                    </div>

                    <div className="px-4 py-3 border-b border-border text-[12px] space-y-1.5">
                        <div className="grid grid-cols-[60px_1fr] gap-x-2">
                            <span className="text-muted-foreground">To</span>
                            <span className="text-foreground">ap@{activeRecord?.customer.toLowerCase().replace(/[^a-z]/g, '')}.example</span>
                        </div>
                        <div className="grid grid-cols-[60px_1fr] gap-x-2">
                            <span className="text-muted-foreground">Subject</span>
                            <span className="text-foreground font-semibold">{activeDraft.subject}</span>
                        </div>
                    </div>

                    {/* Tone polish toolbar */}
                    <div className="px-4 py-2.5 border-b border-border bg-muted/10 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mr-2">
                            <Wand2 className="h-3 w-3" aria-hidden="true" /> Polish
                        </span>
                        {(['original', 'friendlier', 'firmer', 'shorter'] as Tone[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setTone(t)}
                                className={`
                                    text-[11px] font-semibold px-2 py-1 rounded transition-colors
                                    ${tone === t
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'}
                                `}
                            >
                                {TONE_LABELS[t]}
                            </button>
                        ))}
                        {manualEdits && (
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-ai bg-ai-light rounded px-1.5 py-0.5">
                                <Edit3 className="h-2.5 w-2.5" aria-hidden="true" />
                                Edited manually
                            </span>
                        )}
                    </div>

                    <div className="p-4">
                        <label className="block">
                            <span className="sr-only">Email body · editable</span>
                            <textarea
                                value={body}
                                onChange={e => handleBodyChange(e.target.value)}
                                rows={12}
                                spellCheck
                                className="w-full min-h-[280px] bg-background border border-border rounded-lg px-3 py-2 text-[12px] text-foreground font-sans whitespace-pre-wrap leading-relaxed resize-y focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-colors"
                            />
                        </label>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-muted-foreground tabular-nums">{body.length} chars</span>
                            <span className="text-muted-foreground/50 text-[10px]">·</span>
                            <span className="text-[10px] text-muted-foreground">Edit inline · tone toolbar re-seeds · manual edits kept until you switch tone or draft</span>
                            {manualEdits && (
                                <button
                                    onClick={handleResetToTone}
                                    className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded px-1.5 py-0.5 transition-colors"
                                    title="Reset to current tone's default"
                                >
                                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                                    Reset to {TONE_LABELS[tone].toLowerCase()}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground flex-1">
                            Isabella reviews → sends · draft never auto-goes · per-invoice control preserved.
                        </span>
                        {sendState === 'idle' && (
                            <button
                                onClick={handleSend}
                                disabled={sentIds.has(activeDraft.id)}
                                data-ac-highlight
                                className={`inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity ${highlight ? 'ring-2 ring-primary/60 animate-pulse' : ''}`}
                            >
                                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                {sentIds.has(activeDraft.id) ? 'Sent' : 'Send follow-up'}
                            </button>
                        )}
                        {sendState === 'sending' && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ai animate-pulse">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                Sending…
                            </span>
                        )}
                        {sendState === 'sent' && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success">
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                Sent · logged to NetSuite
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Advance CTA */}
            {sentIds.size > 0 && (
                <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <span className="text-foreground font-semibold">{sentIds.size} follow-up{sentIds.size === 1 ? '' : 's'} sent</span>
                        <span className="text-muted-foreground"> · logged to Communications · Isabella + Alec see updated state in real-time.</span>
                    </div>
                    <button
                        onClick={nextStep}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        Post Fairport invoice
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            )}

            <DataSourcesBar groups={dataGroups} label="Collection drafts · AI composer → shared queue → NetSuite Communications" />

            {/* Send confirmation modal · centered */}
            <Transition show={confirmOpen} as={Fragment}>
                <Dialog onClose={() => setConfirmOpen(false)} className="relative z-[350]">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                        leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted/30">
                                    <div className="flex items-center gap-2">
                                        <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center text-success">
                                            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground">Follow-up sent</div>
                                            <div className="text-[11px] text-muted-foreground">Logged to Communications tab</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setConfirmOpen(false)}
                                        aria-label="Close"
                                        className="h-8 w-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="px-5 py-4 space-y-3 text-sm">
                                    {lastSent && (
                                        <div className="rounded-lg border border-border bg-background p-3 space-y-1.5">
                                            <div className="flex justify-between gap-3 text-[12px]">
                                                <span className="text-muted-foreground">Customer</span>
                                                <span className="text-foreground font-semibold">{lastSent.customer}</span>
                                            </div>
                                            <div className="flex justify-between gap-3 text-[12px]">
                                                <span className="text-muted-foreground">Invoice</span>
                                                <span className="text-foreground font-mono">{lastSent.invoice}</span>
                                            </div>
                                            <div className="flex justify-between gap-3 text-[12px]">
                                                <span className="text-muted-foreground">Amount</span>
                                                <span className="text-foreground font-semibold tabular-nums">${lastSent.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                                        The AR aging tracker + shared queue update in real-time · AP team of the customer will receive the follow-up email within the next few minutes.
                                    </p>
                                    {remainingUnsent > 0 && (
                                        <div className="flex items-start gap-1.5 rounded-lg border border-info/20 bg-info/5 p-2 text-[11px] text-foreground">
                                            <Mail className="h-3.5 w-3.5 text-info shrink-0 mt-0.5" aria-hidden="true" />
                                            <span>{remainingUnsent} draft{remainingUnsent === 1 ? '' : 's'} remain in the queue · send them individually or continue.</span>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center gap-2">
                                    {remainingUnsent > 0 && (
                                        <button
                                            onClick={handleSendNextDraft}
                                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-md px-2.5 py-2 transition-colors"
                                        >
                                            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                            Send next draft
                                        </button>
                                    )}
                                    <button
                                        onClick={handleContinueToNextStep}
                                        className="ml-auto inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                    >
                                        Continue to next step
                                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
