/**
 * w2.3 — AdminScene
 * AP (Letza): self-service admin — manager list, expense categories, role hierarchy
 * Pain points resolved: PP6 (manager dropdown IT-gated), PP7 (categories outdated)
 */

import { useState } from 'react'
import { Plus, Pencil, X, CheckCircle2, ChevronRight } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

const INITIAL_MANAGERS = [
    { name: 'Sarah Johnson', dept: 'Operations', location: 'Tampa' },
    { name: 'Mike Torres',   dept: 'Sales',      location: 'Orlando' },
    { name: 'Ana Reyes',     dept: 'Procurement', location: 'Miami' },
]

const DEPARTMENTS = ['Operations', 'Sales', 'Procurement', 'Finance', 'IT', 'HR']
const LOCATIONS   = ['Tampa', 'Orlando', 'Miami', 'Jacksonville', 'Fort Lauderdale']

const INITIAL_CATEGORIES = ['Fuel', 'Meals', 'Travel', 'Parking', 'Office', 'Client Entertainment', 'Training', 'Equipment']

export default function AdminScene({ onSave }: { onSave?: () => void }) {
    const [managers, setManagers]     = useState(INITIAL_MANAGERS)
    const [categories, setCategories] = useState(INITIAL_CATEGORIES)
    const [showAddMgr, setShowAddMgr] = useState(false)
    const [newMgr, setNewMgr]         = useState({ name: '', dept: '', location: '' })
    const [newCat, setNewCat]         = useState('')
    const [saved, setSaved]           = useState(false)

    const addManager = () => {
        if (!newMgr.name.trim()) return
        setManagers(prev => [...prev, { name: newMgr.name, dept: newMgr.dept || 'Operations', location: newMgr.location || 'Tampa' }])
        setNewMgr({ name: '', dept: '', location: '' })
        setShowAddMgr(false)
    }

    const removeManager = (name: string) => setManagers(prev => prev.filter(m => m.name !== name))

    const addCategory = () => {
        if (!newCat.trim()) return
        setCategories(prev => [...prev, newCat.trim()])
        setNewCat('')
    }

    const removeCategory = (cat: string) => setCategories(prev => prev.filter(c => c !== cat))

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => { setSaved(false); onSave?.() }, 1200)
    }

    return (
        <div className="max-w-lg mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-foreground">Admin · Letza Bombard</p>
                    <p className="text-xs text-muted-foreground">Self-service · No IT ticket required · Changes apply immediately</p>
                </div>
            </div>

            {/* Section 1 — Manager List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-foreground">Approval Managers</p>
                        <p className="text-[10px] text-muted-foreground">Feeds the submission dropdown — always current</p>
                    </div>
                    <button
                        onClick={() => setShowAddMgr(!showAddMgr)}
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
                                <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                                    <Pencil className="h-3 w-3" />
                                </button>
                                <button onClick={() => removeManager(m.name)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add manager form */}
                {showAddMgr && (
                    <div className="px-4 py-3 border-t border-border bg-muted/30 space-y-2 animate-in fade-in duration-200">
                        <input
                            value={newMgr.name}
                            onChange={e => setNewMgr(p => ({ ...p, name: e.target.value }))}
                            placeholder="Full name"
                            className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                        />
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

            {/* Section 2 — Categories */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">Expense Categories</p>
                    <p className="text-[10px] text-muted-foreground">Feed the GL rules engine — changes apply to new submissions</p>
                </div>
                <div className="px-4 py-3 flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <span key={cat} className="group inline-flex items-center gap-1 text-xs bg-muted border border-border text-foreground px-2.5 py-1 rounded-full">
                            {cat}
                            <button onClick={() => removeCategory(cat)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
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
                            <button onClick={addCategory} className="text-ai">
                                <Plus className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 3 — Role Hierarchy */}
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
                        Changes applied
                    </>
                ) : (
                    'Save all changes →'
                )}
            </button>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
