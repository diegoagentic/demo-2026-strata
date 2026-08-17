/**
 * COMPONENT: F2_p26_DealerReadinessScene (Projex · p2.6)
 * PURPOSE: Coordinator opens Dealer view · vendor status per active project.
 *          Warehouse by Design ahora "Ready for AP" con next payment run date.
 *          Expiration reminders 30-day-out surface en Action Center · click
 *          abre pre-drafted "Request W-9 refresh" email (Friendlier/Firmer/
 *          Shorter toolbar) para Coordinator to review y send.
 *
 *          Shape LOCK · dealer readiness grid + email composer inline.
 *
 * DS TOKENS: bg-card · bg-primary + text-primary-foreground · bg-ai-light + text-ai ·
 *            bg-success/10 · bg-warning/10 · border-border · tabular-nums
 *
 * SOURCE OF TRUTH: SOT §12b · dealer experience readiness self-service · expiration alerts
 * REUSE FROM: shared/AIEmailComposer + notifications/ActionCenter entry ·
 *             UI-Manufacturer/ContactVendorsModal shape (adapt)
 *
 * NOTIF: dispatchea `projex:refresh-email-sent` on send → loop back option
 */

import { useEffect, useState } from 'react'
import {
    User, Building2, CheckCircle2, Send, Sparkles, Wand2,
    ArrowRight, Clock, AlertTriangle, RotateCcw, Mail, Bell,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { KELLY_PROJECTS } from '../../../config/profiles/projex-data/w9Records'

type Tone = 'original' | 'friendlier' | 'firmer' | 'shorter'

const TONES: { id: Tone; label: string; body: string }[] = [
    {
        id: 'original',
        label: 'Original',
        body: `Hi West Elm trade team,

Quick heads-up · your W-9 on file with Projex is approaching its 12-month anniversary (signed Jan 18 2025).

To keep payments flowing without holds, could you send an updated W-9 by end of month? Reply to this email or upload directly at projex-vendors.com/refresh.

Thanks —
Coordinator · Projex Furniture Coordination`,
    },
    {
        id: 'friendlier',
        label: 'Friendlier',
        body: `Hey West Elm trade team!

Hope Q3 is treating you well. Little admin thing · your W-9 with us is almost 12 months old (Jan 18 · that was ages ago in vendor-years).

Could you shoot over a fresh one whenever you have a sec? Reply here or use projex-vendors.com/refresh. No rush · just want to keep the payment train running smooth 🚂

Thanks so much!
Coordinator`,
    },
    {
        id: 'firmer',
        label: 'Firmer',
        body: `West Elm trade team,

Per Projex vendor policy · W-9 refresh is required every 12 months. Your current W-9 (signed 2025-01-18) reaches expiration in 30 days.

Please submit a signed W-9 by end of month · payments will hold if we do not receive it in time. Reply to this email or upload at projex-vendors.com/refresh.

Thanks —
Coordinator · Projex Furniture Coordination`,
    },
    {
        id: 'shorter',
        label: 'Shorter',
        body: `Hi West Elm · your Projex W-9 (signed 2025-01-18) expires in 30 days · please send a fresh signed copy to avoid payment holds. Reply here or upload at projex-vendors.com/refresh. Thanks — Coordinator`,
    },
]

export default function F2_p26_DealerReadinessScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { steps, goToStep } = useDemo()
    const kelly = PROJEX_PERSONAS.kelly

    const [tone, setTone] = useState<Tone>('original')
    const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent'>('idle')
    const activeTone = TONES.find(t => t.id === tone) ?? TONES[0]

    // F76 · No AC notif for this step · UI is self-explanatory (Send visible).
    const highlight = false

    const handleSend = () => {
        if (sendState !== 'idle') return
        setSendState('sending')
        pauseAwareTimeout(() => {
            setSendState('sent')
            window.dispatchEvent(new CustomEvent('projex:refresh-email-sent'))
        }, 900)
    }

    const restart = () => {
        const first = steps.findIndex(s => s.id === 'p2.1')
        if (first >= 0) goToStep(first)
    }

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.NETSUITE_VENDOR] },
        { sources: [PROJEX_SOURCES.STRATA_COMPOSER] },
        { sources: [PROJEX_SOURCES.AP_INBOX_PJX] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F2</span>
                    <span>Vendor onboarding · step 6</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-primary/15 text-foreground font-semibold rounded-md px-1.5 py-0.5">
                        <User className="h-3 w-3" aria-hidden="true" /> {kelly.role}
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Dealer readiness · Coordinator sees vendor status per project + expiration reminders
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Warehouse by Design now Ready for AP · 2 expiration reminders 30-day-out surface via Action Center.
                </p>
            </div>

            {/* Layout · project readiness grid (left) + expiration email composer (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 items-start">

                {/* Active projects grid */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Coordinator&apos;s active projects · vendor readiness
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground">Next payment run · Tue Aug 19</span>
                    </div>
                    <div className="divide-y divide-border">
                        {KELLY_PROJECTS.map(p => (
                            <div key={p.id} className="px-4 py-3 flex items-start gap-3">
                                <div className="h-9 w-9 rounded-xl bg-primary/15 text-foreground flex items-center justify-center shrink-0 text-[10px] font-bold">
                                    {p.id.slice(0, 3).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-foreground font-semibold truncate">{p.name}</span>
                                        {p.id === 'DenverFinancial' && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full px-2 py-0.5 shrink-0">
                                                WBD just added
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                        {p.vendorReady && (
                                            <span className="inline-flex items-center gap-1 text-success">
                                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                All vendors ready
                                            </span>
                                        )}
                                        {p.nextPaymentRun && (
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="h-3 w-3" aria-hidden="true" />
                                                Payment run {p.nextPaymentRun}
                                            </span>
                                        )}
                                        {p.expirationsIn30 > 0 && (
                                            <span className="inline-flex items-center gap-1 text-warning">
                                                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                                {p.expirationsIn30} W-9 expires 30d
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expiration reminder composer */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Bell className="h-4 w-4 text-warning" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Expiration reminder · West Elm W-9 30 days
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold bg-ai-light text-ai rounded px-1.5 py-0.5">
                            <Sparkles className="h-3 w-3" aria-hidden="true" /> Pre-drafted
                        </span>
                    </div>

                    {/* Envelope */}
                    <div className="px-4 py-3 border-b border-border space-y-1.5 text-[12px]">
                        <div className="grid grid-cols-[60px_1fr] gap-x-2 items-center">
                            <span className="text-muted-foreground">To</span>
                            <span className="text-foreground">trade@westelm.example</span>
                        </div>
                        <div className="grid grid-cols-[60px_1fr] gap-x-2 items-center">
                            <span className="text-muted-foreground">From</span>
                            <span className="text-foreground">{kelly.fullName} · vendors@projex-inc.com</span>
                        </div>
                        <div className="grid grid-cols-[60px_1fr] gap-x-2 items-start">
                            <span className="text-muted-foreground">Subject</span>
                            <span className="text-foreground font-semibold">Quick request · W-9 refresh · expires 30 days</span>
                        </div>
                    </div>

                    {/* Tone toolbar */}
                    <div className="px-4 py-2.5 border-b border-border bg-muted/10 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mr-2">
                            <Wand2 className="h-3 w-3" aria-hidden="true" /> Polish
                        </span>
                        {TONES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTone(t.id)}
                                className={`
                                    text-[11px] font-semibold px-2 py-1 rounded transition-colors
                                    ${tone === t.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'}
                                `}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Body */}
                    <div className="p-4">
                        <pre className="text-[12px] text-foreground font-sans whitespace-pre-wrap leading-relaxed">
                            {activeTone.body}
                        </pre>
                    </div>

                    {/* Send footer */}
                    <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground flex-1">
                            Coordinator reviews → sends · draft never auto-goes.
                        </span>
                        {sendState === 'idle' && (
                            <button
                                onClick={handleSend}
                                data-ac-highlight
                                className={`inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity ${highlight ? 'ring-2 ring-primary/60 animate-pulse' : ''}`}
                            >
                                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                Send refresh request
                            </button>
                        )}
                        {sendState === 'sending' && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ai animate-pulse">
                                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                Sending…
                            </span>
                        )}
                        {sendState === 'sent' && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success">
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                Sent · logged to vendor Communications
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Center notif preview strip */}
            <div className="rounded-2xl border border-warning/40 bg-warning/5 px-4 py-3 flex items-start gap-3">
                <Mail className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Action Center · 2 expiration reminders</div>
                    <div className="text-muted-foreground mt-0.5">
                        West Elm W-9 expires 30 days (above) · Ryan&apos;s Carpentry W-9 already expired (payment run blocker) · both surface via bell del navbar. Coordinator clears them without leaving her project view.
                    </div>
                </div>
            </div>

            {/* Advance strip · restart flow o next Projex flow */}
            {sendState === 'sent' && (
                <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <span className="text-foreground font-semibold">F2 vendor onboarding complete</span>
                        <span className="text-muted-foreground"> · Warehouse by Design added · West Elm refresh requested · Coordinator has zero pending expirations.</span>
                    </div>
                    <button
                        onClick={restart}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        Replay F2
                    </button>
                    <span className="text-[10px] text-muted-foreground">or advance via sidebar flow-switcher →</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                </div>
            )}

            <DataSourcesBar groups={dataGroups} label="Dealer readiness · vendor status → expiration alerts → refresh requests" />
        </div>
    )
}
