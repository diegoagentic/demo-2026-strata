import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Trash2, X } from 'lucide-react'
import {
    STAGES,
    VERTICALS,
    PRIMARY_MFRS,
    ANCILLARY_SUGGEST,
    PARTICIPANT_TYPES,
    CONTRACT_VEHICLES,
    GPOS,
    PERMIT_STATUS,
    fmtFull,
    totalRevenue,
} from '../../config/profiles/crm-data'
import type { Opportunity } from '../../config/profiles/crm-data'

interface Props {
    isOpen: boolean
    initial: Opportunity | null
    onSave: (opp: Opportunity) => void
    onClose: () => void
}

const labelCls = 'block text-xs font-semibold text-muted-foreground mb-1.5'
const inputCls =
    'h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
const inputErrCls = 'border-destructive focus:border-destructive focus:ring-destructive/20'
const sectLabelCls = 'text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-3'
const errMsgCls = 'text-[11px] text-destructive mt-1 font-medium'
const sectionDivider = 'border-t border-border pt-5 mt-5'

// New / Edit Opportunity modal · vertical-specific fields (Government / Healthcare /
// Architectural) · probability slider · manufacturers · revenue split · deal team rows.
// Portado del standalone con DS tokens.
export default function OppFormModal({ isOpen, initial, onSave, onClose }: Props) {
    const [f, setF] = useState<Opportunity | null>(initial)
    const [ancInput, setAncInput] = useState('')
    const [errs, setErrs] = useState<Record<string, string>>({})

    // Re-sync when initial cambia · cuando se abre con prefill desde Import o Edit
    if (f !== initial && initial !== null && (!f || f.id !== initial.id)) {
        setF(initial)
        setErrs({})
        setAncInput('')
    }

    if (!f) return null

    const isEdit = !!initial?.id
    const set = <K extends keyof Opportunity>(k: K, v: Opportunity[K]) => setF(p => (p ? { ...p, [k]: v } : p))
    const setRev = (k: keyof Opportunity['revenue'], v: string) =>
        setF(p => (p ? { ...p, revenue: { ...p.revenue, [k]: Number(v) || 0 } } : p))
    const total = totalRevenue(f.revenue)

    const addAnc = (m: string) => {
        const v = m.trim()
        if (v && !f.ancillaryMfrs.includes(v)) set('ancillaryMfrs', [...f.ancillaryMfrs, v])
        setAncInput('')
    }
    const removeAnc = (m: string) => set('ancillaryMfrs', f.ancillaryMfrs.filter(x => x !== m))

    const setPart = (i: number, k: 'name' | 'role', v: string) =>
        set('participants', f.participants.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)))
    const addPartRow = () => set('participants', [...f.participants, { name: '', role: PARTICIPANT_TYPES[0] }])
    const removePartRow = (i: number) => set('participants', f.participants.filter((_, idx) => idx !== i))

    const submit = () => {
        const e: Record<string, string> = {}
        if (!f.name.trim()) e.name = 'Required'
        if (!f.company.trim()) e.company = 'Required'
        if (!f.vertical) e.vertical = 'Select a vertical'
        if (f.vertical === 'Government' && !f.gsaContract.trim()) e.gsaContract = 'Required for Government'
        setErrs(e)
        if (Object.keys(e).length) return
        onSave({ ...f, participants: f.participants.filter(p => p.name.trim()) })
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-start justify-center overflow-y-auto p-4 sm:p-10">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                                <div>
                                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                                        {isEdit ? initial?.id : 'New record'}
                                    </div>
                                    <Dialog.Title className="text-lg font-bold text-foreground">
                                        {isEdit ? 'Edit Opportunity' : 'New Opportunity'}
                                    </Dialog.Title>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
                                {/* Basic fields */}
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className={labelCls}>
                                            Opportunity name <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            className={`${inputCls} ${errs.name ? inputErrCls : ''}`}
                                            value={f.name}
                                            onChange={e => set('name', e.target.value)}
                                            placeholder="e.g. Acme HQ Relocation"
                                        />
                                        {errs.name && <div className={errMsgCls}>{errs.name}</div>}
                                    </div>
                                    <div>
                                        <label className={labelCls}>
                                            Company <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            className={`${inputCls} ${errs.company ? inputErrCls : ''}`}
                                            value={f.company}
                                            onChange={e => set('company', e.target.value)}
                                            placeholder="End-user / client"
                                        />
                                        {errs.company && <div className={errMsgCls}>{errs.company}</div>}
                                    </div>
                                    <div>
                                        <label className={labelCls}>
                                            Vertical <span className="text-destructive">*</span>
                                        </label>
                                        <select
                                            className={`${inputCls} cursor-pointer ${errs.vertical ? inputErrCls : ''}`}
                                            value={f.vertical}
                                            onChange={e => set('vertical', e.target.value as Opportunity['vertical'])}
                                        >
                                            <option value="">Select…</option>
                                            {VERTICALS.map(v => (
                                                <option key={v} value={v}>
                                                    {v}
                                                </option>
                                            ))}
                                        </select>
                                        {errs.vertical && <div className={errMsgCls}>{errs.vertical}</div>}
                                    </div>
                                    <div>
                                        <label className={labelCls}>Stage</label>
                                        <select
                                            className={`${inputCls} cursor-pointer`}
                                            value={f.stage}
                                            onChange={e => set('stage', e.target.value as Opportunity['stage'])}
                                        >
                                            {STAGES.map(s => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Target close date</label>
                                        <input
                                            type="date"
                                            className={inputCls}
                                            value={f.closeDate}
                                            onChange={e => set('closeDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelCls}>
                                            Probability — {f.probability}%{' '}
                                            <span className={f.probability >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                                                {f.probability >= 50 ? '· counts toward forecast' : '· upside (excluded)'}
                                            </span>
                                        </label>
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={f.probability}
                                            onChange={e => set('probability', Number(e.target.value))}
                                            className={`w-full ${f.probability >= 50 ? 'accent-emerald-500' : 'accent-amber-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Vertical-specific */}
                                {(['Government', 'Healthcare', 'Architectural Interiors'] as const).includes(f.vertical as 'Government' | 'Healthcare' | 'Architectural Interiors') && (
                                    <div className={sectionDivider}>
                                        <div className={sectLabelCls}>Vertical-specific fields · {f.vertical}</div>
                                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                            {f.vertical === 'Government' && (
                                                <>
                                                    <div>
                                                        <label className={labelCls}>Contract vehicle</label>
                                                        <select
                                                            className={`${inputCls} cursor-pointer`}
                                                            value={f.contractVehicle}
                                                            onChange={e => set('contractVehicle', e.target.value)}
                                                        >
                                                            <option value="">Select…</option>
                                                            {CONTRACT_VEHICLES.map(c => (
                                                                <option key={c} value={c}>
                                                                    {c}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>
                                                            GSA / contract number <span className="text-destructive">*</span>
                                                        </label>
                                                        <input
                                                            className={`${inputCls} ${errs.gsaContract ? inputErrCls : ''}`}
                                                            value={f.gsaContract}
                                                            onChange={e => set('gsaContract', e.target.value)}
                                                            placeholder="GS-27F-00000"
                                                        />
                                                        {errs.gsaContract && <div className={errMsgCls}>{errs.gsaContract}</div>}
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label className={labelCls}>Pricing tier</label>
                                                        <input
                                                            className={inputCls}
                                                            value={f.pricingTier}
                                                            onChange={e => set('pricingTier', e.target.value)}
                                                            placeholder="e.g. DC2 (price-protected)"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            {f.vertical === 'Healthcare' && (
                                                <>
                                                    <div>
                                                        <label className={labelCls}>GPO affiliation</label>
                                                        <select
                                                            className={`${inputCls} cursor-pointer`}
                                                            value={f.gpo}
                                                            onChange={e => set('gpo', e.target.value)}
                                                        >
                                                            <option value="">Select…</option>
                                                            {GPOS.map(g => (
                                                                <option key={g} value={g}>
                                                                    {g}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>Phased install schedule</label>
                                                        <input
                                                            className={inputCls}
                                                            value={f.phasedSchedule}
                                                            onChange={e => set('phasedSchedule', e.target.value)}
                                                            placeholder="e.g. 3 phases over 6 mo"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            {f.vertical === 'Architectural Interiors' && (
                                                <>
                                                    <div>
                                                        <label className={labelCls}>General contractor</label>
                                                        <input
                                                            className={inputCls}
                                                            value={f.generalContractor}
                                                            onChange={e => set('generalContractor', e.target.value)}
                                                            placeholder="GC of record"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>Permitting status</label>
                                                        <select
                                                            className={`${inputCls} cursor-pointer`}
                                                            value={f.permitStatus}
                                                            onChange={e => set('permitStatus', e.target.value)}
                                                        >
                                                            <option value="">Select…</option>
                                                            {PERMIT_STATUS.map(p => (
                                                                <option key={p} value={p}>
                                                                    {p}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-foreground cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={f.prevailingWage}
                                                            onChange={e => set('prevailingWage', e.target.checked)}
                                                            className="h-4 w-4 accent-primary"
                                                        />
                                                        Union / prevailing-wage labor required
                                                    </label>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Manufacturers */}
                                <div className={sectionDivider}>
                                    <div className={sectLabelCls}>Manufacturers</div>
                                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                        <div>
                                            <label className={labelCls}>Primary manufacturer</label>
                                            <select
                                                className={`${inputCls} cursor-pointer`}
                                                value={f.primaryMfr}
                                                onChange={e => set('primaryMfr', e.target.value)}
                                            >
                                                <option value="">Select…</option>
                                                {PRIMARY_MFRS.map(m => (
                                                    <option key={m} value={m}>
                                                        {m}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Add ancillary / arch line</label>
                                            <input
                                                className={inputCls}
                                                value={ancInput}
                                                onChange={e => setAncInput(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        addAnc(ancInput)
                                                    }
                                                }}
                                                placeholder="Type and press Enter"
                                            />
                                        </div>
                                    </div>
                                    {f.ancillaryMfrs.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {f.ancillaryMfrs.map(m => (
                                                <span
                                                    key={m}
                                                    className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400"
                                                >
                                                    {m}
                                                    <button type="button" onClick={() => removeAnc(m)} aria-label={`Remove ${m}`}>
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {ANCILLARY_SUGGEST.filter(s => !f.ancillaryMfrs.includes(s))
                                            .slice(0, 6)
                                            .map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => addAnc(s)}
                                                    className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                                                >
                                                    + {s}
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                {/* Revenue split */}
                                <div className={sectionDivider}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                                            Revenue split
                                        </span>
                                        <span className="text-sm font-bold text-foreground tabular-nums">Total {fmtFull(total)}</span>
                                    </div>
                                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                        <RevInput label="Furniture / product" v={f.revenue.furniture} onChange={v => setRev('furniture', v)} />
                                        <RevInput label="Architectural interiors" v={f.revenue.arch} onChange={v => setRev('arch', v)} />
                                        <RevInput
                                            label="Services — install / logistics"
                                            v={f.revenue.install}
                                            onChange={v => setRev('install', v)}
                                        />
                                        <RevInput label="Services — professional" v={f.revenue.prof} onChange={v => setRev('prof', v)} />
                                    </div>
                                </div>

                                {/* Deal team */}
                                <div className={sectionDivider}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                                            Deal team & stakeholders
                                        </span>
                                        <button
                                            type="button"
                                            onClick={addPartRow}
                                            className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                                        >
                                            + Add participant
                                        </button>
                                    </div>
                                    {f.participants.length === 0 && (
                                        <div className="text-sm text-muted-foreground italic">
                                            No participants yet — add the end-user, A&amp;D firm, GC, and others.
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2">
                                        {f.participants.map((p, i) => (
                                            <div key={i} className="flex gap-2">
                                                <select
                                                    className={`${inputCls} cursor-pointer flex-shrink-0`}
                                                    style={{ flex: '0 0 190px' }}
                                                    value={p.role}
                                                    onChange={e => setPart(i, 'role', e.target.value)}
                                                >
                                                    {PARTICIPANT_TYPES.map(t => (
                                                        <option key={t} value={t}>
                                                            {t}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    className={inputCls}
                                                    value={p.name}
                                                    onChange={e => setPart(i, 'name', e.target.value)}
                                                    placeholder="Company or contact"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePartRow(i)}
                                                    aria-label="Remove participant"
                                                    className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-6 py-3">
                                <span className="text-xs text-muted-foreground">
                                    {f.probability >= 50
                                        ? 'Will appear in the qualified forecast'
                                        : 'Upside — excluded from forecast until ≥ 50%'}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={submit}
                                        className="rounded-lg bg-foreground px-3.5 py-2 text-xs font-bold text-background transition-colors hover:bg-foreground/90"
                                    >
                                        {isEdit ? 'Save changes' : 'Create opportunity'}
                                    </button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}

function RevInput({ label, v, onChange }: { label: string; v: number; onChange: (v: string) => void }) {
    return (
        <div>
            <label className={labelCls}>{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">$</span>
                <input
                    type="number"
                    min={0}
                    className={`${inputCls} pl-7`}
                    value={v || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder="0"
                />
            </div>
        </div>
    )
}

