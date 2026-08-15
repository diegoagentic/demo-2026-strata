/**
 * SDB-1315 · FE-14 — Toast Notification System
 *
 * Lightweight toast for PO conversion feedback. Shows success / error /
 * info toasts in the top-right corner with auto-dismiss.
 *
 * Usage:
 *   const { showToast, toasts } = useToast()
 *   showToast({ type: 'success', message: 'PO finalized' })
 *   <ToastContainer toasts={toasts} onDismiss={...} />
 */

import { useState, useCallback } from 'react'
import { clsx } from 'clsx'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

// ── Types ──

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
    id: string
    type: ToastType
    message: string
}

interface ShowToastInput {
    type: ToastType
    message: string
    duration?: number
}

// ── Hook ──

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const showToast = useCallback(
        ({ type, message, duration = 4000 }: ShowToastInput) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
            setToasts((prev) => [...prev, { id, type, message }])
            setTimeout(() => dismiss(id), duration)
        },
        [dismiss]
    )

    return { toasts, showToast, dismiss }
}

// ── Renderer ──

const STYLE: Record<
    ToastType,
    { bg: string; border: string; text: string; icon: typeof CheckCircle2 }
> = {
    success: {
        bg: 'bg-green-500/10 dark:bg-green-500/15',
        border: 'border-green-500/30',
        text: 'text-green-700 dark:text-green-400',
        icon: CheckCircle2,
    },
    error: {
        bg: 'bg-red-500/10 dark:bg-red-500/15',
        border: 'border-red-500/30',
        text: 'text-red-700 dark:text-red-400',
        icon: AlertTriangle,
    },
    info: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
        border: 'border-blue-500/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: Info,
    },
}

interface ToastContainerProps {
    toasts: Toast[]
    onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null
    return (
        <div className="fixed top-6 right-6 z-[200] space-y-2 w-80 max-w-[calc(100vw-3rem)] pointer-events-none">
            {toasts.map((toast) => {
                const style = STYLE[toast.type]
                const Icon = style.icon
                return (
                    <div
                        key={toast.id}
                        className={clsx(
                            'flex items-start gap-2 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-300',
                            style.bg,
                            style.border
                        )}
                    >
                        <Icon className={clsx('w-4 h-4 shrink-0 mt-0.5', style.text)} />
                        <p className="flex-1 text-xs font-semibold text-foreground leading-snug">
                            {toast.message}
                        </p>
                        <button
                            type="button"
                            onClick={() => onDismiss(toast.id)}
                            className="shrink-0 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
