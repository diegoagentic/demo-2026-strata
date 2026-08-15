import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useToast, ToastContainer } from '../Toast'

function TestHarness() {
    const { toasts, showToast, dismiss } = useToast()
    return (
        <>
            <button onClick={() => showToast({ type: 'success', message: 'Saved!' })}>
                Fire success
            </button>
            <button onClick={() => showToast({ type: 'error', message: 'Failed!' })}>
                Fire error
            </button>
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </>
    )
}

describe('Toast system', () => {
    it('renders no toasts initially', () => {
        render(<TestHarness />)
        expect(screen.queryByText('Saved!')).not.toBeInTheDocument()
    })

    it('shows a success toast when fired', () => {
        render(<TestHarness />)
        act(() => {
            screen.getByText('Fire success').click()
        })
        expect(screen.getByText('Saved!')).toBeInTheDocument()
    })

    it('shows an error toast when fired', () => {
        render(<TestHarness />)
        act(() => {
            screen.getByText('Fire error').click()
        })
        expect(screen.getByText('Failed!')).toBeInTheDocument()
    })

    it('auto-dismisses after duration', async () => {
        vi.useFakeTimers()
        render(<TestHarness />)
        act(() => {
            screen.getByText('Fire success').click()
        })
        expect(screen.getByText('Saved!')).toBeInTheDocument()
        act(() => {
            vi.advanceTimersByTime(5000)
        })
        expect(screen.queryByText('Saved!')).not.toBeInTheDocument()
        vi.useRealTimers()
    })
})
