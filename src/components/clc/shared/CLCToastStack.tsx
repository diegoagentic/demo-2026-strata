import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface Toast {
    id: string
    customer: string
}

const TOAST_DURATION_MS = 2800

/**
 * Listens for `clc:job-published` window events and renders a small
 * stacked toast (top-right of the viewport). Each toast lives for
 * TOAST_DURATION_MS · enough to read without becoming visual noise.
 *
 * Mounted once at the top of CLCCalendarScene · no props.
 *
 * Event payload shape:
 *   detail: { jobId: string; customer: string }
 */
export default function CLCToastStack() {
    const [toasts, setToasts] = useState<Toast[]>([])

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as { jobId?: string; customer?: string } | undefined
            if (!detail?.jobId) return
            const id = `${detail.jobId}-${performance.now()}`
            const customer = detail.customer ?? 'Install job'
            setToasts(prev => [...prev, { id, customer }])
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, TOAST_DURATION_MS)
        }
        window.addEventListener('clc:job-published', handler)
        return () => window.removeEventListener('clc:job-published', handler)
    }, [])

    if (toasts.length === 0) return null

    return (
        <>
            <div
                className="fixed top-24 right-6 z-[10001] flex flex-col gap-2 max-w-sm pointer-events-none"
                aria-live="polite"
                aria-atomic="false"
            >
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-success/30 bg-card shadow-lg pointer-events-auto"
                        style={{ animation: 'clcToastSlideIn 220ms ease-out' }}
                        role="status"
                    >
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        <div className="text-xs min-w-0">
                            <div className="font-bold text-foreground">Sent to Outlook</div>
                            <div className="text-muted-foreground truncate">{toast.customer}</div>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes clcToastSlideIn {
                    from { transform: translateX(24px); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
            `}</style>
        </>
    )
}
