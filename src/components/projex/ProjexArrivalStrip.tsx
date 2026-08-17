/**
 * COMPONENT: ProjexArrivalStrip (Projex · F75)
 * PURPOSE: Lightweight context banner that sits at the top of a scene to
 *          signal WHERE the user arrived from within the platform. Fixes the
 *          "floating screen" issue flagged by user 2026-08-17: each loose
 *          scene now shows a breadcrumb + focus row so viewers see the
 *          platform trail, not just the specific screen.
 *
 *          Pattern: platform tab breadcrumb + "you are working on X" chip.
 *          Zero drill-in interaction · just visual context.
 *
 * DS TOKENS: bg-muted/40 · border-border · text-foreground · text-muted-foreground
 *            · bg-primary/15 · bg-ai-light · text-ai
 *
 * USED BY: 18 loose Projex scenes across F2/F3/F4/F5 (per audit 2026-08-17)
 * REUSE: ProjexExperienceShell provides the platform chrome above · this strip
 *        provides the in-platform breadcrumb below the shell.
 */

import type { ReactNode } from 'react'
import { ChevronRight, MapPin } from 'lucide-react'

interface ProjexArrivalStripProps {
    /** Breadcrumb crumbs · rendered left-to-right with ChevronRight separators.
        Last crumb is the current focus (highlighted). */
    breadcrumb: string[]
    /** Optional focus chip · e.g. "Warehouse by Design ticket · Kelly submitted 2 min ago" */
    focus?: {
        label: string
        icon?: ReactNode
        tone?: 'primary' | 'ai' | 'info' | 'warning' | 'muted'
    }
    /** Optional right-side hint · e.g. "3 sibling tickets in queue · 1 escalated" */
    hint?: string
}

const TONE_CLASSES: Record<NonNullable<ProjexArrivalStripProps['focus']>['tone'] & string, string> = {
    primary: 'bg-primary/15 text-foreground',
    ai:      'bg-ai-light text-ai',
    info:    'bg-info/10 text-info',
    warning: 'bg-warning/10 text-warning',
    muted:   'bg-muted text-muted-foreground',
}

export default function ProjexArrivalStrip({ breadcrumb, focus, hint }: ProjexArrivalStripProps) {
    const focusTone = focus?.tone ?? 'primary'
    return (
        <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 flex items-center gap-2 flex-wrap">
                {/* Breadcrumb */}
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                <nav aria-label="Platform breadcrumb" className="flex items-center gap-1 text-[11px] font-mono">
                    {breadcrumb.map((crumb, idx) => {
                        const isLast = idx === breadcrumb.length - 1
                        return (
                            <span key={idx} className="flex items-center gap-1">
                                <span className={isLast ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
                                    {crumb}
                                </span>
                                {!isLast && <ChevronRight className="h-3 w-3 text-muted-foreground/50" aria-hidden="true" />}
                            </span>
                        )
                    })}
                </nav>

                {/* Focus chip · what the user is working on */}
                {focus && (
                    <>
                        <span className="text-muted-foreground/50 text-[11px]" aria-hidden="true">·</span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded px-2 py-0.5 ${TONE_CLASSES[focusTone]}`}>
                            {focus.icon}
                            {focus.label}
                        </span>
                    </>
                )}

                {/* Right-side hint */}
                {hint && (
                    <span className="ml-auto text-[11px] text-muted-foreground italic">
                        {hint}
                    </span>
                )}
            </div>
        </div>
    )
}
