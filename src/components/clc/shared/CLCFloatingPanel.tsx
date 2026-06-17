import { useCallback, useEffect, useRef, useState, type RefObject, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface CLCFloatingPanelProps {
    open: boolean
    onClose: () => void
    anchorRef: RefObject<HTMLElement | null>
    children: ReactNode
    width?: number
    /** Anchor edge for horizontal alignment. Default: right edge of trigger
        aligns with right edge of panel. */
    anchor?: 'bottom-end' | 'bottom-start'
    title?: string
}

interface AnchorPos {
    top: number
    /** Distance from viewport right edge (used when anchor='bottom-end') */
    right?: number
    /** Distance from viewport left edge (used when anchor='bottom-start') */
    left?: number
}

const GAP = 8

/**
 * Portal-based floating popover with smart positioning.
 *
 * Pattern lifted from PreflightSummaryPopover (smart-comparator). Used by
 * CLCSummaryChipsBar to attach popovers to chip triggers without coupling
 * to Headless UI's Popover positioning (which clips inside scroll containers).
 *
 * Behavior:
 *  - createPortal to document.body so the panel escapes any overflow ancestor
 *  - recompute anchor on scroll (capture) + resize
 *  - click-outside (anchor + panel both excluded) closes
 *  - Escape closes
 */
export default function CLCFloatingPanel({ open, onClose, anchorRef, children, width = 360, anchor = 'bottom-end', title }: CLCFloatingPanelProps) {
    const [pos, setPos] = useState<AnchorPos | null>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    const recompute = useCallback(() => {
        const el = anchorRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        if (anchor === 'bottom-start') {
            setPos({ top: r.bottom + GAP, left: Math.max(8, r.left) })
        } else {
            setPos({ top: r.bottom + GAP, right: Math.max(8, window.innerWidth - r.right) })
        }
    }, [anchorRef, anchor])

    useEffect(() => {
        if (!open) return
        recompute()
        window.addEventListener('scroll', recompute, true)
        window.addEventListener('resize', recompute)
        return () => {
            window.removeEventListener('scroll', recompute, true)
            window.removeEventListener('resize', recompute)
        }
    }, [open, recompute])

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            const t = e.target as Node
            if (anchorRef.current?.contains(t)) return
            if (panelRef.current?.contains(t)) return
            onClose()
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open, anchorRef, onClose])

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open || !pos) return null

    return createPortal(
        <div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label={title}
            className="rounded-xl border border-border bg-card shadow-xl"
            style={{
                position: 'fixed',
                top: pos.top,
                ...(pos.right !== undefined ? { right: pos.right } : {}),
                ...(pos.left !== undefined ? { left: pos.left } : {}),
                width,
                maxHeight: '80vh',
                overflowY: 'auto',
                zIndex: 250,
            }}
        >
            {children}
        </div>,
        document.body
    )
}
