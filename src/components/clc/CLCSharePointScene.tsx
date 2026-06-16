import { useState, useEffect } from 'react'
import { useDemo } from '../../context/DemoContext'
import { FolderTree, Folder, FolderOpen, Sparkles, AlertCircle, CheckCircle2, ExternalLink, FileText } from 'lucide-react'
import CLCAssetConsolidationModal from './CLCAssetConsolidationModal'
import { SHAREPOINT_FOLDER_URL, SCHEDULED_INSTALL_DATE, FAIRPORT_VENDOR_JOBS } from './shared/assetSeedingData'

/**
 * Flow 2 — SharePoint Asset Seeding scene.
 *
 * Behavior per step:
 *   clc2.0 → Fairport row appears with "Ready to seed" badge
 *   clc2.1 → consolidation modal auto-opens at the Filter stage
 *   clc2.2 → consolidation modal opens at the Review stage
 *   clc2.3 → consolidation modal opens at the Publish stage
 */
export default function CLCSharePointScene() {
    const { currentStep } = useDemo()
    const stepId = currentStep?.id
    const [modalOpen, setModalOpen] = useState(false)
    const [initialStage, setInitialStage] = useState<'discover' | 'filter' | 'review' | 'publish'>('discover')
    const [published, setPublished] = useState(false)

    // Open the modal automatically on the matching step
    useEffect(() => {
        if (stepId === 'clc2.1') {
            setInitialStage('filter')
            setModalOpen(true)
        } else if (stepId === 'clc2.2') {
            setInitialStage('review')
            setModalOpen(true)
        } else if (stepId === 'clc2.3') {
            setInitialStage('publish')
            setModalOpen(true)
        } else {
            setModalOpen(false)
        }
    }, [stepId])

    const includedVendors = FAIRPORT_VENDOR_JOBS.filter(j => j.included)
    const totalAssetCount = includedVendors.reduce((s, v) => s + v.assets.length, 0) + 2 // + site plan + runbook
    const flaggedCount = includedVendors.reduce((s, v) => s + v.assets.filter(a => a.aiFlagged).length, 0)

    const openModal = (stage: typeof initialStage) => {
        setInitialStage(stage)
        setModalOpen(true)
    }

    return (
        <div className="p-5 max-w-6xl mx-auto">
            {/* SharePoint chrome header */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden mb-4">
                <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">SharePoint · Installs</span>
                    <span className="text-xs text-muted-foreground ml-auto font-mono">creativelibraryconcepts.sharepoint.com / sites / Installs</span>
                </div>
                <div className="p-3 grid grid-cols-[28px_1fr_180px_120px_120px] gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/20">
                    <span></span>
                    <span>Folder</span>
                    <span>Install date</span>
                    <span>Status</span>
                    <span className="text-right">Action</span>
                </div>
                <div className="divide-y divide-border">
                    {/* Fairport — only appears when step ≥ clc2.0 */}
                    {(stepId === 'clc2.0' || stepId?.startsWith('clc2.')) && (
                        <SharePointRow
                            name="Fairport-Library-Phase1"
                            installDate={SCHEDULED_INSTALL_DATE}
                            status={
                                published ? 'live' :
                                stepId === 'clc2.3' ? 'publishing' :
                                stepId === 'clc2.2' ? 'reviewing' :
                                stepId === 'clc2.1' ? 'filtering' :
                                'ready'
                            }
                            assetCount={totalAssetCount}
                            flaggedCount={flaggedCount}
                            url={published ? SHAREPOINT_FOLDER_URL : undefined}
                            onOpen={() => openModal(stepId === 'clc2.3' ? 'publish' : stepId === 'clc2.2' ? 'review' : stepId === 'clc2.1' ? 'filter' : 'discover')}
                        />
                    )}
                    {!stepId?.startsWith('clc2.') && (
                        <EmptyRow />
                    )}
                    {/* Static prior projects for context */}
                    <PriorProjectRow name="Brockport-Library-Q1" date="Mar 4, 2026" />
                    <PriorProjectRow name="Princeton-TechBar-Q1" date="Feb 12, 2026" />
                </div>
            </div>

            {/* Step hint */}
            {stepId === 'clc2.0' && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Strata detected the IQ status change · Fairport row is ready to seed. Click <strong>Open</strong> to consolidate the 5 IQ jobs.
                </p>
            )}

            <CLCAssetConsolidationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                initialStage={initialStage}
                onPublished={() => {
                    setPublished(true)
                    setModalOpen(false)
                }}
            />
        </div>
    )
}

// ─── Rows ────────────────────────────────────────────────────────────────────

interface SharePointRowProps {
    name: string
    installDate: string
    status: 'ready' | 'filtering' | 'reviewing' | 'publishing' | 'live'
    assetCount: number
    flaggedCount: number
    url?: string
    onOpen: () => void
}

function SharePointRow({ name, installDate, status, assetCount, flaggedCount, url, onOpen }: SharePointRowProps) {
    const statusMeta = {
        ready:      { label: 'Ready to seed',  badge: 'bg-brand-300/30 text-foreground dark:bg-brand-500/20 dark:text-zinc-200', icon: <Sparkles className="h-3 w-3" /> },
        filtering:  { label: 'Filtering',      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',        icon: <FolderOpen className="h-3 w-3" /> },
        reviewing:  { label: 'Reviewing',      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',        icon: <FileText className="h-3 w-3" /> },
        publishing: { label: 'Publishing',     badge: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300', icon: <Sparkles className="h-3 w-3" /> },
        live:       { label: 'Live',           badge: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',     icon: <CheckCircle2 className="h-3 w-3" /> },
    }[status]
    return (
        <div className="grid grid-cols-[28px_1fr_180px_120px_120px] gap-2 px-3 py-3 items-center hover:bg-muted/30 transition-colors">
            <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{name}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    {assetCount} files
                    {flaggedCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-300">
                            <AlertCircle className="h-3 w-3" />
                            {flaggedCount} flagged
                        </span>
                    )}
                </div>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{installDate}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider w-fit ${statusMeta.badge}`}>
                {statusMeta.icon}
                {statusMeta.label}
            </span>
            <div className="text-right">
                {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline">
                        Open <ExternalLink className="h-3 w-3" />
                    </a>
                ) : (
                    <button onClick={onOpen} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        Open
                    </button>
                )}
            </div>
        </div>
    )
}

function EmptyRow() {
    return (
        <div className="px-4 py-10 text-center text-xs text-muted-foreground">
            No projects scheduled this week. The next install workflow will trigger when an IQ job moves to <em>Scheduled</em>.
        </div>
    )
}

function PriorProjectRow({ name, date }: { name: string; date: string }) {
    return (
        <div className="grid grid-cols-[28px_1fr_180px_120px_120px] gap-2 px-3 py-2.5 items-center text-xs opacity-70">
            <Folder className="h-4 w-4 text-muted-foreground" />
            <div className="text-foreground font-semibold truncate">{name}</div>
            <span className="text-muted-foreground font-mono">{date}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider w-fit bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <CheckCircle2 className="h-3 w-3" />
                Complete
            </span>
            <span className="text-right text-[11px] text-muted-foreground">archived</span>
        </div>
    )
}
