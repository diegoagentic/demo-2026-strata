/**
 * HOOK: usePersistedToggle (F81.C · 2026-08-21)
 * PURPOSE: Boolean toggle whose state persists across page reloads via
 *          sessionStorage. Used by PresenterNotesOverlay para que el
 *          presenter no tenga que re-abrir el overlay cada refresh.
 *
 *          También reads URL query param on mount to allow deep-link
 *          activation (`?presenter=1` sets initial value to true).
 */

import { useCallback, useEffect, useState } from 'react'

/**
 * Boolean toggle backed by sessionStorage + optional URL query bootstrap.
 *
 * @param key sessionStorage key · e.g. `'acme-dealer-presenter-mode'`
 * @param defaultValue initial value when nothing is stored or in the URL
 * @param urlParam optional URL query param to check on mount · when found
 *   with truthy value (`1`, `true`, `yes`), initial value is true
 * @returns tuple `[value, setValue]` · setValue accepts a value or updater fn
 */
export function usePersistedToggle(
    key: string,
    defaultValue = false,
    urlParam?: string,
): [boolean, (value: boolean | ((prev: boolean) => boolean)) => void] {
    const [value, setValueState] = useState<boolean>(() => {
        if (typeof window === 'undefined') return defaultValue
        // URL bootstrap wins over storage
        if (urlParam) {
            const url = new URL(window.location.href)
            const param = url.searchParams.get(urlParam)
            if (param && ['1', 'true', 'yes'].includes(param.toLowerCase())) {
                return true
            }
        }
        try {
            const stored = window.sessionStorage.getItem(key)
            if (stored === 'true') return true
            if (stored === 'false') return false
        } catch {
            // sessionStorage unavailable (private mode · SSR) · use default
        }
        return defaultValue
    })

    const setValue = useCallback(
        (next: boolean | ((prev: boolean) => boolean)) => {
            setValueState(prev => {
                const resolved = typeof next === 'function' ? next(prev) : next
                try {
                    window.sessionStorage.setItem(key, String(resolved))
                } catch {
                    // ignore
                }
                return resolved
            })
        },
        [key],
    )

    // Sync value if the storage changes in another tab (rare but possible)
    useEffect(() => {
        if (typeof window === 'undefined') return
        const handler = (e: StorageEvent) => {
            if (e.key === key && e.newValue !== null) {
                setValueState(e.newValue === 'true')
            }
        }
        window.addEventListener('storage', handler)
        return () => window.removeEventListener('storage', handler)
    }, [key])

    return [value, setValue]
}
