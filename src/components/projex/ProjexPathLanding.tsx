/**
 * COMPONENT: ProjexPathLanding (F81.B · 2026-08-21)
 * PURPOSE: CEO-friendly landing page per Projex path · reduces cognitive load
 *          from 30 linear steps to 5 landings (1 per path) with:
 *            · Path title + tagline (1-line pitch)
 *            · Value chip (quantified ROI)
 *            · 2 CTAs · guided walkthrough | explore freely
 *            · Playlist moments menu · 6 tiles per path · click any tile ·
 *              jump directly to that scene (no linear forcing)
 *            · Hero scene rendered inline · full fidelity · no tour chrome
 *
 *          Renders when user is on Projex profile + !isDemoActive (pre-demo).
 *          Replaces the F80.3 generic Expert Hub Transactions landing.
 *
 * DS TOKENS: bg-card · text-foreground · border-border · bg-primary +
 *            text-primary-foreground · bg-{success|ai|warning|info}-light
 *
 * SOURCE OF TRUTH: PROJEX_PATH_LANDINGS in src/config/profiles/projex.ts
 * USED BY: App.tsx renderCurrentPage() when isProjex && !isDemoActive
 */

import { PlayCircle, Compass, Clock, ChevronRight, Star } from 'lucide-react'
import {
    PROJEX_PATH_LANDINGS,
    PROJEX_EXPERIENCE_GROUPS,
    experienceOf,
    type ProjexFlowId,
} from '../../config/profiles/projex'
import { renderProjexScene } from './projexSceneRegistry'

interface ProjexPathLandingProps {
    pathId: ProjexFlowId
    /** Fired when user clicks "See guided walkthrough" · caller starts the
        guided tour (setIsDemoActive(true) + goToStep(first step of path)). */
    onStartGuided?: () => void
    /** Fired when user clicks "Explore freely" · caller starts explore mode
        (setIsDemoActive(true) + hide step banner + no auto-advance). */
    onStartExplore?: () => void
    /** Fired when user clicks a moment tile · caller jumps to that scene ·
        argument is the stepId of the tapped moment. */
    onJumpToMoment?: (stepId: string) => void
}

const TONE_CLASSES: Record<
    'success' | 'ai' | 'warning' | 'info',
    { chip: string; ring: string }
> = {
    success: { chip: 'bg-success-light text-success',   ring: 'ring-success/40' },
    ai:      { chip: 'bg-ai-light text-ai',             ring: 'ring-ai/40' },
    warning: { chip: 'bg-warning-light text-warning',   ring: 'ring-warning/40' },
    info:    { chip: 'bg-info-light text-info',         ring: 'ring-info/40' },
}

export default function ProjexPathLanding({
    pathId,
    onStartGuided,
    onStartExplore,
    onJumpToMoment,
}: ProjexPathLandingProps) {
    const landing = PROJEX_PATH_LANDINGS[pathId]
    if (!landing) return null

    const experience = experienceOf(pathId)
    const group = PROJEX_EXPERIENCE_GROUPS.find(g => g.id === experience)
    const flow = group?.flows.find(f => f.id === pathId)
    if (!flow) return null

    const toneCls = TONE_CLASSES[landing.valueChip.tone]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header · path breadcrumb + title + tagline + value chip + CTAs */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
                {/* Breadcrumb · Experience > Path */}
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">
                        {experience === 'expert-hub' ? 'Expert Hub' : 'Dealer Experience'}
                    </span>
                    <ChevronRight className="h-3 w-3 opacity-50" aria-hidden="true" />
                    <span className="text-foreground font-semibold">{flow.short}</span>
                </div>

                {/* Title + tagline · main pitch */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">
                        {flow.label}
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                        {landing.tagline}
                    </p>
                </div>

                {/* Value chip · ROI metric */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${toneCls.chip}`}>
                    <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                        {landing.valueChip.label}
                    </span>
                </div>

                {/* CTAs · guided | explore */}
                <div className="flex items-center gap-2 flex-wrap">
                    {onStartGuided && (
                        <button
                            type="button"
                            onClick={onStartGuided}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <PlayCircle className="h-4 w-4" aria-hidden="true" />
                            {landing.ctaGuided}
                        </button>
                    )}
                    {onStartExplore && (
                        <button
                            type="button"
                            onClick={onStartExplore}
                            className="inline-flex items-center gap-2 bg-muted text-foreground text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-muted/70 transition-colors border border-border"
                        >
                            <Compass className="h-4 w-4" aria-hidden="true" />
                            {landing.ctaExplore}
                        </button>
                    )}
                </div>
            </div>

            {/* Playlist moments menu · 6 tiles per path · click a tile · jumps
                directly to that scene · CEO picks starting point per audience */}
            <div>
                <div className="flex items-baseline justify-between mb-3">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        What's inside this experience
                    </h2>
                    <span className="text-[11px] text-muted-foreground">
                        {landing.moments.length} moments · click any to start there
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {landing.moments.map(moment => {
                        const isHero = moment.stepId === landing.heroStepId
                        return (
                            <button
                                key={moment.stepId}
                                type="button"
                                onClick={() => onJumpToMoment?.(moment.stepId)}
                                className={`group text-left rounded-xl border p-3 transition-all hover:shadow-sm hover:border-primary/50 cursor-pointer ${
                                    isHero
                                        ? `bg-card border-primary/40 ring-1 ${toneCls.ring}`
                                        : 'bg-card border-border'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                                            {moment.stepId}
                                        </span>
                                        {moment.isCore && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/15 rounded px-1.5 py-0.5">
                                                Core
                                            </span>
                                        )}
                                        {isHero && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-ai bg-ai-light rounded px-1.5 py-0.5">
                                                <Star className="h-2.5 w-2.5" aria-hidden="true" />
                                                Hero
                                            </span>
                                        )}
                                    </div>
                                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
                                </div>
                                <p className="text-sm font-semibold text-foreground leading-tight mb-1">
                                    {moment.title}
                                </p>
                                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                                    {moment.description}
                                </p>
                                <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                                    <span className="tabular-nums">{moment.estTime}</span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Hero scene · rendered inline · full fidelity · no tour chrome ·
                the "aha moment" visible right below the moments menu · CEO
                can point at it while explaining */}
            <div>
                <div className="flex items-baseline justify-between mb-3">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Preview · hero moment
                    </h2>
                    <span className="text-[11px] text-muted-foreground">
                        Rendered live · full fidelity
                    </span>
                </div>
                <div className="rounded-2xl border border-border overflow-hidden bg-background">
                    {renderProjexScene(landing.heroStepId)}
                </div>
            </div>
        </div>
    )
}
