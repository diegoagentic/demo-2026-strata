/**
 * w2.3 — AdminScene
 * AP (Letza): manager list + expense categories + GL rules + approval hierarchy
 * Pain points resolved: PP6 (manager dropdown IT-gated), PP7 (categories outdated),
 *   PP8 (GL codes manual lookup → rules engine)
 */

import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, X, CheckCircle2, ChevronRight, Sparkles, ChevronDown } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

const INITIAL_MANAGERS = [
    { name: 'Sarah Johnson', dept: 'Operations', location: 'Tampa' },
    { name: 'Mike Torres',   dept: 'Sales',      location: 'Orlando' },
    { name: 'Ana Reyes',     dept: 'Procurement', location: 'Miami' },
]

const DEPARTMENTS = ['Operations', 'Sales', 'Procurement', 'Finance', 'IT', 'HR']
const LOCATIONS   = ['Tampa', 'Orlando', 'Miami', 'Jacksonville', 'Fort Lauderdale']

const INITIAL_CATEGORIES = ['Fuel', 'Meals', 'Travel', 'Parking', 'Office', 'Client Entertainment', 'Training', 'Equipment']

const GL_RULES_INITIAL = [
    { category: 'Fuel',                  glCode: '6200', glName: 'Vehicle Expenses',      confidence: 94 },
    { category: 'Meals & Entertainment', glCode: '6100', glName: 'Meals & Entertainment', confidence: 91 },
    { category: 'Travel',                glCode: '6210', glName: 'Travel & Transit',       confidence: 96 },
    { category: 'Parking',               glCode: '6210', glName: 'Travel & Transit',       confidence: 97 },
    { category: 'Office',                glCode: '6300', glName: 'Office Expenses',         confidence: 89 },
]

const GL_CODE_OPTIONS = [
    { code: '6200', name: 'Vehicle Expenses' },
    { code: '6100', name: 'Meals & Entertainment' },
    { code: '6210', name: 'Travel & Transit' },
    { code: '6300', name: 'Office Expenses' },
    { code: '6400', name: 'Training & Development' },
    { code: '6500', name: 'Equipment & Supplies' },
]

// Simulated CORE employee lookup for AI suggestion
const CORE_EMPLOYEES: Record<string, { dept: string; location: string }> = {
    'david': { dept: 'Operations',  location: 'Tampa' },
    'lisa':  { dept: 'Sales',       location: 'Jacksonville' },
    'james': { dept: 'Finance',     location: 'Miami' },
}

export default function AdminScene({ onSave }: { onSave?: () => void }) {
    const [managers, setManagers]       = useState(INITIAL_MANAGERS)
    const [categories, setCategories]   = useState(INITIAL_CATEGORIES)
    const [glRules, setGlRules]         = useState(GL_RULES_INITIAL)
    const [showAddMgr, setShowAddMgr]   = useState(false)
    const [newMgr, setNewMgr]           = useState({ name: '', dept: '', location: '' })
    const [newCat, setNewCat]           = useState('')
    const [saved, setSaved]             = useState(false)
    const [editingRule, setEditingRule] = useState<string | null>(null)
    const [aiSuggestion, setAiSuggestion] = useState<{ dept: string; location: string } | null>(null)
    const aiTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    // Debounced AI suggestion when typing a manager name
    useEffect(() => {
        clearTimeout(aiTimerRef.current)
        setAiSuggestion(null)
        if (!newMgr.name.trim() || newMgr.name.length < 3) return
        const key = newMgr.name.toLowerCase().split(' ')[0]
        aiTimerRef.current = setTimeout(() => {
            const match = CORE_EMPLOYEES[key]
            if (match) setAiSuggestion(match)
        }, 600)
        return () => clearTimeout(aiTimerRef.current)
    }, [newMgr.name])

    const applyAiSuggestion = () => {
        if (!aiSuggestion) return
        setNewMgr(prev => ({ ...prev, dept: aiSuggestion.dept, location: aiSuggestion.location }))
        setAiSuggestion(null)
    }

    const addManager = () => {
        if (!newMgr.name.trim()) return
        setManagers(prev => [...prev, { name: newMgr.name, dept: newMgr.dept || 'Operations', location: newMgr.location || 'Tampa' }])
        setNewMgr({ name: '', dept: '', location: '' })
        setShowAddMgr(false)
        setAiSuggestion(null)
    }

    const removeManager = (name: string) => setManagers(prev => prev.filter(m => m.name !== name))

    const addCategory = () => {
        if (!newCat.trim()) return
        setCategories(prev => [...prev, newCat.trim()])
        setNewCat('')
    }

    const removeCategory = (cat: string) => setCategories(prev => prev.filter(c => c !== cat))

    const updateGlRule = (category: string, glCode: string) => {
        const option = GL_CODE_OPTIONS.find(o => o.code === glCode)
        if (!option) return
        setGlRules(prev => prev.map(r =>
            r.category === category ? { ...r, glCode: option.code, glName: option.name } : r
        ))
        setEditingRule(null)
    }

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => { setSaved(false); onSave?.() }, 1400)
    }

    return (
        <div className="max-w-lg mx-auto space-y-5">
            <div className="bg-card border border-border rounded-xl px-4 py-3">
                <p className="text-sm font-bold text-foreground">Admin · Letza Bombard</p>
                <p className="text-xs text-muted-foreground">Self-service · No IT ticket required · Changes apply immediately</p>
            </div>

            {/* Section 1 — Manager List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-foreground">Approval Managers</p>
                        <p className="text-[10px] text-muted-foreground">Feeds the submission dropdown — always current</p>
                    </div>
                    <button
                        onClick={() => { setShowAddMgr(!showAddMgr); setAiSuggestion(null) }}
                        className="flex items-center gap-1 text-xs text-ai font-medium hover:text-ai/80 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                </div>

                <div className="divide-y divide-border">
                    {managers.map(m => (
                        <div key={m.name} className="flex items-center justify-between px-4 py-2.5">
                            <div>
                                <p className="text-xs font-semibold text-foreground">{m.name}</p>
                                <p className="text-[10px] text-muted-foreground">{m.dept} · {m.location}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Edit">
                                    <Pencil className="h-3 w-3" />
                                </button>
                                <button onClick={() => removeManager(m.name)} className="p-1 text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {showAddMgr && (
                    <div className="px-4 py-3 border-t border-border bg-muted/30 space-y-2 animate-in fade-in duration-200">
                        <input
                            value={newMgr.name}
                            onChange={e => setNewMgr(p => ({ ...p, name: e.target.value }))}
                            placeholder="Full name (try 'David' or 'Lisa')"
                            className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                        />

                        {aiSuggestion && (
                            <div className="flex items-center justify-between gap-2 bg-ai/5 border border-ai/20 rounded-lg px-3 py-2 animate-in fade-in duration-200">
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="h-3 w-3 text-ai shrink-0" />
                                    <p className="text-[11px] text-foreground">
                                        Found in CORE: <span className="font-semibold">{aiSuggestion.dept} · {aiSuggestion.location}</span>
                                    </p>
                                </div>
                                <button onClick={applyAiSuggestion} className="text-[10px] text-ai font-bold hover:underline shrink-0">
                                    Use →
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <select
                                value={newMgr.dept}
                                onChange={e => setNewMgr(p => ({ ...p, dept: e.target.value }))}
                                className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-2 text-foreground outline-none"
                            >
                                <option value="">Department</option>
                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                            </select>
                            <select
                                value={newMgr.location}
                                onChange={e => setNewMgr(p => ({ ...p, location: e.target.value }))}
                                className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-2 text-foreground outline-none"
                            >
                                <option value="">Location</option>
                                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setShowAddMgr(false); setAiSuggestion(null) }} className="flex-1 text-xs text-muted-foreground py-1.5 hover:text-foreground">Cancel</button>
                            <button
                                onClick={addManager}
                                disabled={!newMgr.name.trim()}
                                className="flex-1 text-xs bg-primary text-primary-foreground font-bold py-1.5 rounded-lg hover:opacity-90 disabled:opacity-40"
                            >
                                Save Manager
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Before Strata: required an IT ticket to update this dropdown</p>
                    </div>
                )}
            </div>

            {/* Section 2 — Expense Categories */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">Expense Categories</p>
                    <p className="text-[10px] text-muted-foreground">Feed the GL rules engine — changes apply to new submissions immediately</p>
                </div>
                <div className="px-4 py-3 flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <span key={cat} className="group inline-flex items-center gap-1 text-xs bg-muted border border-border text-foreground px-2.5 py-1 rounded-full">
                            {cat}
                            <button onClick={() => removeCategory(cat)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all" aria-label={`Remove ${cat}`}>
                                <X className="h-2.5 w-2.5" />
                            </button>
                        </span>
                    ))}
                    <div className="flex items-center gap-1">
                        <input
                            value={newCat}
                            onChange={e => setNewCat(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addCategory()}
                            placeholder="+ Add category"
                            className="text-xs bg-transparent border-none outline-none text-muted-foreground placeholder:text-muted-foreground/60 w-28"
                        />
                        {newCat && (
                            <button onClick={addCategory} className="text-ai" aria-label="Add category">
                                <Plus className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="px-4 pb-3">
                    <p className="text-[10px] text-muted-foreground">Before Strata: categories lived in a spreadsheet, disconnected from the GL lookup</p>
                </div>
            </div>

            {/* Section 3 — GL Mapping Rules */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-ai" />
                        <p className="text-xs font-bold text-foreground">GL Mapping Rules</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Powers AI confidence scores in AP review — edit to improve accuracy</p>
                </div>

                <div className="divide-y divide-border">
                    {glRules.map(rule => (
                        <div key={rule.category} className="flex items-center gap-2 px-4 py-2.5">
                            <span className="text-xs text-foreground w-28 shrink-0">{rule.category}</span>

                            {editingRule === rule.category ? (
                                <select
                                    autoFocus
                                    value={rule.glCode}
                                    onChange={e => updateGlRule(rule.category, e.target.value)}
                                    onBlur={() => setEditingRule(null)}
                                    className="flex-1 text-xs bg-background border border-primary rounded px-2 py-1 text-foreground outline-none"
                                >
                                    {GL_CODE_OPTIONS.map(o => (
                                        <option key={o.code} value={o.code}>{o.code} · {o.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">{rule.glCode}</span>
                                    <span className="text-[11px] text-foreground truncate">· {rule.glName}</span>
                                    <ConfidencePill pct={rule.confidence} />
                                    <button
                                        onClick={() => setEditingRule(rule.category)}
                                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-auto"
                                        aria-label={`Edit GL rule for ${rule.category}`}
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="px-4 py-3 border-t border-border">
                    <p className="text-[10px] text-muted-foreground">Before Strata: Letza looked up GL codes manually for each expense — no rules engine, no consistency</p>
                </div>
            </div>

            {/* Section 4 — Approval Hierarchy */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">Approval Hierarchy</p>
                    <p className="text-[10px] text-muted-foreground">Powers Tammy's division rollup on the spend dashboard</p>
                </div>
                <div className="px-4 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        {['Employee', 'Manager', 'Dept Head', 'CFO / AP'].map((level, i, arr) => (
                            <div key={level} className="flex items-center gap-2">
                                <span className="text-xs bg-muted border border-border text-foreground px-3 py-1.5 rounded-full font-medium cursor-pointer hover:border-primary transition-colors">{level}</span>
                                {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save CTA */}
            <button
                onClick={handleSave}
                disabled={saved}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-all"
            >
                {saved ? (
                    <>
                        <CheckCircle2 className="h-4 w-4" />
                        Changes applied · GL rules updated
                    </>
                ) : (
                    'Save all changes →'
                )}
            </button>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}

function ConfidencePill({ pct }: { pct: number }) {
    const color = pct >= 90 ? 'text-success bg-success/10' : pct >= 75 ? 'text-warning bg-warning/10' : 'text-muted-foreground bg-muted'
    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{pct}%</span>
    )
}
