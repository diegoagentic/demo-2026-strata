/**
 * COMPONENT: PresenterNotesOverlay (F81.C · 2026-08-21)
 * PURPOSE: Discreet, presenter-only overlay que muestra script + anticipated
 *          questions + what-to-click-next para el current Acme Dealer step. Reduce
 *          cognitive load del CEO al presentar un demo que no domina.
 *
 *          Toggle behavior:
 *          - URL param `?presenter=1` · pre-activa el overlay al load
 *          - Keyboard shortcut `Cmd/Ctrl + Shift + P` · toggle on/off
 *          - Small round FAB (bottom-left) cuando está hidden · click reveals
 *
 *          Persistence · sessionStorage · sobrevive refresh dentro de la
 *          misma pestaña · no cross-tab (intencional · presenter's tab only).
 *
 *          Client-hostile design · overlay small · bottom-left corner ·
 *          semi-transparent border · rendered above content pero no
 *          full-screen · el cliente puede notarlo pero no lee sin esfuerzo.
 *
 * DS TOKENS: bg-card · text-foreground · border-border · bg-ai-light · text-ai
 *
 * USED BY: App.tsx · siempre mounted · el component decide internamente si
 *          renderea (checks isAcmeDealer + isDemoActive + notes disponibles para
 *          el current step).
 */

import { useEffect } from 'react'
import { BookOpen, X, MessageCircle, Play, ChevronRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import { useDemoProfile } from '../../context/useDemoProfile'
import { ACME_DEALER_PRESENTER_NOTES } from '../../config/profiles/acme-dealer'
import { usePersistedToggle } from './hooks/usePersistedToggle'

export default function PresenterNotesOverlay() {
    const { activeProfile } = useDemoProfile()
    const { currentStep, isDemoActive } = useDemo()
    const [visible, setVisible] = usePersistedToggle('acme-dealer-presenter-mode', false, 'presenter')

    // Keyboard shortcut · Cmd/Ctrl + Shift + P
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
                setVisible(v => !v)
                e.preventDefault()
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [setVisible])

    // Guards · solo Acme Dealer profile · solo con demo activo (los notes son
    // per-step) · solo si hay notes para el step actual
    if (activeProfile.id !== 'acme-dealer') return null
    if (!isDemoActive || !currentStep) return null
    const notes = ACME_DEALER_PRESENTER_NOTES[currentStep.id]

    // Even sin notes · mostrar el FAB para que el presenter sepa que existe
    // el modo · click reveals + estado "no notes for this step yet"
    if (!visible) {
        return (
            <button
                type="button"
                onClick={() => setVisible(true)}
                className="fixed bottom-6 left-6 z-[500] rounded-full bg-ai text-white p-2.5 shadow-lg opacity-40 hover:opacity-100 transition-opacity"
                title="Show presenter notes (Cmd/Ctrl + Shift + P)"
                aria-label="Show presenter notes"
            >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
            </button>
        )
    }

    return (
        <div
            className="fixed bottom-6 left-6 z-[500] w-96 max-h-[75vh] overflow-y-auto rounded-xl bg-card border-2 border-ai/40 shadow-2xl flex flex-col"
            role="complementary"
            aria-label="Presenter notes"
        >
            {/* Header · Presenter mode label + step id + close */}
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border bg-ai-light shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="h-3.5 w-3.5 text-ai shrink-0" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ai">
                        Presenter mode
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground truncate">
                        {currentStep.id} · {currentStep.title}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors shrink-0"
                    aria-label="Hide presenter notes (Cmd/Ctrl + Shift + P)"
                    title="Hide · Cmd/Ctrl + Shift + P"
                >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            </div>

            {/* Body · say · ask · next */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {!notes ? (
                    <div className="text-[12px] text-muted-foreground italic leading-relaxed">
                        No presenter notes for this step yet. The core moments (hero + AI + human gate per path) have full notes · secondary detail steps are added iteratively.
                    </div>
                ) : (
                    <>
                        {/* SAY · main script · big text */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <MessageCircle className="h-3 w-3 text-ai" aria-hidden="true" />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Say
                                </span>
                            </div>
                            <p className="text-[13px] leading-relaxed text-foreground">
                                {notes.say}
                            </p>
                        </div>

                        {/* ASK · anticipated Q&A */}
                        {notes.ask && notes.ask.length > 0 && (
                            <div>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                        If they ask ({notes.ask.length})
                                    </span>
                                </div>
                                <ul className="space-y-2">
                                    {notes.ask.map((qa, idx) => (
                                        <li key={idx} className="text-[12px] leading-snug rounded-md bg-muted/40 border border-border/50 p-2">
                                            <p className="font-semibold text-foreground">
                                                Q: {qa.q}
                                            </p>
                                            <p className="text-muted-foreground mt-0.5">
                                                A: {qa.a}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* NEXT · what to click */}
                        {notes.next && (
                            <div className="rounded-md bg-primary/10 border border-primary/30 p-2 flex items-start gap-2">
                                <Play className="h-3.5 w-3.5 text-foreground shrink-0 mt-0.5" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                                        Next
                                    </p>
                                    <p className="text-[12px] leading-snug text-foreground">
                                        {notes.next}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* DON'T SAY (internal caveats) · shown small · orange border */}
                        {notes.dontSay && notes.dontSay.length > 0 && (
                            <div className="rounded-md bg-warning-light border border-warning/30 p-2">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-warning mb-1">
                                    Don't mention
                                </p>
                                <ul className="text-[11px] text-foreground space-y-0.5">
                                    {notes.dontSay.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-1.5">
                                            <ChevronRight className="h-2.5 w-2.5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer · hotkey reminder */}
            <div className="px-4 py-2 border-t border-border bg-muted/30 shrink-0 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Presenter-only · not visible to audience</span>
                <span className="font-mono">⌘⇧P</span>
            </div>
        </div>
    )
}
