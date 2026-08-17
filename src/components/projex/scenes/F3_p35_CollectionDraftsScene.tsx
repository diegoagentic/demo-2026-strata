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

import { useState } from 'react'
import {
    Sparkles, Mail, Send, CheckCircle2, Loader2, Wand2,
    ArrowRight, User, Clock, Users,
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

    const activeDraft = COLLECTION_DRAFTS.find(d => d.id === selectedId) ?? COLLECTION_DRAFTS[0]
    const activeRecord = PROJEX_AR_RECORDS.find(r => r.id === activeDraft.recordId)
    const rewrittenBody = toneRewrite(activeDraft.body, tone)

    // F76 · AC click highlights Send button (per-draft · never batch auto-send)
    const highlight = useHighlightOnAcClick('projex:drafts-open')

    const handleSend = () => {
        if (sendState !== 'idle') return
        setSendState('sending')
        pauseAwareTimeout(() => {
            setSendState('sent')
            setSentIds(prev => new Set([...prev, selectedId]))
            window.dispatchEvent(new CustomEvent('projex:draft-sent'))
            pauseAwareTimeout(() => {
                setSendState('idle')
                const nextUnsent = COLLECTION_DRAFTS.find(d => d.id !== selectedId && !sentIds.has(d.id))
                if (nextUnsent) {
                    setSelectedId(nextUnsent.id)
                    setTone('original')
                }
            }, 900)
        }, 900)
    }

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
                    </div>

                    <div className="p-4 min-h-[280px]">
                        <pre className="text-[12px] text-foreground font-sans whitespace-pre-wrap leading-relaxed">
                            {rewrittenBody}
                        </pre>
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
        </div>
    )
}
