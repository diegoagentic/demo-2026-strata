/**
 * SDB-1315 · FE-10 — ArtifactDownloads
 *
 * Grid of downloadable file cards for a PO. Each card shows the file
 * icon (by format), filename, size, date, and a direct download CTA.
 * Single click triggers download via the artifact's downloadUrl.
 */

import { useState, Fragment } from 'react'
import { clsx } from 'clsx'
import { Download, Eye, File, FileSpreadsheet, FileText, Code, X } from 'lucide-react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import type { POArtifact } from './types'

interface ArtifactDownloadsProps {
    artifacts: POArtifact[]
    loading?: boolean
}

const FORMAT_ICON: Record<POArtifact['format'], typeof FileText> = {
    pdf: FileText,
    csv: FileSpreadsheet,
    edi: Code,
    xml: Code,
}

const FORMAT_COLOR: Record<POArtifact['format'], string> = {
    pdf: 'bg-red-500/10 text-red-600 dark:text-red-400',
    csv: 'bg-green-500/10 text-green-600 dark:text-green-400',
    edi: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    xml: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

export default function ArtifactDownloads({
    artifacts,
    loading = false,
}: ArtifactDownloadsProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewName, setPreviewName] = useState('')
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-24 rounded-xl bg-muted/40 animate-pulse"
                    />
                ))}
            </div>
        )
    }

    if (artifacts.length === 0) {
        return (
            <div className="rounded-2xl bg-muted/20 border border-border p-6 text-center">
                <File className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">
                    No artifacts yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Artifacts will appear here after the PO is submitted.
                </p>
            </div>
        )
    }

    // FE-09: group by artifact type
    const TYPE_LABELS: Record<string, string> = {
        submission_payload: 'Submission Payloads',
        confirmation: 'Confirmations',
        revision_snapshot: 'Revision Snapshots',
    }
    const grouped = artifacts.reduce<Record<string, typeof artifacts>>((acc, a) => {
        const key = a.type
        if (!acc[key]) acc[key] = []
        acc[key].push(a)
        return acc
    }, {})

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        {TYPE_LABELS[type] ?? type.replace(/_/g, ' ')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.map((artifact) => {
                const Icon = FORMAT_ICON[artifact.format] ?? File
                const colorClass = FORMAT_COLOR[artifact.format] ?? 'bg-muted/50 text-muted-foreground'
                return (
                    <a
                        key={artifact.id}
                        href={artifact.downloadUrl}
                        download={artifact.fileName}
                        className="group flex items-start gap-3 rounded-xl bg-card dark:bg-zinc-800 border border-border hover:border-primary/40 p-3 transition-colors"
                    >
                        <div
                            className={clsx(
                                'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                                colorClass
                            )}
                        >
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {artifact.fileName}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {artifact.format.toUpperCase()} · {formatFileSize(artifact.fileSize)} · {fmtDate(artifact.createdAt)}
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                                {artifact.type.replace(/_/g, ' ')}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0 mt-1">
                            {artifact.format === 'pdf' && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setPreviewUrl(artifact.downloadUrl)
                                        setPreviewName(artifact.fileName)
                                    }}
                                    className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                                    title="Preview PDF"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </a>
                )
                        })}
                    </div>
                </div>
            ))}

            {/* PDF Preview Modal (FE-09 requirement) */}
            <Transition show={previewUrl !== null} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-[100]"
                    onClose={() => setPreviewUrl(null)}
                >
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm" />
                    </TransitionChild>
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-4xl h-[85vh] bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        <span className="text-sm font-bold text-foreground">
                                            {previewName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={previewUrl ?? '#'}
                                            download={previewName}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                        >
                                            <Download className="w-3 h-3" />
                                            Download
                                        </a>
                                        <button
                                            onClick={() => setPreviewUrl(null)}
                                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-8">
                                    {/* In production this would embed the S3 presigned URL
                                        in an iframe. For the mock we show a placeholder. */}
                                    <div className="text-center space-y-3">
                                        <FileText className="w-16 h-16 text-red-500/30 mx-auto" />
                                        <p className="text-sm font-semibold text-foreground">
                                            PDF Preview
                                        </p>
                                        <p className="text-xs text-muted-foreground max-w-xs">
                                            In production this panel embeds the PDF from the S3
                                            presigned URL. The mock shows this placeholder.
                                        </p>
                                        <p className="text-[10px] font-mono text-muted-foreground/60 truncate max-w-sm">
                                            {previewUrl}
                                        </p>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
