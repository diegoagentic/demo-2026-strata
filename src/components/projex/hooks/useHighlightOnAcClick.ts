/**
 * HOOK: useHighlightOnAcClick (Projex · F76)
 * PURPOSE: Reusable listener para el Action Center CTA click. Cuando el AC
 *          event fires (e.g. `projex:jacob-gate-open`) · el hook:
 *            (a) devuelve `true` para 3s (usar para conditional pulse className)
 *            (b) scrollea el primer elemento `[data-ac-highlight]` del DOM
 *                al centro del viewport (smooth)
 *
 *          El pattern (SCENE-OWN-FOCUS del F76 audit) evita el bug UX
 *          reportado por user 2026-08-17: AC click auto-advance skipping
 *          la acción de la scene. Ahora AC click = "here's what to click"
 *          en lugar de "click for you".
 *
 *          El scene debe:
 *          1. Llamar el hook con su event name → obtiene `pulse: boolean`
 *          2. Marcar su primary CTA con `data-ac-highlight` attribute
 *          3. Aplicar conditional className basado en `pulse`
 *
 *          Nota · el event NO debe estar en `AC_FALLBACK_EVENTS` (ProjexPage)
 *          o el fallback listener también advance el step en paralelo.
 *          Agregar el event a `SCENE_HANDLED_EVENTS` para bypass fallback.
 *
 * USED BY: 8 Projex scenes (p2.4 · p2.6 · p3.2 · p3.3 · p3.5 · p4.1 · p4.5 · p5.4)
 */

import { useEffect, useState } from 'react'

export function useHighlightOnAcClick(eventName: string, durationMs = 3000): boolean {
    const [pulse, setPulse] = useState(false)

    useEffect(() => {
        const trigger = () => {
            setPulse(true)
            // Scroll el elemento marcado al centro del viewport (smooth)
            const target = document.querySelector<HTMLElement>('[data-ac-highlight]')
            target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Auto-clear el pulse después de durationMs
            const t = setTimeout(() => setPulse(false), durationMs)
            // Cleanup timer si el hook se desmonta antes
            return () => clearTimeout(t)
        }
        window.addEventListener(eventName, trigger)
        return () => window.removeEventListener(eventName, trigger)
    }, [eventName, durationMs])

    return pulse
}
