import { useState, useEffect, useMemo } from 'react'
import { useDemo } from '../../context/DemoContext'
import { FolderTree, Folder, FolderOpen, Sparkles, AlertCircle, CheckCircle2, ExternalLink, FileText, Database } from 'lucide-react'
import CLCAssetConsolidationModal from './CLCAssetConsolidationModal'
import CLCViewToggle, { type ViewMode } from './shared/CLCViewToggle'
import CLCFilterBar, { type StatusOption } from './shared/CLCFilterBar'
import CLCSummaryChipsBar, { type SummaryChip } from './shared/CLCSummaryChipsBar'
import { SHAREPOINT_FOLDER_URL, SCHEDULED_INSTALL_DATE, FAIRPORT_VENDOR_JOBS } from './shared/assetSeedingData'

type SeedingStatus = 'ready' | 'filtering' | 'reviewing' | 'publishing' | 'live' | 'archived'

interface SeedingProject {
    id: string
    name: string
    installDate: string
    status: SeedingStatus
    assetCount: number
    flaggedCount: number
    url?: string
}

const STATUS_LABEL: Record<SeedingStatus, string> = {
    ready:      'Triggered',
    filtering:  'Consolidating',
    reviewing:  'Reviewing',
    publishing: 'Publishing',
    live:       'Live',
    archived:   'Complete',
}

const STATUS_TONE: Record<SeedingStatus, string> = {
    ready:      'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    filtering:  'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    reviewing:  'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    publishing: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300',
    live:       'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    archived:   'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
}

const FUNNEL_STATUSES: SeedingStatus[] = ['ready', 'filtering', 'reviewing', 'publishing', 'live']
const FUNNEL_COLORS: Record<SeedingStatus, string> = {
    ready:      'text-blue-700 dark:text-blue-300',
    filtering:  'text-blue-700 dark:text-blue-300',
    reviewing:  'text-purple-700 dark:text-purple-300',
    publishing: 'text-yellow-700 dark:text-yellow-300',
    live:       'text-green-700 dark:text-green-300',
    archived:   'text-zinc-600 dark:text-zinc-400',
}

/**
 * Flow 2 · SharePoint Asset Seeding (refactored to scene shell pattern).
 *
 * View modes: Funnel · List (no Calendar — installs don't fit a calendar grid).
 * Per-step:
 *   clc2.0 → list view · Fairport row appears with "Triggered" status
 *   clc2.1 → list view + modal at Filter stage
 *   clc2.2 → list view + modal at Review stage
 *   clc2.3 → list view + modal at Publish stage · autoswap to Funnel after publish
 */
export default function CLCSharePointScene() {
    const { currentStep } = useDemo()
    const stepId = currentStep?.id

    const [modalOpen, setModalOpen] = useState(false)
    const [initialStage, setInitialStage] = useState<'discover' | 'filter' | 'review' | 'publish'>('discover')
    const [published, setPublished] = useState(false)

    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [hasUserToggled, setHasUserToggled] = useState(false)
    const [statuses, setStatuses] = useState<string[]>([])
    const [customerQuery, setCustomerQuery] = useState('')

    // Auto-open modal at the right stage
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

    // Reset user-toggled flag when step changes
    useEffect(() => {
        setHasUserToggled(false)
    }, [stepId])

    // Autoswap to funnel after publish (clc2.3 outcome)
    useEffect(() => {
        if (!published || hasUserToggled) return
        const t = setTimeout(() => setViewMode('funnel'), 1500)
        return () => clearTimeout(t)
    }, [published, hasUserToggled])

    const includedVendors = FAIRPORT_VENDOR_JOBS.filter(j => j.included)
    const totalAssetCount = includedVendors.reduce((s, v) => s + v.assets.length, 0) + 2
    const flaggedCount = includedVendors.reduce((s, v) => s + v.assets.filter(a => a.aiFlagged).length, 0)

    // Build the project list — Fairport appears once we're in Flow 2
    const projects: SeedingProject[] = useMemo(() => {
        const arr: SeedingProject[] = []
        if (stepId?.startsWith('clc2.')) {
            const fairportStatus: SeedingStatus =
                published ? 'live' :
                stepId === 'clc2.3' ? 'publishing' :
                stepId === 'clc2.2' ? 'reviewing' :
                stepId === 'clc2.1' ? 'filtering' :
                'ready'
            arr.push({
                id: 'fairport',
                name: 'Fairport-Library-Phase1',
                installDate: SCHEDULED_INSTALL_DATE,
                status: fairportStatus,
                assetCount: totalAssetCount,
                flaggedCount,
                url: published ? SHAREPOINT_FOLDER_URL : undefined,
            })
        }
        // Always-present prior projects (archived context)
        arr.push({ id: 'brockport', name: 'Brockport-Library-Q1',  installDate: 'Mar 4, 2026',  status: 'archived', assetCount: 12, flaggedCount: 0 })
        arr.push({ id: 'princeton', name: 'Princeton-TechBar-Q1',  installDate: 'Feb 12, 2026', status: 'archived', assetCount: 8,  flaggedCount: 0 })
        return arr
    }, [stepId, published, totalAssetCount, flaggedCount])

    // Filter
    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            if (statuses.length > 0 && !statuses.includes(p.status)) return false
            if (customerQuery && !p.name.toLowerCase().includes(customerQuery.toLowerCase())) return false
            return true
        })
    }, [projects, statuses, customerQuery])

    // Summary chips
    const activeCount = projects.filter(p => p.status !== 'archived' && p.status !== 'live').length
    const publishedCount = projects.filter(p => p.status === 'live').length
    const chips: SummaryChip[] = [
        {
            id: 'projects',
            label: `${filteredProjects.length} project${filteredProjects.length === 1 ? '' : 's'}`,
            count: filteredProjects.length,
            tone: 'neutral',
            panelTitle: 'Seeding queue',
            panel: <ProjectsSummaryPanel projects={filteredProjects} />,
        },
        {
            id: 'active',
            label: `${activeCount} active`,
            count: activeCount,
            tone: 'info',
            panelTitle: 'Active seeding workflows',
            panel: <SimpleList items={filteredProjects.filter(p => p.status !== 'archived' && p.status !== 'live').map(p => `${p.name} · ${STATUS_LABEL[p.status]}`)} emptyMessage="No active seeds." />,
        },
        {
            id: 'flagged',
            label: `${flaggedCount} flagged`,
            count: flaggedCount,
            tone: 'warning',
            pulse: flaggedCount > 0 && (stepId === 'clc2.2'),
            panelTitle: 'Assets flagged by Strata',
            panel: <FlaggedAssetsPanel />,
        },
        {
            id: 'published',
            label: `${publishedCount} published`,
            count: publishedCount,
            tone: 'success',
            pulse: published && stepId === 'clc2.3',
            panelTitle: 'Published folders',
            panel: <SimpleList items={projects.filter(p => p.status === 'live').map(p => `${p.name} · ${p.url ?? ''}`)} emptyMessage="No folders published yet." />,
        },
    ]

    const statusOptions: StatusOption[] = FUNNEL_STATUSES.map(s => ({ key: s, label: STATUS_LABEL[s] }))

    const openModal = (stage: typeof initialStage) => {
        setInitialStage(stage)
        setModalOpen(true)
    }

    const handleViewChange = (m: ViewMode) => {
        setViewMode(m)
        setHasUserToggled(true)
    }

    return (
        <div className="flex flex-col h-full bg-muted/5">
            {/* Header */}
            <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 flex-wrap">
                <div>
                    <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                        <h1 className="text-xl font-bold text-foreground">SharePoint · Installs</h1>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">creativelibraryconcepts.sharepoint.com / sites / Installs</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground px-2 py-1 rounded-md bg-muted">
                        <Database className="h-3 w-3" />
                        Backed by IQ · QuickBooks · M365
                    </span>
                </div>
            </header>

            {/* Summary chips */}
            <CLCSummaryChipsBar chips={chips} />

            {/* Filter bar — no date / no region for Flow 2 */}
            <CLCFilterBar
                statuses={statuses}
                onStatuses={setStatuses}
                statusOptions={statusOptions}
                customerQuery={customerQuery}
                onCustomerQuery={setCustomerQuery}
                customerPlaceholder="Search project…"
                showDateRange={false}
                showRegion={false}
            />

            {/* View toggle */}
            <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-2">
                <div className="text-[11px] text-muted-foreground">
                    {filteredProjects.length === projects.length ? `${projects.length} projects` : `${filteredProjects.length} of ${projects.length} projects`}
                </div>
                <CLCViewToggle value={viewMode} onChange={handleViewChange} available={['funnel', 'list']} />
            </div>

            {/* Body */}
            <section className="flex-1 overflow-y-auto px-5 pb-5">
                {viewMode === 'funnel'
                    ? <FunnelView projects={filteredProjects} onOpenProject={openModal} stepId={stepId} />
                    : <ListView projects={filteredProjects} onOpenProject={openModal} stepId={stepId} />
                }
            </section>

            {/* Per-step hint */}
            {stepId === 'clc2.0' && (
                <div className="px-5 py-2.5 border-t border-border bg-muted/20">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        Strata detected the IQ status change · Fairport row is ready to seed. Click <strong>Open</strong> to consolidate the 5 IQ jobs.
                    </p>
                </div>
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

// ─── Views ───────────────────────────────────────────────────────────────────

function ListView({ projects, onOpenProject, stepId }: { projects: SeedingProject[]; onOpenProject: (s: 'discover' | 'filter' | 'review' | 'publish') => void; stepId?: string }) {
    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-3 grid grid-cols-[28px_1fr_180px_120px_120px] gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/40">
                <span></span>
                <span>Folder</span>
                <span>Install date</span>
                <span>Status</span>
                <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-border">
                {projects.length === 0 ? (
                    <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                        No projects match the current filters. Adjust the filters above to widen the queue.
                    </div>
                ) : projects.map(p => (
                    <SharePointRow
                        key={p.id}
                        project={p}
                        onOpen={() => onOpenProject(
                            stepId === 'clc2.3' ? 'publish' :
                            stepId === 'clc2.2' ? 'review' :
                            stepId === 'clc2.1' ? 'filter' :
                            'discover'
                        )}
                    />
                ))}
            </div>
        </div>
    )
}

function FunnelView({ projects, onOpenProject, stepId }: { projects: SeedingProject[]; onOpenProject: (s: 'discover' | 'filter' | 'review' | 'publish') => void; stepId?: string }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {FUNNEL_STATUSES.map(status => {
                const col = projects.filter(p => p.status === status)
                return (
                    <div key={status} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
                        <div className="px-3 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${FUNNEL_COLORS[status]}`}>{STATUS_LABEL[status]}</span>
                            <span className="text-[11px] font-bold text-foreground tabular-nums px-1.5 py-0.5 rounded bg-muted">{col.length}</span>
                        </div>
                        <div className="p-2 space-y-1.5 min-h-[120px] flex-1">
                            {col.length === 0 ? (
                                <div className="h-full min-h-[100px] flex items-center justify-center rounded-md border-2 border-dashed border-border/60 text-[10px] text-muted-foreground">
                                    No folders
                                </div>
                            ) : col.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => p.url ? window.open(p.url, '_blank') : onOpenProject(
                                        stepId === 'clc2.3' ? 'publish' :
                                        stepId === 'clc2.2' ? 'review' :
                                        stepId === 'clc2.1' ? 'filter' :
                                        'discover'
                                    )}
                                    className="w-full text-left rounded-md border border-border bg-card p-2 hover:border-foreground/30 transition-colors"
                                >
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <FolderOpen className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />
                                        <div className="text-[11px] font-semibold text-foreground truncate">{p.name}</div>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-mono">
                                        {p.installDate} · {p.assetCount} files
                                    </div>
                                    {p.flaggedCount > 0 && (
                                        <div className="inline-flex items-center gap-0.5 mt-1 text-[10px] text-amber-700 dark:text-amber-300">
                                            <AlertCircle className="h-3 w-3" />
                                            {p.flaggedCount} flagged
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Row + panels ────────────────────────────────────────────────────────────

function SharePointRow({ project, onOpen }: { project: SeedingProject; onOpen: () => void }) {
    const tone = STATUS_TONE[project.status]
    const isPrior = project.status === 'archived'
    return (
        <div className={`grid grid-cols-[28px_1fr_180px_120px_120px] gap-2 px-3 py-3 items-center transition-colors ${isPrior ? 'opacity-75' : 'hover:bg-muted/30'}`}>
            {isPrior ? <Folder className="h-4 w-4 text-muted-foreground" /> : <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{project.name}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    {project.assetCount} files
                    {project.flaggedCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-300">
                            <AlertCircle className="h-3 w-3" />
                            {project.flaggedCount} flagged
                        </span>
                    )}
                </div>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{project.installDate}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider w-fit ${tone}`}>
                {project.status === 'live' ? <CheckCircle2 className="h-3 w-3" /> :
                 project.status === 'archived' ? <CheckCircle2 className="h-3 w-3" /> :
                 project.status === 'publishing' ? <Sparkles className="h-3 w-3" /> :
                 project.status === 'reviewing' ? <FileText className="h-3 w-3" /> :
                 <FolderOpen className="h-3 w-3" />}
                {STATUS_LABEL[project.status]}
            </span>
            <div className="text-right">
                {project.url ? (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline">
                        Open <ExternalLink className="h-3 w-3" />
                    </a>
                ) : isPrior ? (
                    <span className="text-[11px] text-muted-foreground">archived</span>
                ) : (
                    <button onClick={onOpen} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        Open
                    </button>
                )}
            </div>
        </div>
    )
}

function ProjectsSummaryPanel({ projects }: { projects: SeedingProject[] }) {
    return (
        <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">Seeding queue</h3>
            </div>
            <ul className="space-y-1.5">
                {projects.map(p => (
                    <li key={p.id} className="flex items-center gap-2 text-xs">
                        <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider w-fit ${STATUS_TONE[p.status]}`}>
                            {STATUS_LABEL[p.status]}
                        </span>
                        <span className="text-foreground truncate">{p.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function FlaggedAssetsPanel() {
    return (
        <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                <h3 className="text-sm font-bold text-foreground">Flagged assets</h3>
            </div>
            {FAIRPORT_VENDOR_JOBS.flatMap(v => v.assets.filter(a => a.aiFlagged).map(a => ({ vendor: v.vendor, asset: a }))).map(({ vendor, asset }) => (
                <div key={asset.id} className="rounded-md border border-amber-200 bg-amber-50/40 dark:border-amber-500/30 dark:bg-amber-500/10 p-2.5">
                    <div className="text-[11px] font-bold text-foreground">{asset.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Vendor · {vendor}</div>
                    <p className="text-[11px] text-foreground mt-1 leading-snug">{asset.flagReason}</p>
                </div>
            ))}
        </div>
    )
}

function SimpleList({ items, emptyMessage }: { items: string[]; emptyMessage: string }) {
    return (
        <div className="p-3">
            {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">{emptyMessage}</p>
            ) : (
                <ul className="space-y-1">
                    {items.map((s, i) => (
                        <li key={i} className="text-xs text-foreground truncate">· {s}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}
