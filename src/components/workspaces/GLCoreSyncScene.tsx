/**
 * w2.2 — GLCoreSyncScene
 * AP (Letza): context state → GL review → 3-step posting → posted
 * State machine: 'context' | 'reviewing' | 'posting' | 'posted'
 * Wow moment: "Posted · No manual re-entry · Letza saved ~15 min"
 */

import { useState, useRef, useCallback } from 'react'
import { Sparkles, CheckCircle2, ChevronDown, Receipt, ArrowRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import { ReceiptImage } from './ExpenseSubmitScene'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type SceneState = 'context' | 'reviewing' | 'posting' | 'posted'
type PostingStep = 'validating' | 'creating' | 'notifying'

const GL_CODES = ['6200 · Vehicle Expenses', '6210 · Travel & Transit', '6100 · Meals & Entertainment', '6300 · Office Expenses']

const LINES = [
    { id: 'fuel',    description: 'Fuel — Tampa',  amount: '$95.00',  glCode: '6200 · Vehicle Expenses',    confidence: 94 },
    { id: 'parking', description: 'Parking',        amount: '$47.50',  glCode: '6210 · Travel & Transit',    confidence: 97 },
]

const POSTING_STEPS: { key: PostingStep; label: string }[] = [
    { key: 'validating', label: 'Validating GL codes...'          },
    { key: 'creating',   label: 'Creating CORE entry #CR-2847...' },
    { key: 'notifying',  label: 'Notifying John Smith...'         },
]

export default function GLCoreSyncScene({ onPost }: { onPost?: () => void }) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [sceneState, setSceneState] = useState<SceneState>('context')
    const [overrides, setOverrides] = useState<Record<string, string>>({})
    const [editingLine, setEditingLine] = useState<string | null>(null)
    const [postingStep, setPostingStep] = useState<PostingStep>('validating')

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
        }
        setTimeout(tick, 0)
    }, [])

    const handlePost = () => {
        setSceneState('posting')
        setPostingStep('validating')
        pauseAware(() => setPostingStep('creating'),  450)
        pauseAware(() => setPostingStep('notifying'), 900)
        pauseAware(() => setSceneState('posted'),     1300)
        pauseAware(() => onPost?.(),                  3300)
    }

    const getGL = (line: typeof LINES[0]) => overrides[line.id] ?? line.glCode

    // ── Context state ──────────────────────────────────────────────────────────
    if (sceneState === 'context') {
        return (
            <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-500">
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-sm font-bold text-foreground">John Smith · $142.50</p>
                            <p className="text-xs text-muted-foreground">Fuel + Parking · May 5, 2026</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Approved by Sarah Johnson · May 6, 9:15 AM · <span className="text-success">within SLA ✓</span>
                            </p>
                        </div>
                        <span className="text-[10px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full font-medium shrink-0">
                            Manager approved
                        </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Employee: 3rd expense this month · avg $118.50 · history normal</p>
                </div>

                {/* Receipt thumbnails */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs font-bold text-foreground">Receipts</p>
                        <span className="text-[10px] text-success font-medium">2 verified ✓</span>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1 space-y-1">
                            <ReceiptImage variant="fuel" className="w-full rounded-lg" />
                            <p className="text-[10px] text-center text-muted-foreground">Fuel · $95.00</p>
                        </div>
                        <div className="flex-1 space-y-1">
                            <ReceiptImage variant="parking" className="w-full rounded-lg" />
                            <p className="text-[10px] text-center text-muted-foreground">Parking · $47.50</p>
                        </div>
                    </div>
                </div>

                {/* AI analysis */}
                <div className="bg-ai/5 border border-ai/20 rounded-xl px-4 py-3 space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-ai" />
                        <p className="text-xs font-semibold text-ai">Strata found 2 GL codes with high confidence</p>
                    </div>
                    <div className="space-y-1.5">
                        {LINES.map(line => (
                            <div key={line.id} className="flex items-center justify-between gap-2">
                                <span className="text-[11px] text-foreground">{line.glCode}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[11px] font-mono text-muted-foreground">{line.amount}</span>
                                    <ConfidencePill pct={line.confidence} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setSceneState('reviewing')}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                >
                    Review GL Codes
                    <ArrowRight className="h-4 w-4" />
                </button>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
            </div>
        )
    }

    // ── Reviewing state ────────────────────────────────────────────────────────
    if (sceneState === 'reviewing') {
        return (
            <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-300">
                <div className="bg-card border border-border rounded-xl px-4 py-3">
                    <p className="text-sm font-bold text-foreground">GL Review · John Smith · $142.50</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Approved by Sarah Johnson · May 6 · <span className="text-success font-medium">2 receipts verified ✓ · amounts match GL lines</span>
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0">
                        <div className="contents">
                            {['Description', 'Amount', 'GL Code', 'Conf.'].map(h => (
                                <div key={h} className="px-3 py-2 bg-muted/40 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                    {h}
                                </div>
                            ))}
                        </div>

                        {LINES.map((line, i) => (
                            <div key={line.id} className="contents">
                                <div className={`px-3 py-3 text-xs text-foreground flex items-center ${i < LINES.length - 1 ? 'border-b border-border' : ''}`}>
                                    {line.description}
                                </div>
                                <div className={`px-3 py-3 text-xs font-mono text-foreground flex items-center ${i < LINES.length - 1 ? 'border-b border-border' : ''}`}>
                                    {line.amount}
                                </div>
                                <div className={`px-3 py-3 flex items-center gap-1.5 ${i < LINES.length - 1 ? 'border-b border-border' : ''}`}>
                                    {editingLine === line.id ? (
                                        <select
                                            autoFocus
                                            value={getGL(line)}
                                            onChange={e => { setOverrides(prev => ({ ...prev, [line.id]: e.target.value })); setEditingLine(null) }}
                                            onBlur={() => setEditingLine(null)}
                                            className="text-xs bg-background border border-primary rounded px-1.5 py-0.5 text-foreground outline-none"
                                        >
                                            {GL_CODES.map(g => <option key={g}>{g}</option>)}
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles className="h-3 w-3 text-ai shrink-0" />
                                            <span className="text-[11px] text-foreground leading-tight">{getGL(line)}</span>
                                            <button
                                                onClick={() => setEditingLine(line.id)}
                                                className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                                                title="Override GL code"
                                            >
                                                <ChevronDown className="h-2.5 w-2.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className={`px-3 py-3 flex items-center ${i < LINES.length - 1 ? 'border-b border-border' : ''}`}>
                                    <ConfidencePill pct={line.confidence} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handlePost}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                >
                    <Sparkles className="h-4 w-4" />
                    Confirm & Post to CORE
                </button>

                <p className="text-xs text-center text-muted-foreground">
                    Before Strata: Letza copied each field from GlobalSearch into CORE manually — ~15 min per expense
                </p>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
            </div>
        )
    }

    // ── Posting state ──────────────────────────────────────────────────────────
    if (sceneState === 'posting') {
        const currentIdx = POSTING_STEPS.findIndex(s => s.key === postingStep)
        return (
            <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-200">
                <div className="bg-card border border-border rounded-xl px-4 py-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 border-2 border-ai border-t-transparent rounded-full animate-spin shrink-0" />
                        <p className="text-sm font-semibold text-foreground">Posting to CORE...</p>
                    </div>
                    <div className="space-y-2.5">
                        {POSTING_STEPS.map((step, idx) => {
                            const done   = idx < currentIdx
                            const active = idx === currentIdx
                            return (
                                <div key={step.key} className="flex items-center gap-2.5">
                                    {done
                                        ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                        : <div className={`h-3.5 w-3.5 rounded-full border shrink-0 ${active ? 'border-ai border-2' : 'border-border'}`} />
                                    }
                                    <span className={`text-xs transition-colors duration-300 ${done ? 'text-success' : active ? 'text-foreground font-medium' : 'text-muted-foreground/40'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
            </div>
        )
    }

    // ── Posted state ───────────────────────────────────────────────────────────
    return (
        <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-300">
            <div className="bg-success/10 border border-success/20 rounded-xl px-4 py-4 space-y-3">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <p className="text-sm font-bold text-success">Entry #CR-2847 posted to CORE</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">GL 6200 · $95.00 · Vehicle Expenses</p>
                    <p className="text-xs text-muted-foreground">GL 6210 · $47.50 · Travel & Transit</p>
                </div>
                <p className="text-xs text-muted-foreground pt-1 border-t border-success/20">
                    John Smith notified: <span className="text-foreground font-medium">"Your expense was posted · payment processing"</span>
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Before Strata</span>
                    <span className="text-xs text-muted-foreground line-through">~15 min/expense · manual re-entry</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">With Strata</span>
                    <span className="text-xs font-bold text-success">1 click · 0 manual re-entry ✓</span>
                </div>
                <p className="text-[10px] text-muted-foreground pt-1">
                    Letza saved ~15 min on this expense · ~45 min for a batch of 3 → now under 4 min
                </p>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
        </div>
    )
}

function ConfidencePill({ pct }: { pct: number }) {
    const color = pct >= 90 ? 'text-success bg-success/10' : pct >= 75 ? 'text-warning bg-warning/10' : 'text-muted-foreground bg-muted'
    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{pct}%</span>
    )
}
