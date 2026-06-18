import { Fragment, useMemo, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, FolderTree, Sparkles, Check, AlertTriangle, ChevronRight, FileText, ArrowRight, ExternalLink, Copy, Folder, Mail } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
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

type Stage = 'filter' | 'review' | 'publish'

/**
 * Asset consolidation modal · refactor to mimic the OfficeworksDocumentReviewModal
 * layout shell (header + stage stepper + AI banner + split-pane 3:2 + per-row
 * status badges + CTA in the right panel). Diego pasó screenshot del Officeworks
 * modal en spec check · esa es la referencia visual.
 *
 * 3 stages (Discover/clc2.1 + Filter/clc2.2 colapsadas en un solo Filter ·
 * Diego eliminó el beat puramente narrativo de Discover, el trigger context
 * vive en el AI banner del Filter ahora):
 *   filter   · Include/exclude lists (5 IN · 2 OUT) con rationale per row · Decision summary + CTA
 *   review   · Asset list con type tabs + per-row preview                  · Asset summary + flag detail + CTA
 *   publish  · Folder structure preview + lista final                      · SharePoint URL + email draft + CTA
 */

/** Contextual AI banner per stage · single line, sits under the header. */
const STAGE_AI_BANNER: Record<Stage, string> = {
    filter:   'Trigger detected · Fairport hit Scheduled at 2:14 PM. Strata searched IQ for the customer tag and found 7 candidates · 5 in-project (TMC · KI · Smith System · Media Tech · Aurora) · 2 tag mismatch (Tappé punch order + SWBR Q4) auto-excluded · operator can override.',
    review:   '15 assets staged from the 5 IQ jobs (8 shop drawings · 5 ACKs · 1 site plan · 1 runbook). 1 vendor short-ship flagged on J-44022 ACK · operator confirms before publish.',
    publish:  'Folder structure ready · permissions set for install crew + Director of Operations · installer notification drafted with iPad-friendly link · operator reviews and sends.',
}

const STAGE_TITLE: Record<Stage, string> = {
    filter:   'Filter',
    review:   'Review',
    publish:  'Publish',
}

export default function CLCAssetConsolidationModal({ isOpen, onClose, initialStage = 'filter', onPublished }: Props) {
    const [stage, setStage] = useState<Stage>(initialStage)
    const [previewAsset, setPreviewAsset] = useState<AssetEntry | null>(null)
    // Sidebar-aware offset · 320px sidebar + 64px gap = lg:pl-96 (384px).
    // Diego's "modal pegado al sidebar" needs visible breathing room, not flush.
    const { isDemoActive, isSidebarCollapsed } = useDemo()
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed
    const offsetClass = sidebarExpanded ? 'lg:pl-96' : ''

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
        if (stage === 'filter') setStage('review')
        else if (stage === 'review') setStage('publish')
    }
    const goPrev = () => {
        if (stage === 'publish') setStage('review')
        else if (stage === 'review') setStage('filter')
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
                <div className={`fixed inset-0 flex items-center justify-center p-4 ${offsetClass}`}>
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <DialogPanel className="w-full max-w-[1200px] h-[88vh] max-h-[860px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                            {/* ─── Header · title + stage stepper to the right + close ─── */}
                            <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="h-9 w-9 rounded-lg bg-ai/15 flex items-center justify-center shrink-0">
                                        <Sparkles className="h-4 w-4 text-ai" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base font-bold text-foreground truncate">Consolidate install assets — Fairport Library Phase 1</h2>
                                        <p className="text-[11px] text-muted-foreground truncate">Scheduled Jun 2 · 5 IQ jobs to bundle · 15 assets total</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <StageStepper current={stage} onJump={setStage} />
                                    <button onClick={onClose} aria-label="Close" className="p-1.5 -m-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* ─── AI banner · contextual per stage ─── */}
                            <div className="px-5 py-2.5 border-b border-border bg-ai/5 flex items-start gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                                <p className="text-xs text-foreground leading-snug">
                                    <strong className="text-foreground">Strata AI</strong> · {STAGE_AI_BANNER[stage]}
                                </p>
                            </div>

                            {/* ─── Body · split-pane 3:2 ─── */}
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 overflow-hidden">
                                {/* Left (3/5) · stage-aware content */}
                                <div className="lg:col-span-3 overflow-y-auto border-r border-border">
                                    {stage === 'filter'   && <FilterLeft included={includedJobs} excluded={excludedJobs} />}
                                    {stage === 'review'   && <ReviewLeft assets={includedAssets} counts={assetCounts} totalSizeKb={totalSizeKb} onPreview={setPreviewAsset} />}
                                    {stage === 'publish'  && <PublishLeft assets={includedAssets} />}
                                </div>
                                {/* Right (2/5) · action panel + primary CTA */}
                                <div className="lg:col-span-2 overflow-y-auto bg-muted/20">
                                    {stage === 'filter'   && <FilterRight includedCount={includedJobs.length} excludedCount={excludedJobs.length} assetCount={includedAssets.length} onContinue={goNext} />}
                                    {stage === 'review'   && <ReviewRight assetCount={includedAssets.length} totalSizeKb={totalSizeKb} onContinue={goNext} />}
                                    {stage === 'publish'  && <PublishRight assetCount={includedAssets.length} totalSizeKb={totalSizeKb} onPublish={handlePublish} />}
                                </div>
                            </div>

                            {/* ─── Footer · minimal · Back left, "operator confirms" right ─── */}
                            <div className="border-t border-border px-5 py-2.5 bg-muted/20 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    {stage !== 'filter' && (
                                        <button onClick={goPrev} className="px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border rounded-md hover:bg-muted transition-colors">
                                            ← Back to {STAGE_TITLE[prevStage(stage)]}
                                        </button>
                                    )}
                                </div>
                                <div className="text-[11px] text-muted-foreground italic">
                                    Strata never auto-sends · operator confirms each send.
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>

            {/* Asset preview · floating overlay above the modal */}
            <Transition show={previewAsset !== null} as={Fragment}>
                <Dialog onClose={() => setPreviewAsset(null)} className="relative z-[220]">
                    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" />
                    <div className={`fixed inset-0 flex items-center justify-center p-3 ${offsetClass}`}>
                        <DialogPanel className="w-full h-[90vh] max-w-[1100px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
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

function prevStage(s: Stage): Stage {
    return s === 'publish' ? 'review' : 'filter'
}

// ─── Stage stepper ──────────────────────────────────────────────────────────

function StageStepper({ current, onJump }: { current: Stage; onJump: (s: Stage) => void }) {
    const stages: { id: Stage; label: string }[] = [
        { id: 'filter',   label: 'Filter'   },
        { id: 'review',   label: 'Review'   },
        { id: 'publish',  label: 'Publish'  },
    ]
    const currentIdx = stages.findIndex(s => s.id === current)
    return (
        <div className="hidden md:flex items-center gap-1.5">
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
                        {i < stages.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    </Fragment>
                )
            })}
        </div>
    )
}

// (Discover stage colapsado en Filter · trigger context vive en el AI banner ahora)

// ─── Filter stage ───────────────────────────────────────────────────────────

function FilterLeft({ included, excluded }: { included: typeof FAIRPORT_VENDOR_JOBS; excluded: typeof FAIRPORT_VENDOR_JOBS }) {
    return (
        <div className="p-5 space-y-4">
            <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-1.5">Included · {included.length} IQ jobs</div>
                <div className="rounded-2xl border border-success/30 bg-success/5 overflow-hidden">
                    <div className="divide-y divide-success/15">
                        {included.map(j => (
                            <div key={j.iqJobId} className="p-3 flex items-center gap-3">
                                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-success/15 text-success uppercase tracking-wider shrink-0">
                                    <Check className="h-2.5 w-2.5 mr-0.5" />
                                    Include
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-mono text-xs font-bold text-foreground">{j.iqJobId}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{j.vendor}</span>
                                    </div>
                                    <div className="text-sm text-foreground">{j.description}</div>
                                    <div className="text-[11px] text-muted-foreground">{j.rationale}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-1.5">Excluded · {excluded.length} IQ jobs</div>
                <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden">
                    <div className="divide-y divide-border">
                        {excluded.map(j => (
                            <div key={j.iqJobId} className="p-3 flex items-center gap-3 opacity-80">
                                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider shrink-0">
                                    <X className="h-2.5 w-2.5 mr-0.5" />
                                    Exclude
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-mono text-xs font-bold text-muted-foreground line-through">{j.iqJobId}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{j.vendor}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{j.description}</div>
                                    <div className="text-[11px] text-muted-foreground">
                                        <span className="font-mono">{j.customerTag}</span> · {j.rationale}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function FilterRight({ includedCount, excludedCount, assetCount, onContinue }: { includedCount: number; excludedCount: number; assetCount: number; onContinue: () => void }) {
    return (
        <div className="p-5 flex flex-col h-full">
            <div className="space-y-3 flex-1">
                <div>
                    <h3 className="text-base font-bold text-foreground mb-0.5">Consolidation summary</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Strata used the customer tag as the consolidation key · the customer already maintains it.</p>
                </div>

                {/* Big KPI cards · moved from old DiscoverRight so the operator
                    sees the 5/2 split at a glance without a separate stage. */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-success/30 bg-success/5 p-3">
                        <div className="text-[10px] font-bold text-success uppercase tracking-wider">In-project</div>
                        <div className="text-2xl font-bold text-foreground tabular-nums mt-0.5">{includedCount}</div>
                        <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">Tag-matched · will seed</div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Excluded</div>
                        <div className="text-2xl font-bold text-foreground tabular-nums mt-0.5">{excludedCount}</div>
                        <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">Tag mismatch · won't seed</div>
                    </div>
                </div>

                <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Completeness checks</div>
                    <div className="space-y-1.5">
                        <FilterCheckRow label={`${includedCount} of 7 included · matching customer tag`} ok />
                        <FilterCheckRow label={`${excludedCount} excluded · rationale shown per row`} ok />
                        <FilterCheckRow label={`5 distinct vendors · no overlap`} ok />
                        <FilterCheckRow label={`Estimated ${assetCount} assets ready to stage`} ok />
                    </div>
                </div>

                <div className="rounded-xl border border-ai/30 bg-ai/5 p-3 flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                    <p className="text-[11px] text-foreground leading-relaxed">
                        After staging, Strata previews each PDF inline so the operator can verify the install-day pack before publishing.
                    </p>
                </div>
            </div>

            <button
                onClick={onContinue}
                className="w-full mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
                Stage {assetCount} assets
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    )
}

function FilterCheckRow({ label, ok }: { label: string; ok: boolean }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            {ok ? (
                <div className="h-5 w-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-success" />
                </div>
            ) : (
                <div className="h-5 w-5 rounded-full bg-warning/15 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-3 w-3 text-warning" />
                </div>
            )}
            <span className="text-foreground">{label}</span>
        </div>
    )
}

// ─── Review stage ───────────────────────────────────────────────────────────

type AssetTypeKey = AssetEntry['type']
type AssetTab = 'all' | AssetTypeKey

function ReviewLeft({ assets, counts, totalSizeKb, onPreview }: { assets: AssetEntry[]; counts: Record<AssetTypeKey, number>; totalSizeKb: number; onPreview: (a: AssetEntry) => void }) {
    const [tab, setTab] = useState<AssetTab>('all')
    const visible = tab === 'all' ? assets : assets.filter(a => a.type === tab)
    return (
        <div className="p-5 space-y-3">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
                <TabButton label={`All ${assets.length}`} active={tab === 'all'} onClick={() => setTab('all')} />
                {(Object.keys(counts) as AssetTypeKey[]).map(k => (
                    <TabButton key={k} label={`${ASSET_TYPE_META[k].label} ${counts[k]}`} active={tab === k} onClick={() => setTab(k)} />
                ))}
                <span className="ml-auto text-[11px] text-muted-foreground">{(totalSizeKb / 1024).toFixed(1)} MB total</span>
            </div>

            {/* Asset list */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="divide-y divide-border">
                    {visible.map(a => (
                        <button
                            key={a.id}
                            onClick={() => onPreview(a)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors text-left"
                        >
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-foreground font-mono truncate">{a.name}</span>
                                    <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${ASSET_TYPE_META[a.type].colorClass}`}>
                                        {ASSET_TYPE_META[a.type].label}
                                    </span>
                                    {a.aiFlagged && (
                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-warning/15 text-warning">
                                            <Sparkles className="h-3 w-3" />
                                            Strata flag
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums shrink-0">{a.sizeKb.toLocaleString()} KB</span>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                active ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
        >
            {label}
        </button>
    )
}

function ReviewRight({ assetCount, totalSizeKb, onContinue }: { assetCount: number; totalSizeKb: number; onContinue: () => void }) {
    const flaggedAsset = FAIRPORT_VENDOR_JOBS.flatMap(j => j.assets).find(a => a.aiFlagged)
    return (
        <div className="p-5 flex flex-col h-full">
            <div className="space-y-3 flex-1">
                <div>
                    <h3 className="text-base font-bold text-foreground mb-0.5">Asset summary</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{assetCount} assets · {(totalSizeKb / 1024).toFixed(1)} MB · will be staged to a single SharePoint folder.</p>
                </div>

                {flaggedAsset && (
                    <div className="rounded-xl border border-warning/40 bg-warning/5 p-3 space-y-2">
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-warning" />
                            <span className="text-[10px] font-bold text-warning uppercase tracking-wider">1 Strata flag</span>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-foreground font-mono truncate">{flaggedAsset.name}</div>
                            <p className="text-[11px] text-foreground leading-snug mt-0.5">{flaggedAsset.flagReason}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">
                            Strata never blocks · operator confirms the flag before publishing.
                        </p>
                    </div>
                )}

                <div className="rounded-xl border border-border bg-card p-3 space-y-1.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Folder readiness</div>
                    <FilterCheckRow label="All 15 assets readable from IQ" ok />
                    <FilterCheckRow label="Installer iPad permissions verified" ok />
                    <FilterCheckRow label="1 flagged asset · awaiting operator review" ok={false} />
                </div>
            </div>

            <button
                onClick={onContinue}
                className="w-full mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
                Ready to publish
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    )
}

// ─── Publish stage ──────────────────────────────────────────────────────────

function PublishLeft({ assets }: { assets: AssetEntry[] }) {
    const grouped = useMemo(() => {
        const map: Record<AssetTypeKey, AssetEntry[]> = {
            'shop-drawing': [], 'ack': [], 'site-plan': [], 'runbook': [],
        }
        for (const a of assets) map[a.type].push(a)
        return map
    }, [assets])
    return (
        <div className="p-5 space-y-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Folder preview · ready to publish</div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-mono text-foreground">Fairport-Library-Phase1/</span>
                </div>
                <div className="p-3 space-y-2.5">
                    {(Object.keys(grouped) as AssetTypeKey[]).map(type => {
                        if (grouped[type].length === 0) return null
                        return (
                            <div key={type}>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-mono font-bold text-foreground">{ASSET_TYPE_META[type].label.toLowerCase().replace(' ', '-')}s/</span>
                                    <span className="text-[10px] text-muted-foreground">{grouped[type].length}</span>
                                </div>
                                <div className="ml-5 space-y-0.5">
                                    {grouped[type].map(a => (
                                        <div key={a.id} className="flex items-center gap-1.5 text-[11px] py-0.5">
                                            <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                                            <span className="font-mono text-muted-foreground truncate flex-1">{a.name}</span>
                                            {a.aiFlagged && <Sparkles className="h-2.5 w-2.5 text-warning" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function PublishRight({ assetCount, totalSizeKb, onPublish }: { assetCount: number; totalSizeKb: number; onPublish: () => void }) {
    const copyUrl = () => {
        navigator.clipboard?.writeText(SHAREPOINT_FOLDER_URL).catch(() => {})
    }
    return (
        <div className="p-5 flex flex-col h-full">
            <div className="space-y-3 flex-1">
                <div>
                    <h3 className="text-base font-bold text-foreground mb-0.5">Ready to publish</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{assetCount} assets · {(totalSizeKb / 1024).toFixed(1)} MB · single SharePoint folder · installer iPad accessible.</p>
                </div>

                <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">SharePoint URL</div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                        <code className="text-[11px] text-foreground flex-1 truncate font-mono">{SHAREPOINT_FOLDER_URL}</code>
                        <button onClick={copyUrl} className="p-1 rounded hover:bg-muted transition-colors shrink-0" title="Copy URL">
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Installer notification · draft</span>
                    </div>
                    <div className="text-[11px] text-foreground">
                        <strong>Subject:</strong> Fairport Public Library install · Jun 2 · folder ready
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-3">
                        Hi — your install day folder is live in SharePoint. 8 shop drawings, 5 vendor ACKs, the site plan and your runbook. One ACK has a Strata flag for short-shipped lounge chairs — verify on receipt. Tap the link from your iPad to open.
                    </p>
                </div>
            </div>

            <button
                onClick={onPublish}
                className="w-full mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
                <Check className="h-4 w-4" />
                Publish folder
            </button>
        </div>
    )
}
