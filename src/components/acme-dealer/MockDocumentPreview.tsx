/**
 * COMPONENT: MockDocumentPreview (Acme Dealer)
 * PURPOSE: Generic document preview modal shell · adapted del canonical
 *          officeworks/PDFPreviewModal.tsx pattern (Dialog + header + footer +
 *          scrollable body). No iframe here porque los docs en el demo Acme Dealer
 *          son mocked (vendors ficticios · no tenemos PDFs reales). Renders
 *          `children` como body content · consumers (W9DocumentPreview,
 *          TeknionInvoicePreview, etc.) inyectan el layout específico del
 *          document type.
 *
 * DS TOKENS: bg-card · bg-background · bg-muted · border-border · text-foreground
 *            · text-muted-foreground · bg-ai-light + text-ai · bg-success
 *
 * USED BY: W9DocumentPreview · TeknionInvoicePreview · (future: proforma, ACK, etc.)
 * REUSE FROM: officeworks/shared/PDFPreviewModal.tsx (shell shape)
 */

import { Fragment, type ReactNode } from 'react'
import { Dialog, Transition, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react'
import { X, Download, FileText, Maximize2 } from 'lucide-react'

interface MockDocumentPreviewProps {
    isOpen: boolean
    onClose: () => void
    fileName: string
    /** Optional badge next to filename · e.g. "Signed · 2026-03-12" */
    headerBadge?: { label: string; tone: 'success' | 'ai' | 'warning' | 'muted' }
    /** Subtitle line under filename · e.g. "312 KB · signed 2026-03-12" */
    subtitle?: string
    /** Optional icon override in the header · defaults to FileText. */
    icon?: ReactNode
    /** Document body content (rendered inside scrollable area). */
    children: ReactNode
    /** Optional footer content (compliance chip + note). */
    footer?: ReactNode
    /** Max width of the panel · defaults to 3xl. */
    width?: '2xl' | '3xl' | '4xl'
}

const BADGE_TONE: Record<NonNullable<MockDocumentPreviewProps['headerBadge']>['tone'], string> = {
    success: 'bg-success/10 text-success border-success/20',
    ai:      'bg-ai-light text-ai border-ai/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    muted:   'bg-muted text-muted-foreground border-border',
}

const WIDTH_CLASS: Record<NonNullable<MockDocumentPreviewProps['width']>, string> = {
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
}

export default function MockDocumentPreview({
    isOpen,
    onClose,
    fileName,
    headerBadge,
    subtitle,
    icon,
    children,
    footer,
    width = '3xl',
}: MockDocumentPreviewProps) {
    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[350]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className={`w-full ${WIDTH_CLASS[width]} max-h-[90vh] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden`}>
                            {/* Header */}
                            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted/30 shrink-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-foreground shrink-0">
                                        {icon ?? <FileText className="h-4 w-4" aria-hidden="true" />}
                                    </div>
                                    <div className="min-w-0">
                                        <DialogTitle className="text-sm font-bold text-foreground truncate flex items-center gap-2 flex-wrap">
                                            {fileName}
                                            {headerBadge && (
                                                <span className={`text-[10px] uppercase tracking-wider font-semibold border px-1.5 py-0.5 rounded ${BADGE_TONE[headerBadge.tone]}`}>
                                                    {headerBadge.label}
                                                </span>
                                            )}
                                        </DialogTitle>
                                        {subtitle && (
                                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        disabled
                                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-card text-[11px] text-muted-foreground opacity-50 cursor-not-allowed"
                                        aria-label="Open in new tab (disabled · mock document)"
                                        title="Mock document · new tab disabled"
                                    >
                                        <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                                        <span className="hidden sm:inline">Open</span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled
                                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-card text-[11px] text-muted-foreground opacity-50 cursor-not-allowed"
                                        aria-label="Download (disabled · mock document)"
                                        title="Mock document · download disabled"
                                    >
                                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                        <span className="hidden sm:inline">Download</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border bg-card hover:bg-muted text-foreground transition-colors"
                                        aria-label="Close preview"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            {/* Body · scrollable */}
                            <div className="flex-1 bg-muted/50 p-6 overflow-y-auto min-h-0">
                                {children}
                            </div>

                            {/* Footer */}
                            {footer && (
                                <div className="border-t border-border bg-muted/20 px-5 py-2 shrink-0">
                                    {footer}
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
