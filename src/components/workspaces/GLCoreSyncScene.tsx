/**
 * w2.2 — GLCoreSyncScene
 * AP (Letza): GL confidence% table + inline override + CORE auto-post animation
 * Wow moment: "Posted · No manual re-entry · Letza saved ~15 min"
 * Self-indicated: handles its own AI reveal
 */

import { useState, useRef, useCallback } from 'react'
import { Sparkles, CheckCircle2, ChevronDown } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type PostState = 'idle' | 'posting' | 'posted'

const GL_CODES = ['6200 · Vehicle Expenses', '6210 · Travel & Transit', '6100 · Meals & Entertainment', '6300 · Office Supplies']

const LINES = [
    { id: 'fuel',    description: 'Fuel — Tampa',  amount: '$95.00',  glCode: '6200 · Vehicle Expenses',    confidence: 94 },
    { id: 'parking', description: 'Parking',        amount: '$47.50',  glCode: '6210 · Travel & Transit',    confidence: 97 },
]

export default function GLCoreSyncScene({ onPost }: { onPost?: () => void }) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [overrides, setOverrides] = useState<Record<string, string>>({})
    const [editingLine, setEditingLine] = useState<string | null>(null)
    const [postState, setPostState] = useState<PostState>('idle')

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
        setPostState('posting')
        pauseAware(() => {
            setPostState('posted')
            pauseAware(() => onPost?.(), 600)
        }, 900)
    }

    const getGL = (line: typeof LINES[0]) => overrides[line.id] ?? line.glCode

    return (
        <div className="max-w-lg mx-auto space-y-4">
            {/* Expense header */}
            <div className="bg-card border border-border rounded-xl px-4 py-3">
                <p className="text-sm font-bold text-foreground">GL Review · John Smith · $142.50</p>
                <p className="text-xs text-muted-foreground mt-0.5">Approved by Sarah Johnson · May 6 · 2 receipts verified ✓</p>
            </div>

            {/* GL Lines table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0">
                    {/* Header */}
                    <div className="contents">
                        {['Description', 'Amount', 'GL Code', 'Conf.'].map(h => (
                            <div key={h} className="px-3 py-2 bg-muted/40 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* Lines */}
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
                                            className="ml-1 flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
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

            {/* Post CTA + animation */}
            {postState === 'idle' && (
                <button
                    onClick={handlePost}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                >
                    <Sparkles className="h-4 w-4" />
                    Confirm & Post to CORE
                </button>
            )}

            {postState === 'posting' && (
                <div className="bg-card border border-border rounded-xl px-4 py-4 flex items-center gap-3 animate-in fade-in duration-200">
                    <div className="h-5 w-5 border-2 border-ai border-t-transparent rounded-full animate-spin" />
                    <div>
                        <p className="text-sm font-semibold text-foreground">Posting to CORE...</p>
                        <p className="text-xs text-muted-foreground">Creating GL entries · GL 6200 + GL 6210</p>
                    </div>
                </div>
            )}

            {postState === 'posted' && (
                <div className="bg-success/10 border border-success/20 rounded-xl px-4 py-4 space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <p className="text-sm font-bold text-success">Entry #CR-2847 posted to CORE</p>
                    </div>
                    <p className="text-xs text-muted-foreground">GL 6200 · $95.00 + GL 6210 · $47.50 · No manual re-entry</p>
                    <div className="flex items-center gap-2 pt-1 border-t border-success/20">
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Letza saved ~15 min</span> on this expense alone · John Smith notified: payment processing
                        </p>
                    </div>
                </div>
            )}

            {postState === 'idle' && (
                <p className="text-xs text-center text-muted-foreground">
                    Before Strata: Letza copied each field from GlobalSearch into CORE manually — ~15 min per expense
                </p>
            )}

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
