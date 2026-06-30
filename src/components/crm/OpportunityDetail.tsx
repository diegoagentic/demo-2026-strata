import { useState } from 'react'
import { ArrowLeft, Building2, Briefcase, Inbox, Paperclip, Pencil, Plus, Sparkles, Trash2, Users } from 'lucide-react'
import { STAGES, PARTICIPANT_TYPES, fmtFull, totalRevenue } from '../../config/profiles/crm-data'
import type { Opportunity } from '../../config/profiles/crm-data'
import StrataAIDossier from './StrataAIDossier'

interface Props {
    opp: Opportunity
    onBack: () => void
    onUpdate: (opp: Opportunity) => void
    onRequestIntake: (opp: Opportunity) => void
    onEdit: () => void
}

export default function OpportunityDetail({ opp, onBack, onUpdate, onRequestIntake, onEdit }: Props) {
    const [partType, setPartType] = useState<string>(PARTICIPANT_TYPES[0])
    const [partName, setPartName] = useState('')
    const total = totalRevenue(opp.revenue)

    const addParticipant = () => {
        if (!partName.trim()) return
        onUpdate({ ...opp, participants: [...opp.participants, { name: partName.trim(), role: partType }] })
        setPartName('')
    }
    const removeParticipant = (i: number) =>
        onUpdate({ ...opp, participants: opp.participants.filter((_, idx) => idx !== i) })

    return (
        <div className="flex flex-col gap-5">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Pipeline
                </button>
                <div className="flex items-center gap-2">
                    <select
                        value={opp.stage}
                        onChange={e => onUpdate({ ...opp, stage: e.target.value as Opportunity['stage'] })}
                        className="h-9 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground cursor-pointer focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {STAGES.map(s => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                        <Pencil className="h-3.5 w-3.5" /> Edit detail
                    </button>
                    <button
                        type="button"
                        onClick={() => onRequestIntake(opp)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
                    >
                        <Inbox className="h-4 w-4" /> Request Design Intake
                    </button>
                </div>
            </div>

            {/* Header card */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{opp.id}</span>
                            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-muted text-muted-foreground">
                                {opp.stage}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{opp.name}</h1>
                        <div className="flex items-center gap-5 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Building2 className="h-4 w-4" /> {opp.company}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Briefcase className="h-4 w-4" /> {opp.vertical}
                            </span>
                        </div>
                        {opp.sources.length > 0 && (
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                <span className="text-[11px] uppercase tracking-wider font-bold text-violet-700 dark:text-violet-400 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> Imported from
                                </span>
                                {opp.sources.map(s => (
                                    <span
                                        key={s}
                                        className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-700 dark:text-violet-400"
                                    >
                                        <Paperclip className="h-3 w-3" /> {s}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-foreground tabular-nums">{fmtFull(total)}</div>
                        <div className="text-sm text-muted-foreground mt-1">Est. total revenue</div>
                    </div>
                </div>
            </section>

            {/* Two-col layout */}
            <div className="grid gap-5 grid-cols-1 lg:grid-cols-3">
                <div className="flex flex-col gap-5 lg:col-span-2 min-w-0">
                    <StrataAIDossier opp={opp} onGenerated={() => onUpdate({ ...opp, aiGenerated: true })} />

                    {/* Project Scope & Manufacturers */}
                    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="text-base font-bold text-foreground mb-4">Project Scope & Manufacturers</h2>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                            {opp.vertical === 'Government' && (
                                <div className="sm:col-span-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                                    <div className="text-[11px] uppercase tracking-wider font-bold text-blue-700 dark:text-blue-400">
                                        Vertical logic · Government required field
                                    </div>
                                    <div className="text-sm font-semibold text-foreground mt-1">
                                        GSA Contract Number: {opp.gsaContract || 'Pending'}
                                    </div>
                                </div>
                            )}
                            {opp.vertical === 'Healthcare' && (
                                <div className="sm:col-span-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                                    <div className="text-[11px] uppercase tracking-wider font-bold text-red-700 dark:text-red-400">
                                        Vertical logic · Healthcare required
                                    </div>
                                    <div className="text-sm text-foreground mt-1">
                                        GPO: {opp.gpo || 'Pending'}
                                        {opp.phasedSchedule ? ` · ${opp.phasedSchedule}` : ''}
                                    </div>
                                </div>
                            )}
                            {opp.vertical === 'Architectural Interiors' && (
                                <div className="sm:col-span-2 rounded-lg border border-violet-500/30 bg-violet-500/10 p-3">
                                    <div className="text-[11px] uppercase tracking-wider font-bold text-violet-700 dark:text-violet-400">
                                        Vertical logic · Architectural Interiors required
                                    </div>
                                    <div className="text-sm text-foreground mt-1">
                                        GC: {opp.generalContractor || 'Pending'} · Permit: {opp.permitStatus || 'Not started'}
                                        {opp.prevailingWage ? ' · Prevailing wage' : ''}
                                    </div>
                                </div>
                            )}

                            <Field label="Primary Manufacturer">
                                <div className="text-lg font-bold text-foreground border-b border-border pb-2">{opp.primaryMfr}</div>
                            </Field>
                            <Field label="Ancillary Tagging">
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {opp.ancillaryMfrs.length ? (
                                        opp.ancillaryMfrs.map(m => (
                                            <span key={m} className="text-xs rounded-md border border-border bg-muted px-2 py-1 text-foreground">
                                                {m}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">None tagged yet</span>
                                    )}
                                </div>
                            </Field>
                            <Field label="Target Close Date">
                                <div className="text-sm font-medium text-foreground">
                                    {opp.closeDate
                                        ? new Date(opp.closeDate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })
                                        : '—'}
                                </div>
                            </Field>
                            <Field label="Probability (50% rule)">
                                <div className="flex items-center gap-3 pt-1">
                                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${opp.probability >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                            style={{ width: `${opp.probability}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-foreground tabular-nums">{opp.probability}%</span>
                                </div>
                            </Field>
                        </div>
                    </section>
                </div>

                <div className="flex flex-col gap-5 min-w-0">
                    {/* Revenue Breakdown */}
                    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="text-base font-bold text-foreground mb-4 pb-3 border-b border-border">
                            Revenue Breakdown
                        </h2>
                        <div className="flex flex-col gap-3">
                            <RevRow label="Furniture / product" v={opp.revenue.furniture} />
                            <RevRow label="Architectural interiors" v={opp.revenue.arch} />
                            <RevRow label="Services — install" v={opp.revenue.install} />
                            <RevRow label="Services — professional" v={opp.revenue.prof} />
                            <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
                                <span className="font-bold text-foreground">Total</span>
                                <span className="text-lg font-bold text-primary tabular-nums">{fmtFull(total)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Deal Team */}
                    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                            <h2 className="text-base font-bold text-foreground">Deal Team & Network</h2>
                            <span className="text-xs text-muted-foreground font-semibold">{opp.participants.length} mapped</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {opp.participants.length ? (
                                opp.participants.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-lg p-2">
                                        <div className="h-8 w-8 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-foreground truncate">{p.name}</div>
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                                                {p.role}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeParticipant(i)}
                                            aria-label={`Remove ${p.name}`}
                                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-muted-foreground italic py-1">
                                    No external participants mapped yet.
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
                            <select
                                value={partType}
                                onChange={e => setPartType(e.target.value)}
                                className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {PARTICIPANT_TYPES.map(t => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <input
                                    value={partName}
                                    onChange={e => setPartName(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') addParticipant()
                                    }}
                                    placeholder="Company or contact name"
                                    className="flex-1 h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                    type="button"
                                    onClick={addParticipant}
                                    className="inline-flex items-center justify-center rounded-lg bg-foreground px-3 text-background transition-colors hover:bg-foreground/90"
                                    aria-label="Add participant"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
            {children}
        </div>
    )
}

function RevRow({ label, v }: { label: string; v: number }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-bold text-foreground tabular-nums">{fmtFull(v)}</span>
        </div>
    )
}
