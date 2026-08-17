/**
 * COMPONENT: F2_p23_PreflightScene (Projex · p2.3)
 * PURPOSE: Auto. Strata runs 4-check compliance preflight sobre validated W-9.
 *          Left rail sidebar con sections + counters (Compliance's compliance rules).
 *          Popover on each row con detail. Chain de checks pausable via
 *          usePauseAware · re-runnable si Accounting edita un field (pattern del
 *          PreflightScanChain lifted).
 *
 *          Shape LOCK · modal-panes + preflight-siderail izq (F2 primary shape).
 *
 * DS TOKENS: bg-card · bg-primary + text-primary-foreground · bg-ai-light + text-ai ·
 *            border-border · bg-success/10 · bg-warning/10 · bg-destructive/10 ·
 *            tabular-nums
 *
 * SOURCE OF TRUTH: SOT §12b · Compliance's compliance rules (W-9 <12mo · 1099 · ACH · W-8)
 * REUSE FROM: mbi/PreflightScanChain shape (5-check pausable pattern) ·
 *             vendor/expert-catalog/create-record/left-rail/PreflightLeftRail ·
 *             vendor/expert-catalog/create-record/PreflightSummaryPopover
 *
 * NOTIF: dispatchea `projex:preflight-ready-for-jacob` on complete → advance p2.4
 */

import { useEffect, useState } from 'react'
import {
    Sparkles, ShieldCheck, CheckCircle2, Loader2, AlertTriangle,
    ArrowRight, Info, ScrollText, Fingerprint,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { WBD_PREFLIGHT, WBD_W9 } from '../../../config/profiles/projex-data/w9Records'

const RULE_ICONS: Record<string, React.ElementType> = {
    'w9-fresh':     ShieldCheck,
    '1099-flag':    Fingerprint,
    'ach-verified': CheckCircle2,
    'w8-bene':      Info,
}

export default function F2_p23_PreflightScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const jacob = PROJEX_PERSONAS.jacob

    const [ranCount, setRanCount] = useState(0)
    const [done, setDone] = useState(false)

    // Chain choreography · 1 check every ~700ms
    useEffect(() => {
        if (ranCount < WBD_PREFLIGHT.length) {
            const cancel = pauseAwareTimeout(() => setRanCount(n => n + 1), 700)
            return cancel
        }
        if (!done) {
            const cancel = pauseAwareTimeout(() => {
                setDone(true)
                window.dispatchEvent(new CustomEvent('projex:preflight-ready-for-jacob'))
            }, 500)
            return cancel
        }
    }, [ranCount, done, pauseAwareTimeout])

    const passCount = WBD_PREFLIGHT.slice(0, ranCount).filter(c => c.result === 'pass').length
    const warnCount = WBD_PREFLIGHT.slice(0, ranCount).filter(c => c.result === 'warn').length
    const failCount = WBD_PREFLIGHT.slice(0, ranCount).filter(c => c.result === 'fail').length
    const progress = Math.round((ranCount / WBD_PREFLIGHT.length) * 100)

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.W9_REGISTRY] },
        { sources: [PROJEX_SOURCES.STRATA_AI_PJX] },
        { sources: [PROJEX_SOURCES.NETSUITE_VENDOR] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F2</span>
                    <span>Vendor onboarding · step 3</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                        <Sparkles className="h-3 w-3" aria-hidden="true" /> Auto · preflight chain
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Compliance preflight · Compliance&apos;s 4 rules · staggered check chain
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Strata runs W-9 freshness · 1099-NEC flag · ACH verification · W-8 BEN-E requirement.
                    Re-runnable si Accounting edita un field · pause-aware para presenter.
                </p>
            </div>

            {/* Layout · preflight rail (izq · 300px) + checks feed (der) */}
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 items-start">

                {/* Preflight left rail · progress ring + section counters */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden sticky top-4">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Preflight</div>
                        <div className="text-sm font-semibold text-foreground mt-0.5">Warehouse by Design</div>
                    </div>

                    {/* Progress ring visualization */}
                    <div className="p-4 flex flex-col items-center gap-3 border-b border-border">
                        <div className="relative w-24 h-24">
                            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" strokeWidth="8" className="stroke-muted fill-none" />
                                <circle
                                    cx="50" cy="50" r="42" strokeWidth="8" strokeLinecap="round"
                                    className={done ? 'stroke-success fill-none transition-all duration-500' : 'stroke-ai fill-none transition-all duration-500'}
                                    style={{
                                        strokeDasharray: 264,
                                        strokeDashoffset: 264 - (264 * progress) / 100,
                                    }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-2xl font-bold text-foreground tabular-nums">{progress}%</div>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                    {done ? 'Ready' : 'Scanning'}
                                </div>
                            </div>
                        </div>
                        <div className="text-[11px] text-muted-foreground text-center">
                            {ranCount} / {WBD_PREFLIGHT.length} checks complete
                        </div>
                    </div>

                    {/* Section counters */}
                    <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1.5 text-foreground">
                                <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                                Passed
                            </span>
                            <span className="tabular-nums font-semibold text-success">{passCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1.5 text-foreground">
                                <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
                                Warnings
                            </span>
                            <span className="tabular-nums font-semibold text-warning">{warnCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1.5 text-foreground">
                                <span className="h-2 w-2 rounded-full bg-destructive" aria-hidden="true" />
                                Failures
                            </span>
                            <span className="tabular-nums font-semibold text-destructive">{failCount}</span>
                        </div>
                    </div>

                    {/* Rules legend */}
                    <div className="px-4 py-3 border-t border-border">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Compliance rules</div>
                        <ul className="space-y-0.5 text-[11px] text-muted-foreground">
                            <li>W-9 signed &lt; 12 mo</li>
                            <li>1099-NEC per entity type</li>
                            <li>ACH bank routing verified</li>
                            <li>W-8 BEN-E if non-US</li>
                        </ul>
                    </div>
                </div>

                {/* Checks feed */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <ScrollText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Compliance checks · staggered chain
                        </span>
                        {done ? (
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                Ready for Compliance review
                            </span>
                        ) : (
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-ai">
                                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                                Running
                            </span>
                        )}
                    </div>
                    <div className="p-4 space-y-2">
                        {WBD_PREFLIGHT.map((check, i) => {
                            const isDone = i < ranCount
                            const isRunning = i === ranCount && !done
                            const isPending = i > ranCount || (i === ranCount && !isRunning)
                            const Icon = RULE_ICONS[check.id] ?? ShieldCheck
                            const resultStyle = check.result === 'pass'
                                ? { bg: 'bg-success/10', text: 'text-success', border: 'border-success/40' }
                                : check.result === 'warn'
                                ? { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/40' }
                                : { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/40' }
                            return (
                                <div
                                    key={check.id}
                                    className={`
                                        rounded-lg border px-3 py-2 flex items-start gap-2 transition-all duration-300
                                        ${isPending ? 'opacity-40 border-border bg-card' : ''}
                                        ${isRunning ? 'border-ai/40 bg-ai/5 animate-pulse' : ''}
                                        ${isDone ? `${resultStyle.border} ${resultStyle.bg}` : ''}
                                    `}
                                >
                                    <div className="shrink-0 mt-0.5">
                                        {isDone && check.result === 'pass' && <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />}
                                        {isDone && check.result === 'warn' && <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />}
                                        {isDone && check.result === 'fail' && <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />}
                                        {isRunning && <Loader2 className="h-4 w-4 text-ai animate-spin" aria-hidden="true" />}
                                        {isPending && <span className="h-4 w-4 rounded-full border border-border block" aria-hidden="true" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                                            <span className={`text-sm font-semibold ${isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {check.label}
                                            </span>
                                            {isDone && (
                                                <span className={`text-[10px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 ml-auto ${resultStyle.bg} ${resultStyle.text}`}>
                                                    {check.result}
                                                </span>
                                            )}
                                        </div>
                                        {isDone && (
                                            <div className="text-[11px] text-muted-foreground mt-1 pl-5">
                                                {check.detail}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Ready CTA */}
                    {done && (
                        <div className="px-4 py-3 border-t border-border bg-success/5 flex items-center gap-2 animate-in fade-in duration-300">
                            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                            <span className="text-xs text-foreground flex-1">
                                All checks passed · vendor is compliant. Ready for compliance sign-off.
                            </span>
                            <button
                                onClick={nextStep}
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold rounded-lg bg-primary text-primary-foreground py-1.5 px-3 hover:opacity-90 transition-opacity shadow-sm"
                            >
                                Route to compliance sign-off
                                <ArrowRight className="h-3 w-3" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Vendor snapshot strip · what Compliance will see */}
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-destructive/15 text-destructive flex items-center justify-center text-[10px] font-bold shrink-0">
                    WBD
                </div>
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">{WBD_W9.vendorName} · {WBD_W9.fields[1].value}</div>
                    <div className="text-muted-foreground mt-0.5">
                        EIN {WBD_W9.fields[2].value} · signed {WBD_W9.signedDate} ({WBD_W9.freshDays} days fresh) · ACH verified 2026-03-15 · US address
                    </div>
                </div>
            </div>

            <DataSourcesBar groups={dataGroups} label="Compliance preflight · Compliance\'s rules · re-runnable" />
        </div>
    )
}
