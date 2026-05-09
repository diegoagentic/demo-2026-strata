/**
 * w2.3 — AdminScene
 * AP (Letza): manager list + expense categories + GL rules + approval hierarchy
 * Pain points resolved: PP6 (manager dropdown IT-gated), PP7 (categories outdated),
 *   PP8 (GL codes manual lookup → rules engine)
 */

import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, X, CheckCircle2, ChevronRight, Sparkles, Check, Link2, GripVertical } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

const INITIAL_MANAGERS = [
    { name: 'Sarah Johnson', dept: 'Operations', location: 'Tampa' },
    { name: 'Mike Torres',   dept: 'Sales',      location: 'Orlando' },
    { name: 'Ana Reyes',     dept: 'Procurement', location: 'Miami' },
]

const DEPARTMENTS = ['Operations', 'Sales', 'Procurement', 'Finance', 'IT', 'HR']
const LOCATIONS   = ['Tampa', 'Orlando', 'Miami', 'Jacksonville', 'Fort Lauderdale']

const CORE_PEOPLE = [
    { name: 'David Chen',    dept: 'Operations',  location: 'Tampa'        },
    { name: 'Lisa Martinez', dept: 'Sales',        location: 'Jacksonville' },
    { name: 'James Wilson',  dept: 'Finance',      location: 'Miami'        },
]

const INITIAL_CATEGORIES = ['Fuel', 'Meals', 'Travel', 'Parking', 'Office', 'Client Entertainment', 'Training', 'Equipment']
const CATEGORY_SUGGESTIONS = ['Fuel', 'Meals', 'Travel', 'Parking', 'Office', 'Client Entertainment', 'Training', 'Equipment', 'Tolls', 'Accommodation', 'Conference', 'Subscriptions']

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

export default function AdminScene({ onSave }: { onSave?: () => void }) {
    const [managers, setManagers]           = useState(INITIAL_MANAGERS)
    const [categories, setCategories]       = useState(INITIAL_CATEGORIES)
    const [glRules, setGlRules]             = useState(GL_RULES_INITIAL)
    const [showAddMgr, setShowAddMgr]       = useState(false)
    const [newMgr, setNewMgr]               = useState({ name: '', customName: '', dept: '', location: '' })
    const [saved, setSaved]                 = useState(false)
    const [editingRule, setEditingRule]     = useState<string | null>(null)
    const [editingManager, setEditingManager] = useState<string | null>(null)
    const [editMgrData, setEditMgrData]     = useState({ name: '', customName: '', dept: '', location: '' })
    const [showCatDropdown, setShowCatDropdown] = useState(false)
    const [showCustomCat, setShowCustomCat] = useState(false)
    const [customCatInput, setCustomCatInput] = useState('')
    const catDropdownRef = useRef<HTMLDivElement>(null)
    const [editingHierarchy, setEditingHierarchy] = useState(false)
    const [hierarchySaved, setHierarchySaved]     = useState(false)
    const [hierarchy, setHierarchy]               = useState(['Employee', 'Manager', 'Dept Head', 'CFO / AP'])
    const hierarchySnapshot                       = useRef<string[]>([])
    const dragIdx                                 = useRef<number | null>(null)
    const [dragOver, setDragOver]                 = useState<number | null>(null)

    const handleDragStart = (i: number) => { dragIdx.current = i }
    const handleDragOver  = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i) }
    const handleDrop      = (i: number) => {
        if (dragIdx.current === null || dragIdx.current === i) { setDragOver(null); return }
        const next = [...hierarchy]
        const [item] = next.splice(dragIdx.current, 1)
        next.splice(i, 0, item)
        setHierarchy(next)
        dragIdx.current = null
        setDragOver(null)
    }
    const handleDragEnd = () => { dragIdx.current = null; setDragOver(null) }

    useEffect(() => {
        if (!showCatDropdown) return
        const handler = (e: MouseEvent) => {
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
                setShowCatDropdown(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [showCatDropdown])

    // ── Manager CRUD ─────────────────────────────────────────────────────────

    const startEditManager = (m: typeof managers[number]) => {
        setEditingManager(m.name)
        setEditMgrData({ name: m.name, customName: '', dept: m.dept, location: m.location })
    }

    const saveEditManager = (originalName: string) => {
        const resolvedName = editMgrData.name === '__other__' ? editMgrData.customName.trim() : editMgrData.name
        if (!resolvedName) return
        setManagers(prev => prev.map(m =>
            m.name === originalName
                ? { name: resolvedName, dept: editMgrData.dept, location: editMgrData.location }
                : m
        ))
        setEditingManager(null)
    }

    const handleEditMgrSelect = (value: string) => {
        if (value === '__other__') {
            setEditMgrData(p => ({ ...p, name: '__other__', customName: '', dept: p.dept, location: p.location }))
        } else {
            const person = CORE_PEOPLE.find(p => p.name === value)
            setEditMgrData({ name: value, customName: '', dept: person?.dept ?? '', location: person?.location ?? '' })
        }
    }

    const addManager = () => {
        const resolvedName = newMgr.name === '__other__' ? newMgr.customName.trim() : newMgr.name
        if (!resolvedName) return
        setManagers(prev => [...prev, { name: resolvedName, dept: newMgr.dept || 'Operations', location: newMgr.location || 'Tampa' }])
        setNewMgr({ name: '', customName: '', dept: '', location: '' })
        setShowAddMgr(false)
    }

    const handleNewMgrSelect = (value: string) => {
        if (value === '__other__') {
            setNewMgr(p => ({ ...p, name: '__other__', customName: '', dept: '', location: '' }))
        } else {
            const person = CORE_PEOPLE.find(p => p.name === value)
            setNewMgr({ name: value, customName: '', dept: person?.dept ?? '', location: person?.location ?? '' })
        }
    }

    const removeManager = (name: string) => setManagers(prev => prev.filter(m => m.name !== name))

    // ── Category CRUD ─────────────────────────────────────────────────────────

    const availableSuggestions = CATEGORY_SUGGESTIONS.filter(s => !categories.includes(s))

    const addCategorySuggestion = (cat: string) => {
        if (cat === '__other__') { setShowCustomCat(true); setShowCatDropdown(false); return }
        setCategories(prev => [...prev, cat])
        setShowCatDropdown(false)
    }

    const addCustomCategory = () => {
        if (!customCatInput.trim()) return
        setCategories(prev => [...prev, customCatInput.trim()])
        setCustomCatInput('')
        setShowCustomCat(false)
    }

    const removeCategory = (cat: string) => setCategories(prev => prev.filter(c => c !== cat))

    // ── GL Rules ──────────────────────────────────────────────────────────────

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
                        onClick={() => { setShowAddMgr(!showAddMgr); setEditingManager(null) }}
                        className="flex items-center gap-1 text-xs text-ai font-medium hover:text-ai/80 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                </div>

                <div className="divide-y divide-border">
                    {managers.map(m => (
                        <div key={m.name}>
                            <div className="flex items-center justify-between px-4 py-2.5">
                                <div>
                                    <p className="text-xs font-semibold text-foreground">{m.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{m.dept} · {m.location}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => editingManager === m.name ? setEditingManager(null) : startEditManager(m)}
                                        className="p-1 text-muted-foreground hover:text-ai transition-colors"
                                        aria-label="Edit"
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={() => removeManager(m.name)}
                                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                        aria-label="Remove"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Inline edit form */}
                            {editingManager === m.name && (
                                <div className="px-4 pb-3 space-y-2 animate-in fade-in duration-200 bg-muted/20 border-t border-border">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide pt-2">Edit manager</p>
                                    <select
                                        value={editMgrData.name}
                                        onChange={e => handleEditMgrSelect(e.target.value)}
                                        className="w-full text-xs bg-background border border-border rounded-lg px-2 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="">Select from CORE...</option>
                                        {CORE_PEOPLE.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                        <option value="__other__">Other (not in CORE)</option>
                                    </select>
                                    {editMgrData.name === '__other__' && (
                                        <input
                                            value={editMgrData.customName}
                                            onChange={e => setEditMgrData(p => ({ ...p, customName: e.target.value }))}
                                            placeholder="Full name"
                                            className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    )}
                                    <div className="flex gap-2">
                                        <select
                                            value={editMgrData.dept}
                                            onChange={e => setEditMgrData(p => ({ ...p, dept: e.target.value }))}
                                            className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-2 text-foreground outline-none"
                                        >
                                            <option value="">Department</option>
                                            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                        <select
                                            value={editMgrData.location}
                                            onChange={e => setEditMgrData(p => ({ ...p, location: e.target.value }))}
                                            className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-2 text-foreground outline-none"
                                        >
                                            <option value="">Location</option>
                                            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingManager(null)} className="flex-1 text-xs text-muted-foreground py-1.5 hover:text-foreground">Cancel</button>
                                        <button
                                            onClick={() => saveEditManager(m.name)}
                                            className="flex-1 text-xs bg-primary text-primary-foreground font-bold py-1.5 rounded-lg hover:opacity-90"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add manager form */}
                {showAddMgr && (
                    <div className="px-4 py-3 border-t border-border bg-muted/30 space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="h-3 w-3 text-ai" />
                            <p className="text-[10px] font-semibold text-ai">Lookup from CORE</p>
                        </div>
                        <select
                            value={newMgr.name}
                            onChange={e => handleNewMgrSelect(e.target.value)}
                            className="w-full text-xs bg-background border border-border rounded-lg px-2 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="">Select employee from CORE...</option>
                            {CORE_PEOPLE.map(p => <option key={p.name} value={p.name}>{p.name} · {p.dept}</option>)}
                            <option value="__other__">Other (not in CORE)</option>
                        </select>

                        {newMgr.name === '__other__' && (
                            <input
                                value={newMgr.customName}
                                onChange={e => setNewMgr(p => ({ ...p, customName: e.target.value }))}
                                placeholder="Full name"
                                className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                            />
                        )}

                        {newMgr.name && newMgr.name !== '__other__' && (
                            <div className="flex items-center gap-1.5 bg-ai/5 border border-ai/20 rounded-lg px-3 py-1.5 animate-in fade-in duration-150">
                                <Check className="h-3 w-3 text-ai shrink-0" />
                                <p className="text-[11px] text-foreground">
                                    CORE match: <span className="font-semibold">{newMgr.dept} · {newMgr.location}</span>
                                </p>
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
                            <button onClick={() => setShowAddMgr(false)} className="flex-1 text-xs text-muted-foreground py-1.5 hover:text-foreground">Cancel</button>
                            <button
                                onClick={addManager}
                                disabled={!newMgr.name || (newMgr.name === '__other__' && !newMgr.customName.trim())}
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
            <div className="bg-card border border-border rounded-xl">
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

                    {/* Add category trigger */}
                    <div className="relative" ref={catDropdownRef}>
                        <button
                            onClick={() => { setShowCatDropdown(!showCatDropdown); setShowCustomCat(false) }}
                            className="inline-flex items-center gap-1 text-xs text-ai border border-dashed border-ai/40 hover:border-ai/80 hover:bg-ai/5 px-2.5 py-1 rounded-full transition-all"
                        >
                            <Plus className="h-3 w-3" /> Add category
                        </button>

                        {showCatDropdown && (
                            <div className="absolute left-0 top-full mt-1 z-10 bg-card border border-border rounded-xl shadow-lg min-w-[180px] py-1 animate-in fade-in duration-150">
                                {availableSuggestions.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => addCategorySuggestion(s)}
                                        className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-muted/60 transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                                {availableSuggestions.length > 0 && <div className="border-t border-border my-1" />}
                                <button
                                    onClick={() => addCategorySuggestion('__other__')}
                                    className="w-full text-left px-3 py-1.5 text-xs text-ai hover:bg-ai/5 transition-colors"
                                >
                                    Other (type name) →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Custom category input */}
                {showCustomCat && (
                    <div className="px-4 pb-3 flex items-center gap-2 animate-in fade-in duration-150">
                        <input
                            value={customCatInput}
                            onChange={e => setCustomCatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addCustomCategory()}
                            placeholder="Category name"
                            autoFocus
                            className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button onClick={addCustomCategory} className="text-xs bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-40" disabled={!customCatInput.trim()}>
                            Add
                        </button>
                        <button onClick={() => { setShowCustomCat(false); setCustomCatInput('') }} className="text-xs text-muted-foreground hover:text-foreground">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}

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
                    <p className="text-[10px] text-muted-foreground">Powers AI confidence scores in AP review — click any row to edit</p>
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
                                <button
                                    onClick={() => setEditingRule(rule.category)}
                                    title="Click to edit GL mapping"
                                    className="flex items-center gap-2 flex-1 min-w-0 rounded-lg px-2 py-1 -mx-2 hover:bg-muted/50 transition-colors cursor-pointer group text-left"
                                >
                                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">{rule.glCode}</span>
                                    <span className="text-[11px] text-foreground truncate">· {rule.glName}</span>
                                    <ConfidencePill pct={rule.confidence} />
                                    <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-auto" />
                                </button>
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
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-foreground">Approval Hierarchy</p>
                        <p className="text-[10px] text-muted-foreground">Powers Tammy's division rollup on the spend dashboard</p>
                    </div>
                    {!editingHierarchy && !hierarchySaved && (
                        <button
                            onClick={() => { hierarchySnapshot.current = [...hierarchy]; setEditingHierarchy(true) }}
                            className="flex items-center gap-1 text-[10px] font-semibold bg-primary text-primary-foreground px-2.5 py-1 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <Pencil className="h-3 w-3" />
                            Edit Hierarchy
                        </button>
                    )}
                    {hierarchySaved && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-success">
                            <Check className="h-3 w-3" />
                            Saved
                        </span>
                    )}
                </div>

                {/* Read-only view */}
                {!editingHierarchy && (
                    <div className="px-4 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            {hierarchy.map((level, i, arr) => (
                                <div key={level} className="flex items-center gap-2">
                                    <span className={`text-xs border px-3 py-1.5 rounded-full font-medium transition-colors ${
                                        hierarchySaved ? 'bg-success/10 border-success/30 text-success' : 'bg-muted border-border text-foreground'
                                    }`}>{level}</span>
                                    {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                                </div>
                            ))}
                        </div>
                        {hierarchySaved && (
                            <p className="text-[10px] text-success mt-2 animate-in fade-in duration-300">
                                Hierarchy updated · Tammy's dashboard rollup will reflect changes
                            </p>
                        )}
                    </div>
                )}

                {/* Edit mode */}
                {editingHierarchy && (
                    <div className="px-4 py-4 space-y-3 animate-in fade-in duration-200">
                        <p className="text-[10px] text-muted-foreground">Drag to reorder · Each level reports to the next</p>
                        <div className="space-y-2">
                            {hierarchy.map((level, i) => (
                                <div
                                    key={level}
                                    draggable
                                    onDragStart={() => handleDragStart(i)}
                                    onDragOver={(e) => handleDragOver(e, i)}
                                    onDrop={() => handleDrop(i)}
                                    onDragEnd={handleDragEnd}
                                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all cursor-grab active:cursor-grabbing ${
                                        dragOver === i
                                            ? 'border-ai/40 bg-ai/5 scale-[1.01]'
                                            : 'border-border bg-card hover:bg-muted/30'
                                    }`}
                                >
                                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                        i === 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                    }`}>{i + 1}</div>
                                    <p className="text-xs font-medium text-foreground flex-1">{level}</p>
                                    <span className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-wide">
                                        {i === 0 ? 'submits' : i === 1 ? 'approves' : i === 2 ? 'oversees' : 'final authority'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => { setEditingHierarchy(false); setHierarchySaved(true) }}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold py-2 rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <Check className="h-3.5 w-3.5" />
                                Confirm Hierarchy
                            </button>
                            <button
                                onClick={() => { setHierarchy(hierarchySnapshot.current); setEditingHierarchy(false) }}
                                className="px-3 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
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
            {saved && (
                <p className="text-[10px] text-success text-center animate-in fade-in duration-300">
                    Live for all new submissions · CORE sync triggered ✓
                </p>
            )}

            {/* Section 5 — Accounting System Integration */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/30">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-semibold text-foreground">Accounting System Integration</p>
                    <span className="ml-auto text-[10px] font-bold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded-full">Active ✓</span>
                </div>
                <div className="px-3 py-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Connection method</span>
                        <span className="font-medium text-foreground">REST API · OAuth 2.0</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Auto-post on AP approval</span>
                        <span className="font-medium text-success">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Last sync</span>
                        <span className="font-medium text-foreground">Today, 9:41 AM</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
                        Approved entries post automatically — no manual re-entry, no copy-paste, no accounting errors.
                    </p>
                </div>
            </div>

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
