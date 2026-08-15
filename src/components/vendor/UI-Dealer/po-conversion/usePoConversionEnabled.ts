import { useMemo } from 'react'

/**
 * FE-13 — Feature Flag Hook
 * Returns whether PO conversion is enabled for the current tenant.
 * Reads from tenant config. Defaults to false.
 *
 * TODO: Replace mock with real tenant config when backend is ready.
 */
export function usePoConversionEnabled(): boolean {
    return useMemo(() => {
        // Mock: enabled for demo purposes. Replace with tenant config lookup.
        const flag = localStorage.getItem('FEATURE_PO_CONVERSION_ENABLED')
        return flag === 'true' || flag === null // default true for demo
    }, [])
}
