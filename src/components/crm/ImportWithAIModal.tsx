import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Check, CheckCircle2, FileText, Image as ImageIcon, File as FileIcon, Mail, Paperclip, Ruler, Sparkles, UploadCloud, X } from 'lucide-react'
import { deriveExtraction, fileKind, prettySize } from '../../config/profiles/crm-data'
import type { ImportFile, ExtractionResult, Opportunity } from '../../config/profiles/crm-data'

interface Props {
    isOpen: boolean
    onClose: () => void
    onCreate: (prefill: Opportunity) => void
}

const KIND_META: Record<
    ImportFile['kind'],
    { Icon: typeof Mail; bgClass: string; fgClass: string; reads: string }
> = {
    email: { Icon: Mail, bgClass: 'bg-blue-500/15', fgClass: 'text-blue-700 dark:text-blue-400', reads: 'Stakeholders, intent, timeline' },
    pdf: { Icon: FileText, bgClass: 'bg-red-500/15', fgClass: 'text-red-700 dark:text-red-400', reads: 'Scope, pricing, specifications' },
    cad: { Icon: Ruler, bgClass: 'bg-emerald-500/15', fgClass: 'text-emerald-700 dark:text-emerald-400', reads: 'Station count, layout, square footage' },
    image: { Icon: ImageIcon, bgClass: 'bg-yellow-500/15', fgClass: 'text-yellow-800 dark:text-yellow-400', reads: 'Site & product context' },
    other: { Icon: FileIcon, bgClass: 'bg-muted', fgClass: 'text-muted-foreground', reads: 'Attached for reference' },
}

type Phase = 'idle' | 'scanning' | 'done'

// Strata AI Import modal · drag&drop · file list · scanning progress · draft review.
// Portado del standalone con DS tokens · headless UI Dialog para z-index/escape/portal.
export default function ImportWithAIModal({ isOpen, onClose, onCreate }: Props) {
    const [files, setFiles] = useState<ImportFile[]>([])
    const [phase, setPhase] = useState<Phase>('idle')
    const [scanned, setScanned] = useState(0)
    const [result, setResult] = useState<ExtractionResult | null>(null)
    const [over, setOver] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const addFiles = (list: FileList) => {
        const mapped: ImportFile[] = Array.from(list).map(f => ({
            name: f.name,
            size: f.size || 0,
            kind: fileKind(f.name),
        }))
        setFiles(prev => [...prev, ...mapped])
    }
    const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i))

    const analyze = () => {
        if (!files.length) return
        setPhase('scanning')
        setScanned(0)
        let n = 0
        const tick = setInterval(() => {
            n += 1
            setScanned(n)
            if (n >= files.length) {
                clearInterval(tick)
                setTimeout(() => {
                    setResult(deriveExtraction(files))
                    setPhase('done')
                }, 500)
            }
        }, 420)
    }

    const reset = () => {
        setFiles([])
        setPhase('idle')
        setScanned(0)
        setResult(null)
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    const confChip = (c: 'high' | 'med') =>
        c === 'high'
            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={handleClose} className="relative z-50">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-start justify-center overflow-y-auto p-4 sm:p-10">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">STRATA AI</div>
                                        <Dialog.Title className="text-lg font-bold text-foreground">Import with AI</Dialog.Title>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    aria-label="Close"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                {phase !== 'done' && (
                                    <>
                                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                            Drop a broker email, an RFP, a floor plan, or site photos. Strata reads them and drafts an
                                            opportunity for you to review — no manual data entry.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => inputRef.current?.click()}
                                            onDragOver={e => {
                                                e.preventDefault()
                                                setOver(true)
                                            }}
                                            onDragLeave={() => setOver(false)}
                                            onDrop={e => {
                                                e.preventDefault()
                                                setOver(false)
                                                if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
                                            }}
                                            className={`w-full rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${over
                                                    ? 'border-violet-500 bg-violet-500/5'
                                                    : 'border-border hover:border-violet-500/50 hover:bg-violet-500/5'
                                                }`}
                                        >
                                            <input
                                                ref={inputRef}
                                                type="file"
                                                multiple
                                                className="hidden"
                                                accept=".eml,.msg,.pdf,.dwg,.dxf,image/*"
                                                onChange={e => {
                                                    if (e.target.files) addFiles(e.target.files)
                                                    e.target.value = ''
                                                }}
                                            />
                                            <div className="flex justify-center mb-3">
                                                <UploadCloud className="h-8 w-8 text-violet-500" strokeWidth={1.7} />
                                            </div>
                                            <div className="text-sm font-bold text-foreground">Drag files here, or click to browse</div>
                                            <div className="text-xs text-muted-foreground mt-1.5">
                                                Emails (.eml, .msg) · PDF · DWG / DXF · PNG, JPG, HEIC, TIFF
                                            </div>
                                        </button>

                                        {files.length > 0 && (
                                            <div className="flex flex-col gap-2 mt-4">
                                                {files.map((f, i) => {
                                                    const m = KIND_META[f.kind]
                                                    const Icon = m.Icon
                                                    const done = phase === 'scanning' && i < scanned
                                                    const active = phase === 'scanning' && i === scanned
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                                                        >
                                                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${m.bgClass} ${m.fgClass}`}>
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-semibold text-foreground truncate">{f.name}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {prettySize(f.size)} · {m.reads}
                                                                </div>
                                                            </div>
                                                            {phase === 'idle' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile(i)}
                                                                    aria-label={`Remove ${f.name}`}
                                                                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            {done && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                                                            {active && <Sparkles className="h-4 w-4 text-violet-600 animate-spin" />}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {phase === 'scanning' && (
                                            <div className="mt-4">
                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                                                        style={{ width: `${Math.round((scanned / files.length) * 100)}%` }}
                                                    />
                                                </div>
                                                <div className="text-xs font-semibold text-violet-700 dark:text-violet-400 mt-2 text-center">
                                                    Reading documents… {scanned} / {files.length}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {phase === 'done' && result && (
                                    <>
                                        <div className="flex items-center gap-2 mb-4">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            <span className="text-sm font-bold text-foreground">
                                                Draft ready from {files.length} document{files.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4">
                                            {result.rows.map((r, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-3 py-3 border-t border-violet-500/15 first:border-t-0"
                                                >
                                                    <div className="flex-shrink-0 w-[130px] text-xs font-semibold text-muted-foreground pt-0.5">
                                                        {r.label}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-semibold text-foreground">{r.value}</div>
                                                        {r.source && (
                                                            <span className="inline-flex items-center gap-1 mt-1 rounded-md bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-700 dark:text-violet-400">
                                                                <Paperclip className="h-2.5 w-2.5" /> {r.source}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`flex-shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${confChip(r.conf)}`}>
                                                        {r.conf === 'high' ? 'High' : 'Review'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                            Strata drafts the record — you stay in control. The next screen opens the opportunity pre-filled so
                                            you can confirm or adjust anything before saving.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-6 py-3">
                                {phase === 'done' ? (
                                    <button
                                        type="button"
                                        onClick={reset}
                                        className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                                    >
                                        Start over
                                    </button>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        {files.length} file{files.length === 1 ? '' : 's'} added
                                    </span>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                                    >
                                        Cancel
                                    </button>
                                    {phase === 'idle' && (
                                        <button
                                            type="button"
                                            onClick={analyze}
                                            disabled={!files.length}
                                            className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition-all ${files.length ? 'hover:brightness-110' : 'opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            <Sparkles className="h-4 w-4" /> Analyze {files.length || ''} file{files.length === 1 ? '' : 's'}
                                        </button>
                                    )}
                                    {phase === 'scanning' && (
                                        <button
                                            type="button"
                                            disabled
                                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white opacity-70"
                                        >
                                            <Sparkles className="h-4 w-4 animate-spin" /> Reading…
                                        </button>
                                    )}
                                    {phase === 'done' && result && (
                                        <button
                                            type="button"
                                            onClick={() => onCreate(result.prefill)}
                                            className="rounded-lg bg-foreground px-3.5 py-2 text-xs font-bold text-background transition-colors hover:bg-foreground/90"
                                        >
                                            Create draft opportunity
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}
