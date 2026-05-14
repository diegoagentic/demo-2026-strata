/**
 * COMPONENT: CoNYMorningQueue (a1.1)
 * PURPOSE: Flow 1 · Scene 1 — BFI Agency Fee order queue.
 *
 * FLOW:
 *   idle        → BFIProcessKanban without DOE visible (3 context orders)
 *   notification → Notification panel slides in: email + .sif + .pdf + [Ingest →]
 *   ingesting   → 3 progress lines appear → DOE card fades into Intake col
 *   ready       → DOE card + CPR badge + [Review order →] → opens modal
 *   modal       → BFIDocumentReviewModal step='extract' → validate
 *   sendDialog  → "Notify designer?" → send flow → nextStep()
 */

import { useState, useRef, useEffect, useCallback, Fragment } from 'react'
import {
    Sparkles, CheckCircle2, AlertTriangle,
    FileText, Mail, Send, User, Eye,
} from 'lucide-react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

interface CoNYMorningQueueProps {
    onSelectOrder?: () => void
}

type QueueState = 'idle' | 'notification' | 'ingesting' | 'ready'

const INGEST_LINES = [
    { icon: CheckCircle2, text: 'DOE-2847.sif parsed · 6 line items extracted',                 color: 'text-success' },
    { icon: CheckCircle2, text: 'NYC-DOE-2847-specs.pdf · floor plan detected · Zone A·B·C',   color: 'text-success' },
    { icon: AlertTriangle,text: 'CPR discrepancy detected · Carpenters −5h · OT −2h · −$2,340', color: 'text-warning' },
]

const NOTIFY_MESSAGE = `Hi Robert — SIF for DOE-2847 has been ingested and validated. CPR discrepancy detected: Carpenters −5h, OT −2h (−$2,340). Quote Q-2026-0089 is being processed. We'll follow up shortly with confirmation.

— Lauren DeMarco, BFI Furniture`

export default function CoNYMorningQueue({ onSelectOrder }: CoNYMorningQueueProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [queueState, setQueueState]   = useState<QueueState>('idle')
    const [ingestCount, setIngestCount] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSendOpen, setIsSendOpen]   = useState(false)
    const [sendStep, setSendStep]       = useState<'compose' | 'sent'>('compose')

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const poll  = setInterval(() => {
            if (isPausedRef.current) return
            if (Date.now() - start >= delay) { clearInterval(poll); fn() }
        }, 100)
        return () => clearInterval(poll)
    }, [])

    useEffect(() => {
        if (queueState !== 'idle') return
        const cleanup = pauseAware(() => setQueueState('notification'), 900)
        return cleanup
    }, [queueState, pauseAware])

    // Listen for Action Center "Ingest with Strata" trigger
    useEffect(() => {
        const handler = () => setQueueState('ingesting')
        window.addEventListener('bfi:ingest', handler)
        return () => window.removeEventListener('bfi:ingest', handler)
    }, [])

    useEffect(() => {
        if (queueState !== 'ingesting') return
        if (ingestCount >= INGEST_LINES.length) {
            const cleanup = pauseAware(() => setQueueState('ready'), 400)
            return cleanup
        }
        const cleanup = pauseAware(() => setIngestCount(c => c + 1), 650)
        return cleanup
    }, [queueState, ingestCount, pauseAware])

    const handleIngest = () => setQueueState('ingesting')

    const handleReviewOrder = () => setIsModalOpen(true)

    const handleModalValidate = () => {
        setIsModalOpen(false)
        onSelectOrder?.()
        setSendStep('compose')
        setIsSendOpen(true)
    }

    const handleSend = () => {
        setSendStep('sent')
        setTimeout(() => {
            setIsSendOpen(false)
            nextStep()
        }, 1200)
    }

    const handleSkip = () => {
        setIsSendOpen(false)
        nextStep()
    }

    const showDoe = queueState === 'ready'

    return (
        <div className="space-y-4">

            {/* ── Notification panel — only shows after Action Center triggers ingest ── */}
            {(queueState === 'ingesting' || queueState === 'ready') && (
                <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden animate-in slide-in-from-top-2 fade-in duration-400">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border">
                        <div className="h-6 w-6 rounded-lg bg-ai/10 flex items-center justify-center shrink-0">
                            <Sparkles className="h-3.5 w-3.5 text-ai" />
                        </div>
                        <span className="text-[11px] font-bold text-foreground">New quote request · Miller Knoll</span>
                        <span className="ml-auto text-[10px] text-muted-foreground shrink-0">May 6 · 8:14 AM</span>
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="space-y-1">
                            {[
                                { label: 'From', value: 'Robert Chen · Miller Knoll Rep' },
                                { label: 'Re',   value: 'DOE-2847 · NYC Dept. of Education · quote request' },
                            ].map(f => (
                                <div key={f.label} className="flex items-center gap-2 text-[11px]">
                                    <span className="text-muted-foreground w-8 shrink-0">{f.label}:</span>
                                    <span className="text-foreground font-medium">{f.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Attachments:</span>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-ai/5 border border-ai/20 text-[10px] text-ai font-medium">
                                <FileText className="h-3 w-3" /> DOE-2847.sif
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/40 border border-border text-[10px] text-muted-foreground">
                                <FileText className="h-3 w-3" /> NYC-DOE-2847-specs.pdf
                            </div>
                        </div>

                        {(queueState === 'ingesting' || queueState === 'ready') && (
                            <div className="space-y-1.5 pt-1 border-t border-border">
                                {INGEST_LINES.slice(0, ingestCount).map((line, i) => (
                                    <div key={i} className={`flex items-center gap-2 text-[10px] ${line.color} animate-in fade-in duration-300`}>
                                        <line.icon className="h-3 w-3 shrink-0" />
                                        {line.text}
                                    </div>
                                ))}
                            </div>
                        )}

                        {queueState === 'ready' && (
                            <button
                                onClick={handleReviewOrder}
                                className="w-full py-2 text-[11px] font-black rounded-xl bg-foreground text-background hover:opacity-80 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                            >
                                <Eye className="h-3.5 w-3.5" />
                                Review order →
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Process Kanban ── */}
            <BFIProcessKanban
                activeCol={0}
                showDoe={showDoe}
                animateDoe={true}
                onReviewDoe={queueState === 'ready' ? handleReviewOrder : undefined}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                {showDoe
                    ? '4 active orders · DOE-2847 flagged · CPR discrepancy detected'
                    : '3 active orders · monitoring CoNY pipeline…'
                }
            </p>

            {/* ── Document Review Modal ── */}
            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="extract"
                onValidate={handleModalValidate}
            />

            {/* ── Send designer notification dialog ── */}
            <Transition show={isSendOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[400]" onClose={() => {}}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                        leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
                    >
                        <div className="fixed top-16 left-80 right-0 bottom-0 bg-black/40 backdrop-blur-sm" />
                    </TransitionChild>

                    <div className="fixed top-16 left-80 right-0 bottom-0 flex items-center justify-center p-6">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">

                                {/* Header */}
                                <div className="px-5 py-4 border-b border-border bg-muted/30">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-xl bg-ai/10 flex items-center justify-center shrink-0">
                                            <Send className="h-4 w-4 text-ai" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-foreground">Notify designer · DOE-2847</p>
                                            <p className="text-[11px] text-muted-foreground">Strata AI pre-drafted the message</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Contact */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                                        <div className="h-8 w-8 rounded-full bg-info/20 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-black text-info">RC</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-bold text-foreground">Robert Chen</p>
                                            <p className="text-[10px] text-muted-foreground">Miller Knoll Rep · robert.chen@millerknoll.com</p>
                                        </div>
                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <User className="h-3 w-3 text-muted-foreground" />
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Message</p>
                                        </div>
                                        <div className="rounded-xl border border-border bg-background px-3.5 py-3 text-[11px] text-foreground leading-relaxed whitespace-pre-line">
                                            {NOTIFY_MESSAGE}
                                        </div>
                                    </div>

                                    {/* Sent confirmation */}
                                    {sendStep === 'sent' && (
                                        <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-xl animate-in fade-in duration-300">
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                            <p className="text-[12px] font-bold text-success">Sent to Robert Chen · May 6 · 8:21 AM</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {sendStep === 'compose' && (
                                    <div className="px-5 pb-5 flex items-center gap-3">
                                        <button
                                            onClick={handleSkip}
                                            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Skip
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-black rounded-xl bg-foreground text-background hover:opacity-80 transition-all uppercase tracking-widest"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                            Send notification →
                                        </button>
                                    </div>
                                )}

            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
