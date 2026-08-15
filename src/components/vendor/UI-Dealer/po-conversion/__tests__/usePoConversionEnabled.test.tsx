import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { usePoConversionEnabled } from '../usePoConversionEnabled'

describe('usePoConversionEnabled', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('defaults to enabled when no flag is set (demo default)', () => {
        const { result } = renderHook(() => usePoConversionEnabled())
        expect(result.current).toBe(true)
    })

    it('returns true when flag is set to "true"', () => {
        localStorage.setItem('FEATURE_PO_CONVERSION_ENABLED', 'true')
        const { result } = renderHook(() => usePoConversionEnabled())
        expect(result.current).toBe(true)
    })

    it('returns false when flag is explicitly set to "false"', () => {
        localStorage.setItem('FEATURE_PO_CONVERSION_ENABLED', 'false')
        const { result } = renderHook(() => usePoConversionEnabled())
        expect(result.current).toBe(false)
    })
})
