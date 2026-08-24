/**
 * COMPONENT: AcmeDealerPathLanding (F81.B → F82.1 · 2026-08-21 · minimal)
 * PURPOSE: CEO-intuitive tour intro · UN solo screen with UNA acción
 *          primaria per path. Reduce cognitive load post-heuristic
 *          evaluation (Nielsen #8 · Fitts + Hicks + 3-second rule).
 *
 *          Renders 4 elements only:
 *            1. Small breadcrumb (Experience · Path short)
 *            2. Big title (path label)
 *            3. 1-line pitch (from tagline)
 *            4. ONE big primary "Start the demo" button
 *
 *          REMOVED post-F82.1 · value chip (moved to DemoSidebar THIS PATH
 *          section) · 2 CTAs pair (merged to 1 Start button) · moments
 *          menu grid (moved to DemoSidebar MOMENTS section) · hero scene
 *          preview (redundant · scene renders after click).
 *
 * DS TOKENS: bg-card · text-foreground · border-border · bg-primary +
 *            text-primary-foreground · text-muted-foreground
 *
 * SOURCE OF TRUTH: ACME_DEALER_PATH_LANDINGS in src/config/profiles/acme-dealer.ts
 * USED BY: AcmeDealerPage.tsx cuando `!hasBegunPath.has(activePathId)` (F81.D)
 */

import { PlayCircle, ChevronRight } from 'lucide-react'
import {
    ACME_DEALER_PATH_LANDINGS,
    ACME_DEALER_EXPERIENCE_GROUPS,
    experienceOf,
    type AcmeDealerFlowId,
} from '../../config/profiles/acme-dealer'

interface AcmeDealerPathLandingProps {
    pathId: AcmeDealerFlowId
    /** Fired when user clicks "Start the demo" · caller advances a la primera
        scene del path · marca hasBegunPath para no volver a mostrar el landing. */
    onStart?: () => void
    /**
     * @deprecated post-F82.1 · el 2-CTA split (guided vs explore) fue
     * consolidado en un solo Start button · props conservadas por
     * backwards-compat pero se ignoran.
     */
    onStartGuided?: () => void
    /** @deprecated post-F82.1 · ver `onStart`. */
    onStartExplore?: () => void
    /**
     * @deprecated post-F82.1 · el moments menu se movió al DemoSidebar
     * (F82.2) · CEO clicka un tile ahí · jumps directo a esa scene · no
     * necesitamos el jump-from-landing path anymore.
     */
    onJumpToMoment?: (stepId: string) => void
}

export default function AcmeDealerPathLanding({
    pathId,
    onStart,
    onStartGuided, // deprecated · silent compat
    onStartExplore, // deprecated · silent compat
    onJumpToMoment, // deprecated · silent compat
}: AcmeDealerPathLandingProps) {
    void onStartExplore; void onJumpToMoment;

    const landing = ACME_DEALER_PATH_LANDINGS[pathId]
    if (!landing) return null

    const experience = experienceOf(pathId)
    const group = ACME_DEALER_EXPERIENCE_GROUPS.find(g => g.id === experience)
    const flow = group?.flows.find(f => f.id === pathId)
    if (!flow) return null

    // Consolidated handler · click Start · usa onStart si existe, sino cae
    // a onStartGuided para backwards-compat (AcmeDealerPage F81.D wired onStartGuided).
    const handleStart = onStart ?? onStartGuided ?? (() => {})

    return (
        <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-start gap-6">
            {/* 1 · Breadcrumb · small · orient CEO */}
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono text-muted-foreground">
                <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">
                    {experience === 'expert-hub' ? 'Expert Hub' : 'Dealer Experience'}
                </span>
                <ChevronRight className="h-3 w-3 opacity-50" aria-hidden="true" />
                <span className="text-foreground font-semibold">{flow.short}</span>
            </div>

            {/* 2 · Big title · path name */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {flow.label}
            </h1>

            {/* 3 · 1-line pitch · what this path does · plain language */}
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {landing.tagline}
            </p>

            {/* 4 · ONE big primary CTA · start the demo */}
            <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center gap-2.5 bg-primary text-primary-foreground text-base font-semibold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-md mt-2"
            >
                <PlayCircle className="h-5 w-5" aria-hidden="true" />
                Start the demo
            </button>
        </div>
    )
}
