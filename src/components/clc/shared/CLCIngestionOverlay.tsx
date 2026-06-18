import { useEffect, useState } from 'react'
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react'

interface CLCIngestionOverlayProps {
    /** Called once the ingestion sequence finishes · the parent uses it
        to trigger the calendar redirect + highlight + pulse. */
    onComplete: () => void
}

const PHASES: string[] = [
    'Pulling J-44099 from IQ reporting API',
    'Parsing vendor schedule · KI · 2-crew',
    'Checking capacity · NY · week of Jun 1, 2026',
    'Ready to publish · no conflicts',
]

const STEP_MS = 480
const FINAL_PAUSE_MS = 420

/**
 * Strata "is processing the inbound IQ request" overlay · plays for
 * ~2350ms between the Action Center CTA click and the actual scene
 * redirect. Narratively replaces an instant teleport with a beat that
 * shows the AI doing real work.
 *
 * Wired in CLCCalendarScene as the first stage of the
 * `clc:inbound-job-open` event handler · its onComplete then runs the
 * existing setViewMode/inboundReviewJobId redirect.
 */
export default function CLCIngestionOverlay({ onComplete }: CLCIngestionOverlayProps) {
    const [phase, setPhase] = useState(0)

    useEffect(() => {
        const timers: number[] = []
        PHASES.forEach((_, i) => {
            timers.push(window.setTimeout(() => setPhase(i + 1), (i + 1) * STEP_MS))
        })
        timers.push(window.setTimeout(onComplete, PHASES.length * STEP_MS + FINAL_PAUSE_MS))
        return () => timers.forEach(t => clearTimeout(t))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-foreground/30 backdrop-blur-sm"
            role="status"
            aria-live="polite"
        >
            <div className="bg-card border border-ai/40 rounded-2xl shadow-2xl p-5 max-w-md w-full mx-4">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-ai animate-pulse" />
                    <h3 className="text-sm font-bold text-foreground">Strata is processing the IQ install request</h3>
                </div>
                <ul className="space-y-2.5">
                    {PHASES.map((label, idx) => {
                        const isComplete = idx < phase
                        const isActive = idx === phase
                        return (
                            <li key={idx} className="flex items-center gap-2.5 text-xs">
                                {isComplete ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                ) : isActive ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-ai shrink-0" />
                                ) : (
                                    <span className="h-3.5 w-3.5 rounded-full border border-border shrink-0" aria-hidden />
                                )}
                                <span className={isComplete || isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                    {label}
                                </span>
                            </li>
                        )
                    })}
                </ul>
                <div className="mt-4 h-1 rounded-full bg-muted overflow-hidden" aria-hidden>
                    <div
                        className="h-full bg-ai transition-all duration-500 ease-out"
                        style={{ width: `${(phase / PHASES.length) * 100}%` }}
                    />
                </div>
                <p className="mt-3 text-[10px] text-muted-foreground text-center">
                    Troy Public Library · J-44099 · Inbound from IQ reporting API
                </p>
            </div>
        </div>
    )
}
