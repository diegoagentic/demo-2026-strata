import { useState, type ComponentType } from 'react'
import { BarChart3, Briefcase, Check, Inbox, KanbanSquare } from 'lucide-react'
import { useTenant } from './TenantContext'
import {
    SEED_OPPS,
    SEED_INTAKE,
    blankOpp,
    initials,
    nextOppId,
    totalRevenue,
    verticalColor,
} from './config/profiles/crm-data'
import type { Opportunity, IntakeCardData } from './config/profiles/crm-data'
import PipelineView from './components/crm/PipelineView'
import ForecastDashboard from './components/crm/ForecastDashboard'
import IntakeBoard from './components/crm/IntakeBoard'
import OpportunityDetail from './components/crm/OpportunityDetail'
import ImportWithAIModal from './components/crm/ImportWithAIModal'
import OppFormModal from './components/crm/OppFormModal'

type View = 'pipeline' | 'forecast' | 'intake' | 'detail'

interface PageProps {
    onLogout: () => void
    onNavigateToDetail: () => void
    onNavigateToWorkspace: () => void
    onNavigate: (page: string) => void
    /** View interno controlado desde el Navbar global vía customNavigation. */
    view: View
    setView: (v: View) => void
}

interface ViewHeading {
    crumb: string
    title: string
    Icon: ComponentType<{ className?: string; strokeWidth?: number }>
}

// Strata CRM · port del standalone (Downloads/strata crm/strata-crm-standalone) ·
// 4 vistas (Pipeline / Forecast / Design Intake / Opportunity Detail).
// View controlado desde App.tsx · pills viven en el Navbar global vía
// customNavigation con pages 'crm:*' (Diego ask · evitar navbar duplicada).
// Modales · Import with AI (drag&drop + mock extraction) · OppFormModal.
export default function CRM({ view, setView }: PageProps) {
    const { currentTenant } = useTenant()
    const [opps, setOpps] = useState<Opportunity[]>(SEED_OPPS)
    const [intake, setIntake] = useState<IntakeCardData[]>(SEED_INTAKE)
    const [selId, setSelId] = useState<string | null>(null)
    const [toast, setToast] = useState<string | null>(null)
    const [editing, setEditing] = useState<Opportunity | null>(null)
    const [importing, setImporting] = useState(false)

    const selected = opps.find(o => o.id === selId) ?? null

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3200)
    }

    const updateOpp = (u: Opportunity) => setOpps(prev => prev.map(o => (o.id === u.id ? u : o)))

    const saveOpp = (data: Opportunity) => {
        const color = verticalColor(data.vertical)
        if (data.id) {
            setOpps(prev => prev.map(o => (o.id === data.id ? { ...data, color } : o)))
            showToast(`${data.id} updated`)
        } else {
            const id = nextOppId(opps)
            setOpps(prev => [...prev, { ...data, id, color }])
            setSelId(id)
            setView('detail')
            showToast(`${id} created`)
        }
        setEditing(null)
    }

    const requestIntake = (opp: Opportunity) => {
        if (!opp.id) return
        const card: IntakeCardData = {
            code: opp.id,
            badge: initials(opp.company),
            color: opp.color || 'blue',
            org: `${opp.company} · ${opp.name.split('—').pop()?.trim() ?? opp.name}`,
            meta: `Handoff from Sales · ${opp.primaryMfr} · awaiting designer assignment`,
            assignee: 'Unassigned',
            amount: totalRevenue(opp.revenue),
            column: 'Intake',
        }
        setIntake(prev => (prev.some(c => c.code === opp.id) ? prev : [card, ...prev]))
        setOpps(prev => prev.map(o => (o.id === opp.id ? { ...o, stage: 'Quote' } : o)))
        setView('intake')
        showToast(`${opp.id} handed off to Strata · Design Intake`)
    }

    const HEADING: Record<View, ViewHeading> = {
        forecast: { crumb: `${currentTenant.toUpperCase()} · SALES CRM`, title: 'Forecast', Icon: BarChart3 },
        pipeline: { crumb: `${currentTenant.toUpperCase()} · SALES CRM`, title: 'Sales Pipeline', Icon: KanbanSquare },
        intake: { crumb: `${currentTenant.toUpperCase()} · Strata for ${currentTenant}`, title: 'Design Intake', Icon: Inbox },
        detail: {
            crumb: `${currentTenant.toUpperCase()} · SALES CRM · ${selected?.id ?? ''}`,
            title: selected?.name ?? '',
            Icon: Briefcase,
        },
    }
    const h = HEADING[view]

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-10">
            {/* Navbar global vive en App.tsx · las pills (Pipeline/Forecast/Design Intake)
                se inyectan vía customNavigation en getSimulationConfig() · click llega a
                handleNavigate('crm:xxx') → setCrmView. */}
            <div className="pt-24 px-6 max-w-7xl mx-auto">
                {/* Page heading · icon tray + crumb + title + rule */}
                <div className="flex items-center gap-4 mb-5">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-foreground">
                        <h.Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.08em] font-bold text-muted-foreground mb-1">
                            {h.crumb}
                        </div>
                        <h1 className="text-3xl font-brand font-bold tracking-tight text-foreground leading-none">
                            {h.title}
                        </h1>
                    </div>
                </div>
                <hr className="border-t border-border mb-6" />

                {/* Active view */}
                {view === 'forecast' && <ForecastDashboard opps={opps} />}
                {view === 'pipeline' && (
                    <PipelineView
                        opps={opps}
                        onSelect={id => {
                            setSelId(id)
                            setView('detail')
                        }}
                        onNew={() => setEditing(blankOpp())}
                        onImport={() => setImporting(true)}
                    />
                )}
                {view === 'intake' && <IntakeBoard intake={intake} />}
                {view === 'detail' && selected && (
                    <OpportunityDetail
                        opp={selected}
                        onBack={() => {
                            setSelId(null)
                            setView('pipeline')
                        }}
                        onUpdate={updateOpp}
                        onRequestIntake={requestIntake}
                        onEdit={() => setEditing(selected)}
                    />
                )}
            </div>

            {/* Modales · Import + OppForm */}
            <ImportWithAIModal
                isOpen={importing}
                onClose={() => setImporting(false)}
                onCreate={prefill => {
                    setImporting(false)
                    setEditing(prefill)
                }}
            />
            <OppFormModal
                isOpen={!!editing}
                initial={editing}
                onSave={saveOpp}
                onClose={() => setEditing(null)}
            />

            {/* Demo button removido (Diego ask · 2026-06-30) · el dropdown del
                Navbar global ya permite cambiar entre demos · no necesitamos
                FAB redundante. */}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2.5 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background shadow-2xl animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-300 text-foreground">
                        <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {toast}
                </div>
            )}
        </div>
    )
}
