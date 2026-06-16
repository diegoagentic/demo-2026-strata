import { Fragment, useMemo, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, FolderTree, Sparkles, Check, AlertTriangle, ChevronRight, FileText, ArrowRight, ExternalLink, Copy } from 'lucide-react'
import {
    FAIRPORT_VENDOR_JOBS,
    COMMON_ASSETS,
    ASSET_TYPE_META,
    SHAREPOINT_FOLDER_URL,
    type AssetEntry,
} from './shared/assetSeedingData'

interface Props {
    isOpen: boolean
    onClose: () => void
    /** Step that opened the modal · controls which stage shows first */
    initialStage?: Stage
    onPublished?: () => void
}

type Stage = 'discover' | 'filter' | 'review' | 'publish'

/**
 * Asset consolidation modal — adapts the AckReconciliationModal multi-step pattern.
 *
 * Stages renamed for CLC context:
 *   discover → which IQ jobs share the customer tag?
 *   filter   → keep the 5 in-project, exclude the 2 unrelated, with rationale
 *   review   → preview the 15 assets (8 shop drawings · 5 ACKs · 1 site plan · 1 runbook)
 *   publish  → SharePoint URL pinned + installer notification draft
 */
export default function CLCAssetConsolidationModal({ isOpen, onClose, initialStage = 'discover', onPublished }: Props) {
    const [stage, setStage] = useState<Stage>(initialStage)
    const [previewAsset, setPreviewAsset] = useState<AssetEntry | null>(null)

    const includedJobs = useMemo(() => FAIRPORT_VENDOR_JOBS.filter(j => j.included), [])
    const excludedJobs = useMemo(() => FAIRPORT_VENDOR_JOBS.filter(j => !j.included), [])
    const includedAssets = useMemo(() => {
        const fromVendors = includedJobs.flatMap(j => j.assets)
        return [...fromVendors, ...COMMON_ASSETS]
    }, [includedJobs])

    const assetCounts = useMemo(() => {
        const counts: Record<AssetEntry['type'], number> = {
            'shop-drawing': 0, 'ack': 0, 'site-plan': 0, 'runbook': 0,
        }
        for (const a of includedAssets) counts[a.type]++
        return counts
    }, [includedAssets])

    const totalSizeKb = includedAssets.reduce((s, a) => s + a.sizeKb, 0)

    const goNext = () => {
        if (stage === 'discover') setStage('filter')
        else if (stage === 'filter') setStage('review')
        else if (stage === 'review') setStage('publish')
    }
    const goPrev = () => {
        if (stage === 'publish') setStage('review')
        else if (stage === 'review') setStage('filter')
        else if (stage === 'filter') setStage('discover')
    }

    const handlePublish = () => {
        window.dispatchEvent(new CustomEvent('clc:sharepoint-folder-created', { detail: { url: SHAREPOINT_FOLDER_URL } }))
        onPublished?.()
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[200]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" />
                </TransitionChild>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <DialogPanel className="w-[95vw] max-w-[1200px] h-[88vh] max-h-[860px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="p-5 border-b border-border">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <FolderTree className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <h2 className="text-base font-bold text-foreground">Consolidate install assets</h2>
                                            <p className="text-[11px] text-muted-foreground">Fairport Public Library · scheduled Jun 2 · 5 IQ jobs to bundle</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} aria-label="Close" className="p-1.5 -m-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                {/* Stage stepper */}
                                <StageStepper current={stage} onJump={setStage} />
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto">
                                {stage === 'discover' && <DiscoverStage includedCount={includedJobs.length} excludedCount={excludedJobs.length} />}
                                {stage === 'filter' && <FilterStage included={includedJobs} excluded={excludedJobs} />}
                                {stage === 'review' && (
                                    <ReviewStage
                                        assets={includedAssets}
                                        counts={assetCounts}
                                        totalSizeKb={totalSizeKb}
                                        onPreview={setPreviewAsset}
                                    />
                                )}
                                {stage === 'publish' && <PublishStage assetCount={includedAssets.length} totalSizeKb={totalSizeKb} />}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-border p-4 bg-muted/20 flex items-center justify-between gap-3">
                                <div className="text-[11px] text-muted-foreground">
                                    Strata never auto-sends · operator confirms each send.
                                </div>
                                <div className="flex items-center gap-2">
                                    {stage !== 'discover' && (
                                        <button onClick={goPrev} className="px-3 py-2 text-xs font-semibold text-foreground border border-border rounded-lg hover:bg-muted transition-colors">
                                            Back
                                        </button>
                                    )}
                                    {stage !== 'publish' ? (
                                        <button onClick={goNext} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                            {stage === 'discover' ? 'Review the 5 in / 2 out' : stage === 'filter' ? 'Preview assets' : 'Continue to publish'}
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <button onClick={handlePublish} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                            <Check className="h-4 w-4" />
                                            Publish folder
                                        </button>
                                    )}
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>

            {/* Asset preview (reuses the floating PDF-style preview pattern · inline iframe substitute) */}
            <Transition show={previewAsset !== null} as={Fragment}>
                <Dialog onClose={() => setPreviewAsset(null)} className="relative z-[220]">
                    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" />
                    <div className="fixed inset-0 flex items-center justify-center p-3">
                        <DialogPanel className="w-[95vw] h-[90vh] max-w-[1200px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="font-mono text-sm font-semibold text-foreground truncate">{previewAsset?.name}</span>
                                    {previewAsset && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${ASSET_TYPE_META[previewAsset.type].colorClass}`}>
                                            {ASSET_TYPE_META[previewAsset.type].label}
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => setPreviewAsset(null)} aria-label="Close preview" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 bg-muted/40 flex items-center justify-center text-muted-foreground">
                                <div className="text-center max-w-sm p-8">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-foreground mb-1">{previewAsset?.name}</p>
                                    <p className="text-xs">PDF preview (mock) · in production this renders the actual document inline.</p>
                                    {previewAsset?.aiFlagged && (
                                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-3 text-left">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Sparkles className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-200" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Strata AI flag</span>
                                            </div>
                                            <p className="text-xs text-foreground">{previewAsset.flagReason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            </Transition>
        </Transition>
    )
}

// ─── Stage stepper ──────────────────────────────────────────────────────────

function StageStepper({ current, onJump }: { current: Stage; onJump: (s: Stage) => void }) {
    const stages: { id: Stage; label: string }[] = [
        { id: 'discover', label: 'Discover' },
        { id: 'filter',   label: 'Filter'   },
        { id: 'review',   label: 'Review'   },
        { id: 'publish',  label: 'Publish'  },
    ]
    const currentIdx = stages.findIndex(s => s.id === current)
    return (
        <div className="flex items-center gap-2">
            {stages.map((s, i) => {
                const isPast = i < currentIdx
                const isActive = i === currentIdx
                return (
                    <Fragment key={s.id}>
                        <button
                            onClick={() => onJump(s.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                                isActive ? 'bg-primary text-primary-foreground' :
                                isPast   ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200 hover:bg-green-200' :
                                           'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            <span className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-bold ${
                                isActive ? 'bg-primary-foreground text-primary' :
                                isPast   ? 'bg-green-700 text-white' :
                                           'bg-zinc-300 text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300'
                            }`}>
                                {isPast ? <Check className="h-2.5 w-2.5" /> : (i + 1)}
                            </span>
                            {s.label}
                        </button>
                        {i < stages.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Fragment>
                )
            })}
        </div>
    )
}

// ─── Discover stage ─────────────────────────────────────────────────────────

function DiscoverStage({ includedCount, excludedCount }: { includedCount: number; excludedCount: number }) {
    return (
        <div className="p-6 max-w-3xl mx-auto space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Strata AI · Discovery</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">
                    Fairport Public Library hit <strong>Scheduled</strong> in IQ at 2:14 PM. Strata searched IQ for jobs tagged <span className="font-mono text-foreground bg-muted px-1 rounded">Fairport Library Phase 1</span> and found <strong>{includedCount + excludedCount}</strong> candidates · <strong>{includedCount} in-project</strong> · <strong>{excludedCount} unrelated</strong>.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-green-200 bg-green-50/60 dark:border-green-500/30 dark:bg-green-500/10 p-3">
                        <div className="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase tracking-wider mb-1">In-project · seed</div>
                        <div className="text-2xl font-bold text-foreground">{includedCount}</div>
                        <div className="text-xs text-muted-foreground">IQ jobs · matching customer tag</div>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40 p-3">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Excluded · won't seed</div>
                        <div className="text-2xl font-bold text-foreground">{excludedCount}</div>
                        <div className="text-xs text-muted-foreground">IQ jobs · tag mismatch</div>
                    </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                    State-contract structure means one customer project spans multiple IQ jobs (one per vendor). The customer tag is the consolidation key · the customer already maintains it.
                </p>
            </div>
        </div>
    )
}

// ─── Filter stage ───────────────────────────────────────────────────────────

function FilterStage({ included, excluded }: { included: typeof FAIRPORT_VENDOR_JOBS; excluded: typeof FAIRPORT_VENDOR_JOBS }) {
    return (
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Included */}
            <div className="rounded-2xl border border-green-200 bg-green-50/40 dark:border-green-500/30 dark:bg-green-500/10 overflow-hidden">
                <div className="p-3 border-b border-green-200 dark:border-green-500/30 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-700 dark:text-green-300" />
                    <h3 className="text-sm font-bold text-foreground">{included.length} IQ jobs · seed into folder</h3>
                </div>
                <div className="divide-y divide-green-200/60 dark:divide-green-500/20">
                    {included.map(j => (
                        <div key={j.iqJobId} className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold text-foreground">{j.iqJobId}</span>
                                <span className="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">{j.vendor}</span>
                            </div>
                            <div className="text-sm text-foreground mb-0.5">{j.description}</div>
                            <div className="text-[11px] text-muted-foreground">{j.rationale}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Excluded */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-700 dark:bg-zinc-800/40 overflow-hidden">
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold text-foreground">{excluded.length} IQ jobs · excluded (tag mismatch)</h3>
                </div>
                <div className="divide-y divide-zinc-200/60 dark:divide-zinc-700/60">
                    {excluded.map(j => (
                        <div key={j.iqJobId} className="p-3 opacity-80">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold text-muted-foreground line-through">{j.iqJobId}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{j.vendor}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mb-0.5">{j.description}</div>
                            <div className="text-[11px] text-muted-foreground">
                                <span className="font-mono">{j.customerTag}</span> · {j.rationale}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── Review stage ───────────────────────────────────────────────────────────

function ReviewStage({ assets, counts, totalSizeKb, onPreview }: { assets: AssetEntry[]; counts: Record<AssetEntry['type'], number>; totalSizeKb: number; onPreview: (a: AssetEntry) => void }) {
    return (
        <div className="p-5">
            {/* Asset type summary */}
            <div className="grid grid-cols-4 gap-3 mb-4">
                {(Object.keys(ASSET_TYPE_META) as AssetEntry['type'][]).map(type => (
                    <div key={type} className="rounded-lg border border-border bg-card p-3 text-center">
                        <div className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${ASSET_TYPE_META[type].colorClass}`}>
                            {ASSET_TYPE_META[type].label}
                        </div>
                        <div className="text-2xl font-bold text-foreground mt-1.5">{counts[type]}</div>
                    </div>
                ))}
            </div>

            <div className="mb-3 text-xs text-muted-foreground">
                <strong className="text-foreground">{assets.length} assets</strong> · {(totalSizeKb / 1024).toFixed(1)} MB · click any row to preview
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="grid grid-cols-[1fr_120px_80px_40px] gap-2 px-4 py-2 bg-muted/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span>File</span>
                    <span>Type</span>
                    <span className="text-right">Size</span>
                    <span></span>
                </div>
                <div className="divide-y divide-border">
                    {assets.map(a => (
                        <button
                            key={a.id}
                            onClick={() => onPreview(a)}
                            className="w-full grid grid-cols-[1fr_120px_80px_40px] gap-2 px-4 py-2.5 items-center hover:bg-muted/30 transition-colors text-left"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm text-foreground font-mono truncate">{a.name}</span>
                                {a.aiFlagged && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                        <Sparkles className="h-3 w-3" />
                                        Flagged
                                    </span>
                                )}
                            </div>
                            <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider w-fit ${ASSET_TYPE_META[a.type].colorClass}`}>
                                {ASSET_TYPE_META[a.type].label}
                            </span>
                            <span className="text-xs text-muted-foreground text-right tabular-nums">{(a.sizeKb).toLocaleString()} KB</span>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── Publish stage ──────────────────────────────────────────────────────────

function PublishStage({ assetCount, totalSizeKb }: { assetCount: number; totalSizeKb: number }) {
    const copyUrl = () => {
        navigator.clipboard?.writeText(SHAREPOINT_FOLDER_URL).catch(() => {})
    }
    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <div className="rounded-2xl border border-green-200 bg-green-50/40 dark:border-green-500/30 dark:bg-green-500/10 p-5">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ready to publish</span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">Fairport Library Phase 1</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {assetCount} assets · {(totalSizeKb / 1024).toFixed(1)} MB · will be staged to a single SharePoint folder accessible from the installer iPad.
                </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">SharePoint URL</div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                    <code className="text-xs text-foreground flex-1 truncate font-mono">{SHAREPOINT_FOLDER_URL}</code>
                    <button onClick={copyUrl} className="p-1 rounded hover:bg-muted transition-colors" title="Copy URL">
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Installer notification · draft</div>
                <div className="text-sm text-foreground leading-relaxed bg-muted/20 rounded-lg p-3 border border-border">
                    <div className="mb-2"><strong className="text-foreground">Subject:</strong> Fairport Public Library install · Jun 2 · folder ready</div>
                    <p className="text-xs leading-relaxed">
                        Hi — your install day folder for Fairport Public Library is live in SharePoint. You'll find 8 shop drawings, 5 vendor ACKs, the site plan and your runbook. One ACK has a Strata flag for short-shipped lounge chairs — please verify on receipt. Tap the link from your iPad to open.
                    </p>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                    Strata never auto-sends · operator reviews and confirms.
                </p>
            </div>
        </div>
    )
}
