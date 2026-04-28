/**
 * COMPONENT: EmailInboxDropZone
 * PURPOSE: Apr 23 stakeholder ask (Matt, "highly desired but not no-go"):
 *          "we need a way to show … me opening up like an email inbox …
 *          and physically dropping something in here to trigger the flow".
 *
 *          Matt originally requested it for Budget Builder, but Budget is
 *          out of the Thursday demo (Carlos). We surface the same
 *          interaction in Accounting · Morning Queue: drag a vendor
 *          invoice (or click "Simulate a new email") → Strata picks it up,
 *          extracts fields, and the new invoice card appears in the
 *          Pending column of the kanban.
 *
 *          HTML5 native drag-drop, no react-dnd. Falls back to the
 *          "Simulate" button when the user has no file at hand (which is
 *          the demo case 95% of the time).
 *
 * USED BY: AccountingMorningQueue (Flow 1 · Scene 1)
 *
 * PROPS:
 *   - onIngest: (filename: string) => void   called once the simulated
 *                                            processing completes
 *
 * DS TOKENS: bg-card · border-dashed · ai accents during dragover ·
 *            success accents on processed
 */

import { useState, useRef } from 'react'
import { Mail, Inbox, Upload, Sparkles, CheckCircle2, Loader2, Paperclip, FileText } from 'lucide-react'

interface EmailInboxDropZoneProps {
    onIngest: (filename: string) => void
}

type Stage = 'idle' | 'dragover' | 'processing' | 'done'

const SIMULATED_FILENAMES = [
    'AceContract_INV_4421.pdf',
    'NorthFurnishings_INV_882.pdf',
    'WrgAcoustics_INV_1209.pdf',
    'StructureLLC_INV_5510.pdf',
]

const PROCESSING_STEPS = [
    'Receiving file from inbox',
    'Document AI extracting fields',
    'Matching to open POs in CORE',
    'Routing to the queue',
]

export default function EmailInboxDropZone({ onIngest }: EmailInboxDropZoneProps) {
    const [stage, setStage] = useState<Stage>('idle')
    const [activeFilename, setActiveFilename] = useState<string | null>(null)
    const [processStepIdx, setProcessStepIdx] = useState(0)
    const dragCounter = useRef(0)

    const runProcessing = (filename: string) => {
        setActiveFilename(filename)
        setStage('processing')
        setProcessStepIdx(0)

        let i = 0
        const tick = () => {
            i++
            setProcessStepIdx(i)
            if (i < PROCESSING_STEPS.length) {
                setTimeout(tick, 700)
            } else {
                setStage('done')
                onIngest(filename)
                // Reset after a beat so users can try again
                setTimeout(() => {
                    setStage('idle')
                    setActiveFilename(null)
                    setProcessStepIdx(0)
                }, 2400)
            }
        }
        setTimeout(tick, 500)
    }

    const handleSimulate = () => {
        const pick = SIMULATED_FILENAMES[Math.floor(Math.random() * SIMULATED_FILENAMES.length)]
        runProcessing(pick)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        dragCounter.current = 0
        if (stage === 'processing') return
        const file = e.dataTransfer.files?.[0]
        if (file) {
            runProcessing(file.name)
        } else {
            // Plain text drag (no file), still trigger simulate so the demo doesn't dead-end
            handleSimulate()
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (stage !== 'processing') setStage('dragover')
    }
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        dragCounter.current += 1
        if (stage !== 'processing') setStage('dragover')
    }
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        dragCounter.current -= 1
        if (dragCounter.current <= 0 && stage === 'dragover') {
            setStage('idle')
        }
    }

    const isProcessing = stage === 'processing'
    const isDone = stage === 'done'
    const isHover = stage === 'dragover'

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Inbox header */}
            <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center gap-2">
                <Inbox className="h-4 w-4 text-foreground" />
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground">Vendor inbox · ap@mbi.example</div>
                    <div className="text-[10px] text-muted-foreground">Strata watches this inbox · bills land in the queue automatically</div>
                </div>
                <span className="text-[10px] text-muted-foreground">3 unread · 12 today</span>
            </div>

            {/* Faux inbox items */}
            <div className="px-4 py-2 border-b border-border space-y-1.5 bg-background/40 dark:bg-zinc-900/40">
                <FauxEmailRow vendor="Allsteel · billing@allsteel.example" subject="Bill INV-0482 · PO-2026-0047" attached time="6:14 AM" muted />
                <FauxEmailRow vendor="Allsteel · ap@mercyhealth.example" subject="Rebate + bill INV-0486" attached time="8:00 AM" muted />
                <FauxEmailRow vendor="HON · billing@hon.example" subject="Bill INV-0493 · service line" attached time="9:55 AM" muted />
            </div>

            {/* Dropzone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                className={`
                    m-3 rounded-xl border-2 border-dashed p-4 transition-all
                    ${isHover ? 'border-ai bg-ai/10' : ''}
                    ${isProcessing ? 'border-ai/60 bg-ai/5' : ''}
                    ${isDone ? 'border-success/60 bg-success/5' : ''}
                    ${stage === 'idle' ? 'border-border bg-background/30 dark:bg-zinc-900/30' : ''}
                `}
            >
                {stage === 'idle' && (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-ai/10 text-ai flex items-center justify-center shrink-0">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-foreground">Drop a vendor bill here</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                PDF, image, .eml — Strata processes it like any other inbound email. No file at hand? Simulate one →
                            </div>
                        </div>
                        <button
                            onClick={handleSimulate}
                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-900 bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Simulate a new email
                        </button>
                    </div>
                )}

                {isHover && (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-ai/20 text-ai flex items-center justify-center shrink-0">
                            <Upload className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-ai">Drop to ingest</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                Strata will extract fields and route it to the queue.
                            </div>
                        </div>
                    </div>
                )}

                {isProcessing && activeFilename && (
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-ai/20 text-ai flex items-center justify-center shrink-0">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-mono text-foreground truncate">{activeFilename}</span>
                            </div>
                            <div className="text-[11px] text-ai font-bold mt-1">{PROCESSING_STEPS[Math.min(processStepIdx, PROCESSING_STEPS.length - 1)]}…</div>
                            <div className="mt-2 h-1 bg-background dark:bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-ai transition-all duration-500"
                                    style={{ width: `${((processStepIdx + 1) / PROCESSING_STEPS.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isDone && activeFilename && (
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-success">Ingested · added to Pending</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                <span className="font-mono">{activeFilename}</span> · scroll to the queue below to see it appear.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function FauxEmailRow({ vendor, subject, attached, time, muted }: { vendor: string; subject: string; attached?: boolean; time: string; muted?: boolean }) {
    return (
        <div className={`flex items-center gap-3 px-2 py-1.5 rounded ${muted ? 'opacity-60' : ''}`}>
            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-foreground truncate">{vendor}</div>
                <div className="text-[10px] text-muted-foreground truncate">{subject}</div>
            </div>
            {attached && <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" aria-label="has attachment" />}
            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{time}</span>
        </div>
    )
}
