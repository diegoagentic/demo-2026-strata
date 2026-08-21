import React from 'react';
import { useDemo } from '../../context/DemoContext';
import { useTheme } from 'strata-design-system';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import {
    CheckCircle2,
    Circle,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Check,
    Play,
    Pause,
    Loader2,
    Star,
} from 'lucide-react';

// Hero moments — emotional peak beats per profile. Surfaced in the sidebar
// with a star marker so the audience knows which beats are the demo's
// crescendo and the presenter doesn't accidentally rush past them.
//
// Apr 27: m4.3 (Spec Check finding) was a hero, but Design AI was removed
// from the active tour (Matt: "primary and only necessary is accounting").
// MBIDesignPage stays navigable via tab so anyone can still see that scene
// — but it's not in the guided tour so no sidebar marker.
const HERO_STEP_IDS = new Set<string>([
    'm2.2',  // MBI · HealthTrust GPO 3% rebate modal — the most interactive AP scene
]);
import { useDemoProfile } from '../../context/useDemoProfile';
import { WORKSPACES_DATA_THREADS } from '../../config/profiles/workspaces';
import { useOfficeworksVertical, writeVertical } from '../officeworks/shared/verticalSignal';
// F80.2 · Projex switcher rewrite · 2-tab segmented + sub-nav. Single
// source of truth for the experience mapping lives in the profile module.
// F82.2 · imports adicionales para el sidebar playlist (moments tiles +
// tagline + value chip compact) que reemplaza el linear step list para
// Projex only.
import {
    PROJEX_EXPERIENCE_GROUPS,
    PROJEX_PATH_LANDINGS,
    experienceOf,
    firstFlowOf,
    type ProjexExperience,
    type ProjexFlowId,
} from '../../config/profiles/projex';

// Apps belonging to Expert Hub — System steps in these show as "Expert"
const EXPERT_HUB_APPS = ['expert-hub', 'ack-detail', 'transactions', 'mac', 'quote-detail'];

function resolveRoleLabel(role: string, app: string, profileId?: string): string {
    if (role === 'System') {
        // Continua & Dupler: all System steps are AI processing within Expert context
        if (profileId === 'continua' || profileId === 'dupler') return 'Expert';
        return EXPERT_HUB_APPS.includes(app) ? 'Expert' : 'Dealer';
    }
    return role;
}

// Data threads — mini-summaries for completed steps, keyed by profile ID
const DATA_THREADS_BY_PROFILE: Record<string, Record<string, string>> = {
    continua: {
        '1.1': 'Health score 87% — 3 alerts',
        '1.2': '12 items cataloged for reuse',
        '1.3': 'Price verified — $110K savings',
        '1.4': '4 locations synced',
        '1.5': '4 RMA, 4 convert-to-purchase',
        '1.6': 'Report approved — all changes confirmed',
        '3.1': 'Project request submitted — $3.2M, 8 floors',
        '3.2': '3 POs generated, $3.2M',
        '3.3': 'PO-to-ACK conversion verified',
        '3.4': 'Approval chain completed — 3/3 approved',
        '3.5': 'QC passed — 1,320 items received',
        '3.6': 'Installation dispatched — 8 floors',
        '2.1': 'REQ-FM-2026-018 — safety flag',
        '2.2': 'Warranty + consignment + relocation plan',
        '2.3': 'Dispatch approved — ProInstall tomorrow',
        '2.4': 'Assets relocated to Office 3-216',
        '2.5': 'Resolved — $0 cost, 26h total',
        '4.1': '194 tons diverted, A- rating',
        '4.2': 'Portal published — 82% progress',
        '4.3': '$11,550 reconciled',
        '4.4': '92% satisfaction, AV flagged',
    },
    dupler: {
        'd1.1': 'Gap detected — vendor PDF imported, products extracted and mapped',
        'd1.2': 'Flagged items resolved — AI suggestions and specialist review',
        'd1.3': 'PMX specification assembled — sent to SC, catalog synchronized',
        'd1.4': 'Upcharges validated — discounts applied by SC',
        'd1.5': 'Priced SIF generated — synchronized and sent for approval',
        'd2.1': 'Warehouse scanned — aging items flagged, moves recommended',
        'd2.2': 'Items received — exceptions flagged and assessed',
        'd2.3': 'Prices verified — margin alerts reviewed',
        'd2.4': 'Warehouses synced — routes optimized',
        'd2.5': 'Shipments tracked — delays predicted, freight audited',
        'd2.6': 'Claims processed — credits and warranties reviewed',
        'd2.7': 'Dealer approved — dispatch scheduled',
        'd3.1': 'All systems connected — inventory health scored',
        'd3.2': 'Updates verified and propagated — metrics configured',
        'd3.3': 'Report assembled — previewed and sent to team',
        'd3.4': 'Report reviewed — client portal live',
    },
    wrg: {
        'w1.1': 'Client request received — attachments identified',
        'w1.2': 'Mismatches found — flagged items sent to designer',
        'w1.3': 'Designer reviewed fields — corrections submitted',
        'w1.4': 'Project registered — expert assigned',
        'w1.5': 'Intake approved — estimation phase authorized',
        'w2.1': '24 items costed — 5 flagged, OFS Serpentine escalated to designer',
        'w2.2': '5 modules validated — verification report sent to expert',
        'w2.3': 'All adjustments resolved — proposal assembled ($202,138)',
        'w2.4': 'Proposal approved and released to client — 92% time saved',
    },
    workspaces: WORKSPACES_DATA_THREADS,
    bfi: {
        'a1.1':  'DOE-2847 flagged · CPR discrepancy detected',
        'a1.2':  'SIF corrected · 1 price adjusted · discount calculated',
        'a1.2b': 'Order Q-2026-0089 confirmed · Robert Chen acknowledged',
        'a1.2c': 'PO + labor captured · CORE entry confirmed · EDI transmitted',
        'a1.2d': 'Proposal sent to DOE · WIG report received · packing list ready for AI',
        'a1.2e': 'Lena notified Lauren · carton #34 (M-ARM) missing · claim filed with Herman Miller',
        'a1.2f': 'Claim resolved · HM confirmed replacement · Walter notified · work order cleared',
        'a1.3':  'CPR approved · −$2,340 applied · relayed to Nancy Bos',
        'a1.4':  'Agency fee verified · $41,040 match confirmed',
        'r1.2':  'WIG report received · packing list ready for AI',
        'r1.3':  'Carton #34 missing · 1 discrepancy in 10 seconds',
        'r1.4':  'Andy notified · Omni claim #OM-2026-0412 filed',
        'r1.5':  '34/35 confirmed in CORE · Line 24 excluded',
        'r1.6':  'Walter notified · crew scheduling initiated',
    },
    leland: {
        'l0.1': 'Inbox set · the manual baseline',
        'l1.1': 'PO captured · ready for the next check',
        'l1.2': 'Matching quote found',
        'l1.3': 'Price difference caught · sent for review',
        'l1.4': 'Reviewer approved · Strata resumes',
        'l1.5': 'Customer · materials · configuration validated',
        'l1.6': 'Sales order built',
        'l1.7': 'Comments · metadata · rebate applied',
        'l1.8': 'Order logged · ticket closed',
        'l2.1': 'One catch · meaningful annual savings',
    },
};

function getStepDataThread(stepId: string, profileId: string): string | null {
    const threads = DATA_THREADS_BY_PROFILE[profileId];
    return threads?.[stepId] || null;
}

export default function DemoSidebar() {
    const { currentStepIndex, steps, nextStep, prevStep, goToStep, isDemoActive, setIsDemoActive, isSidebarCollapsed, setIsSidebarCollapsed, isPaused, togglePause } = useDemo();
    const { activeProfile } = useDemoProfile();
    const { theme } = useTheme();
    const STEP_BEHAVIOR = activeProfile.stepBehavior;
    const isContinua = activeProfile.id === 'continua';
    const isDupler = activeProfile.id === 'dupler';
    const isWRG = activeProfile.id === 'wrg';
    const isLeland = activeProfile.id === 'leland';
    const isOfficeworks = activeProfile.id === 'officeworks';
    const isClc = activeProfile.id === 'clc';
    // F74 · Projex demo · 5 flows en paralelo (AP · Vendor onboarding ·
    // Progress billing · Order entry/PO · Electronic ordering & ACK).
    const isProjex = activeProfile.id === 'projex';

    // Officeworks runs three flows in parallel (Spec Check & Design ·
    // Labor & Delivery · Sales). Tab toggle filters the sidebar to one flow.
    type OfficeworksFlow = 'spec-check' | 'labor-delivery' | 'sales';
    const [activeFlow, setActiveFlow] = React.useState<OfficeworksFlow>('spec-check');

    // CLC runs four flows in parallel (Calendar · SharePoint · Intake · Data Lake).
    type ClcFlow = 'calendar' | 'sharepoint' | 'intake' | 'data-lake';
    const [activeClcFlow, setActiveClcFlow] = React.useState<ClcFlow>('calendar');

    // F74 · Projex 5 flows.
    type ProjexFlow = 'projex-ap' | 'projex-vendor-onboarding' | 'projex-billing' | 'projex-order-po' | 'projex-ack';
    const [activeProjexFlow, setActiveProjexFlow] = React.useState<ProjexFlow>('projex-ap');

    // F82.2 · Projex-only · toggle "Show all detail" para revelar los 3
    // secondary steps (skippable per isCoreStep filter) además de los 3
    // core moments · default hidden.
    const [showProjexAllDetail, setShowProjexAllDetail] = React.useState(false);

    // If the user lands directly on a step from a different flow (e.g. resumed
    // session), sync the tab so the active step is visible.
    React.useEffect(() => {
        if (!isOfficeworks) return;
        const curr = steps[currentStepIndex];
        const f = (curr?.flowId ?? 'spec-check') as OfficeworksFlow;
        if (f !== activeFlow) setActiveFlow(f);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOfficeworks, activeProfile.id]);

    React.useEffect(() => {
        if (!isClc) return;
        const curr = steps[currentStepIndex];
        const f = (curr?.flowId ?? 'calendar') as ClcFlow;
        if (f !== activeClcFlow) setActiveClcFlow(f);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isClc, activeProfile.id, currentStepIndex]);

    // F74 · Projex sync flow tab ↔ current step (resume-session friendly).
    React.useEffect(() => {
        if (!isProjex) return;
        const curr = steps[currentStepIndex];
        const f = (curr?.flowId ?? 'projex-ap') as ProjexFlow;
        if (f !== activeProjexFlow) setActiveProjexFlow(f);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isProjex, activeProfile.id, currentStepIndex]);

    // Filtered + original-index-preserving step list for the render loop.
    const displayedSteps = React.useMemo(() => {
        const indexed = steps.map((step, originalIndex) => ({ step, originalIndex }));
        if (isOfficeworks) return indexed.filter(({ step }) => (step.flowId ?? 'spec-check') === activeFlow);
        if (isClc) return indexed.filter(({ step }) => (step.flowId ?? 'calendar') === activeClcFlow);
        if (isProjex) return indexed.filter(({ step }) => (step.flowId ?? 'projex-ap') === activeProjexFlow);
        return indexed;
    }, [steps, isOfficeworks, activeFlow, isClc, activeClcFlow, isProjex, activeProjexFlow]);

    const flowCounts = React.useMemo(() => {
        if (!isOfficeworks) return { specCheck: 0, laborDelivery: 0, sales: 0 };
        let s = 0, l = 0, x = 0;
        for (const step of steps) {
            const f = step.flowId ?? 'spec-check';
            if (f === 'spec-check') s++;
            else if (f === 'labor-delivery') l++;
            else if (f === 'sales') x++;
        }
        return { specCheck: s, laborDelivery: l, sales: x };
    }, [steps, isOfficeworks]);

    const clcFlowCounts = React.useMemo(() => {
        if (!isClc) return { calendar: 0, sharepoint: 0, intake: 0, dataLake: 0 };
        let c = 0, sp = 0, i = 0, dl = 0;
        for (const step of steps) {
            const f = step.flowId ?? 'calendar';
            if (f === 'calendar') c++;
            else if (f === 'sharepoint') sp++;
            else if (f === 'intake') i++;
            else if (f === 'data-lake') dl++;
        }
        return { calendar: c, sharepoint: sp, intake: i, dataLake: dl };
    }, [steps, isClc]);

    // F74 · Projex 5-flow counts.
    const projexFlowCounts = React.useMemo(() => {
        if (!isProjex) return { ap: 0, vendor: 0, billing: 0, orderPo: 0, ack: 0 };
        let ap = 0, vendor = 0, billing = 0, orderPo = 0, ack = 0;
        for (const step of steps) {
            const f = step.flowId ?? 'projex-ap';
            if (f === 'projex-ap') ap++;
            else if (f === 'projex-vendor-onboarding') vendor++;
            else if (f === 'projex-billing') billing++;
            else if (f === 'projex-order-po') orderPo++;
            else if (f === 'projex-ack') ack++;
        }
        return { ap, vendor, billing, orderPo, ack };
    }, [steps, isProjex]);

    // L&D vertical sub-toggle (Furniture vs Walls) · only meaningful inside L&D tab.
    const activeVertical = useOfficeworksVertical()
    const handleVerticalSwitch = (vertical: 'furniture' | 'walls') => {
        if (vertical === activeVertical) return
        writeVertical(vertical)
    }

    const handleFlowSwitch = (flow: OfficeworksFlow) => {
        if (flow === activeFlow) return;
        setActiveFlow(flow);
        // Jump to first step of the target flow so currentStepIndex points to a
        // visible row · avoids stale-active-state when the flow changes.
        const firstIdx = steps.findIndex(s => (s.flowId ?? 'spec-check') === flow);
        if (firstIdx >= 0) goToStep(firstIdx);
    };

    const handleClcFlowSwitch = (flow: ClcFlow) => {
        if (flow === activeClcFlow) return;
        setActiveClcFlow(flow);
        const firstIdx = steps.findIndex(s => (s.flowId ?? 'calendar') === flow);
        if (firstIdx >= 0) goToStep(firstIdx);
    };

    // F74 · Projex flow switch handler · jumps to first step of the target flow.
    const handleProjexFlowSwitch = (flow: ProjexFlow) => {
        if (flow === activeProjexFlow) return;
        setActiveProjexFlow(flow);
        const firstIdx = steps.findIndex(s => (s.flowId ?? 'projex-ap') === flow);
        if (firstIdx >= 0) goToStep(firstIdx);
    };
    const isWorkspaces = activeProfile.id === 'workspaces';
    const isBFI = activeProfile.id === 'bfi';
    const hasDataThreads = isContinua || isDupler || isWRG || isLeland || isWorkspaces || isBFI;

    // Invert: when app is dark → sidebar is light, when app is light → sidebar is dark
    const isDarkSidebar = theme === 'light';

    // Color tokens based on inverted theme
    const c = isDarkSidebar ? {
        // Dark sidebar (app is in light mode)
        bg: 'bg-zinc-950',
        bgHeader: 'bg-zinc-900',
        bgStep: 'bg-zinc-900/60',
        bgStepActive: 'bg-zinc-800',
        bgBadge: 'bg-zinc-800',
        bgBadgeActive: 'bg-zinc-700',
        bgBtn: 'bg-zinc-800',
        bgBtnHover: 'hover:bg-zinc-700',
        bgNext: 'bg-white',
        bgNextHover: 'hover:bg-zinc-200',
        textNext: 'text-zinc-950',
        border: 'border-zinc-800',
        borderSubtle: 'border-zinc-800/50',
        textTitle: 'text-white',
        textBody: 'text-zinc-300',
        textMuted: 'text-zinc-500',
        textDim: 'text-zinc-600',
        textBadge: 'text-zinc-400',
        textBadgeActive: 'text-zinc-200',
        textBtn: 'text-zinc-300',
        iconDone: 'text-emerald-400',
        iconDoneFill: 'fill-emerald-400/10',
        iconActive: 'border-white bg-zinc-900',
        iconActiveDot: 'bg-white',
        iconPending: 'text-zinc-700',
        connectorDone: 'bg-emerald-500/40',
        connectorPending: 'bg-zinc-800',
        activeBorder: 'border-l-white/70',
        dealerBadge: 'border-blue-800/50 bg-blue-900/30 text-blue-400',
        fmBadge: 'border-teal-800/50 bg-teal-900/30 text-teal-400',
        fuBadge: 'border-amber-800/50 bg-amber-900/30 text-amber-400',
        expertBadge: 'border-purple-800/50 bg-purple-900/30 text-purple-400',
        scBadge: 'border-indigo-800/50 bg-indigo-900/30 text-indigo-400',
        estimatorBadge: 'border-teal-800/50 bg-teal-900/30 text-teal-400',
        designerBadge: 'border-sky-800/50 bg-sky-900/30 text-sky-400',
        endUserBadge: 'border-rose-800/50 bg-rose-900/30 text-rose-400',
        employeeBadge: 'border-emerald-800/50 bg-emerald-900/30 text-emerald-400',
        opsMgrBadge: 'border-blue-800/50 bg-blue-900/30 text-blue-400',
        apCoordBadge: 'border-violet-800/50 bg-violet-900/30 text-violet-400',
        cfoBadge: 'border-amber-800/50 bg-amber-900/30 text-amber-400',
        accountLeadBadge: 'border-teal-800/50 bg-teal-900/30 text-teal-400',
        projectMgrBadge: 'border-violet-800/50 bg-violet-900/30 text-violet-400',
        financeArBadge: 'border-amber-800/50 bg-amber-900/30 text-amber-400',
        collapsedBg: 'bg-zinc-950',
        collapsedText: 'text-zinc-400',
        collapsedBorder: 'border-zinc-800/50',
        fab: 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800',
    } : {
        // Light sidebar (app is in dark mode)
        bg: 'bg-white',
        bgHeader: 'bg-zinc-50',
        bgStep: 'bg-zinc-50/60',
        bgStepActive: 'bg-zinc-100',
        bgBadge: 'bg-zinc-100',
        bgBadgeActive: 'bg-zinc-200',
        bgBtn: 'bg-zinc-100',
        bgBtnHover: 'hover:bg-zinc-200',
        bgNext: 'bg-zinc-900',
        bgNextHover: 'hover:bg-zinc-800',
        textNext: 'text-white',
        border: 'border-zinc-200',
        borderSubtle: 'border-zinc-200/80',
        textTitle: 'text-zinc-900',
        textBody: 'text-zinc-700',
        textMuted: 'text-zinc-500',
        textDim: 'text-zinc-400',
        textBadge: 'text-zinc-500',
        textBadgeActive: 'text-zinc-800',
        textBtn: 'text-zinc-700',
        iconDone: 'text-emerald-600',
        iconDoneFill: 'fill-emerald-600/10',
        iconActive: 'border-zinc-900 bg-white',
        iconActiveDot: 'bg-zinc-900',
        iconPending: 'text-zinc-300',
        connectorDone: 'bg-emerald-500/40',
        connectorPending: 'bg-zinc-200',
        activeBorder: 'border-l-zinc-900',
        dealerBadge: 'border-blue-200 bg-blue-50 text-blue-700',
        fmBadge: 'border-teal-200 bg-teal-50 text-teal-700',
        fuBadge: 'border-amber-200 bg-amber-50 text-amber-700',
        expertBadge: 'border-purple-200 bg-purple-50 text-purple-700',
        scBadge: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        estimatorBadge: 'border-teal-200 bg-teal-50 text-teal-700',
        designerBadge: 'border-sky-200 bg-sky-50 text-sky-700',
        endUserBadge: 'border-rose-200 bg-rose-50 text-rose-700',
        employeeBadge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        opsMgrBadge: 'border-blue-200 bg-blue-50 text-blue-700',
        apCoordBadge: 'border-violet-200 bg-violet-50 text-violet-700',
        cfoBadge: 'border-amber-200 bg-amber-50 text-amber-700',
        accountLeadBadge: 'border-teal-200 bg-teal-50 text-teal-700',
        projectMgrBadge: 'border-violet-200 bg-violet-50 text-violet-700',
        financeArBadge: 'border-amber-200 bg-amber-50 text-amber-700',
        collapsedBg: 'bg-white',
        collapsedText: 'text-zinc-500',
        collapsedBorder: 'border-zinc-200',
        fab: 'bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50',
    };

    // Profile sin tour (e.g. CRM port) · no mostrar el FAB Play porque no hay
    // steps para guiar · el demo renderiza su propia experiencia completa.
    if (activeProfile.noTour) return null;

    if (!isDemoActive) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsDemoActive(true)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg border transition-all font-semibold ${c.fab}`}
                >
                    <Play size={20} fill="currentColor" />
                    <span>Demo</span>
                </button>
            </div>
        );
    }

    if (isSidebarCollapsed) {
        return (
            <div className="fixed left-0 top-32 z-[300]">
                <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-r-xl border border-l-0 shadow-2xl transition-all group w-12 ${c.collapsedBg} ${c.collapsedText} ${c.collapsedBorder} hover:opacity-80`}
                >
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>Demo</span>
                </button>
            </div>
        );
    }

    return (
        <div className={`fixed left-0 top-0 h-full w-80 ${c.bg} border-r ${c.borderSubtle} z-[300] flex flex-col shadow-2xl transition-all duration-300`}>
            {/* Header */}
            <div className={`p-6 border-b ${c.border} ${c.bgHeader}`}>
                <div className="flex items-center justify-between mb-1">
                    <h2 className={`text-lg font-bold ${c.textTitle}`}>Demo Flow</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarCollapsed(true)}
                            className={`p-1 rounded-md ${c.textMuted} hover:opacity-70 transition-colors`}
                            title="Collapse"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setIsDemoActive(false)}
                            className={`${c.textMuted} hover:opacity-70 text-xs uppercase tracking-wider font-semibold ml-1 transition-colors`}
                        >
                            Exit
                        </button>
                    </div>
                </div>
                <p className={`text-xs ${c.textDim}`}>Guided Experience Simulation</p>

                {/* Officeworks · Flow dropdown selector (Spec Check · Labor & Delivery · Sales) */}
                {isOfficeworks && (() => {
                    const FLOW_OPTIONS = [
                        { id: 'spec-check'    as const, label: 'Spec Check & Design', count: flowCounts.specCheck },
                        { id: 'labor-delivery' as const, label: 'Labor & Delivery',    count: flowCounts.laborDelivery },
                        { id: 'sales'         as const, label: 'Sales',                count: flowCounts.sales },
                    ]
                    const activeOpt = FLOW_OPTIONS.find(f => f.id === activeFlow) ?? FLOW_OPTIONS[0]
                    return (
                        <div className="mt-4">
                            <Popover className="relative">
                                {({ open }) => (
                                    <>
                                        <PopoverButton
                                            className={`w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-md text-[12px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${c.bgBadgeActive} ${c.textBadgeActive}`}
                                            aria-label="Switch active flow"
                                        >
                                            <span className="truncate">{activeOpt.label}</span>
                                            <span className="inline-flex items-center gap-1.5 shrink-0">
                                                <span className={`text-[10px] tabular-nums rounded-full px-1.5 ${c.bgBadge} ${c.textBadge}`}>
                                                    {activeOpt.count}
                                                </span>
                                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                                            </span>
                                        </PopoverButton>
                                        <Transition
                                            as={React.Fragment}
                                            enter="transition ease-out duration-150"
                                            enterFrom="opacity-0 -translate-y-1"
                                            enterTo="opacity-100 translate-y-0"
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100 translate-y-0"
                                            leaveTo="opacity-0 -translate-y-1"
                                        >
                                            <PopoverPanel className="absolute z-50 left-0 right-0 mt-1 rounded-md bg-card border border-border shadow-lg overflow-hidden">
                                                {({ close }) => (
                                                    <ul role="listbox" aria-label="Officeworks flows">
                                                        {FLOW_OPTIONS.map(opt => {
                                                            const isActive = activeFlow === opt.id
                                                            return (
                                                                <li key={opt.id} role="option" aria-selected={isActive}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => { handleFlowSwitch(opt.id); close() }}
                                                                        className={`w-full inline-flex items-center gap-2 px-3 py-2 text-[12px] transition-colors text-left ${
                                                                            isActive
                                                                                ? 'bg-primary/10 text-foreground font-semibold'
                                                                                : 'text-foreground hover:bg-muted/50'
                                                                        }`}
                                                                    >
                                                                        <span className="flex-1 truncate">{opt.label}</span>
                                                                        <span className="text-[10px] tabular-nums rounded-full bg-zinc-900/10 dark:bg-white/10 px-1.5 text-muted-foreground">
                                                                            {opt.count}
                                                                        </span>
                                                                        {isActive && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
                                                                    </button>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                )}
                                            </PopoverPanel>
                                        </Transition>
                                    </>
                                )}
                            </Popover>
                        </div>
                    )
                })()}

                {/* CLC · Flow dropdown selector (Calendar · SharePoint · Intake · Data Lake) */}
                {isClc && (() => {
                    const FLOW_OPTIONS = [
                        { id: 'calendar'   as const, label: 'Calendar Sync',        count: clcFlowCounts.calendar },
                        { id: 'sharepoint' as const, label: 'SharePoint Seeding',   count: clcFlowCounts.sharepoint },
                        { id: 'intake'     as const, label: 'Intake Validation',    count: clcFlowCounts.intake },
                        { id: 'data-lake'  as const, label: 'Data Lake Dashboard',  count: clcFlowCounts.dataLake },
                    ]
                    const activeOpt = FLOW_OPTIONS.find(f => f.id === activeClcFlow) ?? FLOW_OPTIONS[0]
                    return (
                        <div className="mt-4">
                            <Popover className="relative">
                                {({ open }) => (
                                    <>
                                        <PopoverButton
                                            className={`w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-md text-[12px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${c.bgBadgeActive} ${c.textBadgeActive}`}
                                            aria-label="Switch active CLC flow"
                                        >
                                            <span className="truncate">{activeOpt.label}</span>
                                            <span className="inline-flex items-center gap-1.5 shrink-0">
                                                <span className={`text-[10px] tabular-nums rounded-full px-1.5 ${c.bgBadge} ${c.textBadge}`}>
                                                    {activeOpt.count}
                                                </span>
                                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                                            </span>
                                        </PopoverButton>
                                        <Transition
                                            as={React.Fragment}
                                            enter="transition ease-out duration-150"
                                            enterFrom="opacity-0 -translate-y-1"
                                            enterTo="opacity-100 translate-y-0"
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100 translate-y-0"
                                            leaveTo="opacity-0 -translate-y-1"
                                        >
                                            <PopoverPanel className="absolute z-50 left-0 right-0 mt-1 rounded-md bg-card border border-border shadow-lg overflow-hidden">
                                                {({ close }) => (
                                                    <ul role="listbox" aria-label="CLC flows">
                                                        {FLOW_OPTIONS.map(opt => {
                                                            const isActive = activeClcFlow === opt.id
                                                            return (
                                                                <li key={opt.id} role="option" aria-selected={isActive}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => { handleClcFlowSwitch(opt.id); close() }}
                                                                        className={`w-full inline-flex items-center gap-2 px-3 py-2 text-[12px] transition-colors text-left ${
                                                                            isActive
                                                                                ? 'bg-primary/10 text-foreground font-semibold'
                                                                                : 'text-foreground hover:bg-muted/50'
                                                                        }`}
                                                                    >
                                                                        <span className="flex-1 truncate">{opt.label}</span>
                                                                        <span className="text-[10px] tabular-nums rounded-full bg-zinc-900/10 dark:bg-white/10 px-1.5 text-muted-foreground">
                                                                            {opt.count}
                                                                        </span>
                                                                        {isActive && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
                                                                    </button>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                )}
                                            </PopoverPanel>
                                        </Transition>
                                    </>
                                )}
                            </Popover>
                        </div>
                    )
                })()}

                {/* F80.2 · Projex · Experience-first selector · 2-tab segmented
                     (Expert Hub | Dealer Experience) + sub-nav debajo con los
                     paths del active tab. Reemplaza el Popover dropdown F74 que
                     mostraba los 5 flows planos sin agrupación. */}
                {isProjex && (() => {
                    // Map por flow id → count (existing counter memo).
                    const flowCountMap: Record<ProjexFlowId, number> = {
                        'projex-ap':                projexFlowCounts.ap,
                        'projex-vendor-onboarding': projexFlowCounts.vendor,
                        'projex-billing':           projexFlowCounts.billing,
                        'projex-order-po':          projexFlowCounts.orderPo,
                        'projex-ack':               projexFlowCounts.ack,
                    }
                    const activeExperience = experienceOf(activeProjexFlow)
                    const activeGroup = PROJEX_EXPERIENCE_GROUPS.find(g => g.id === activeExperience)!

                    const handleExperienceTabClick = (experience: ProjexExperience) => {
                        if (experience === activeExperience) return
                        // Auto-select the first path of the tapped experience so
                        // the user aterriza en una scene concreta · no en un
                        // empty state after clicking the tab.
                        handleProjexFlowSwitch(firstFlowOf(experience))
                    }

                    return (
                        <div className="mt-4 space-y-2">
                            {/* F84.2 · Diego 2026-08-21 · label "EXPERIENCIAS:"
                                 above the 2-tab segmented so non-technical
                                 stakeholders read the group before the tabs. */}
                            <div className={`text-[10px] font-bold uppercase tracking-wider ${c.textMuted} px-1`}>
                                Experiencias
                            </div>
                            {/* Segmented 2-tab · sticky-ish top of the switcher */}
                            <div
                                role="tablist"
                                aria-label="Projex experience"
                                className="grid grid-cols-2 gap-1 p-0.5 rounded-md bg-zinc-900/5 dark:bg-white/5"
                            >
                                {PROJEX_EXPERIENCE_GROUPS.map(group => {
                                    const isActive = group.id === activeExperience
                                    const totalSteps = group.flows.reduce(
                                        (sum, f) => sum + (flowCountMap[f.id] ?? 0),
                                        0,
                                    )
                                    return (
                                        <button
                                            key={group.id}
                                            type="button"
                                            role="tab"
                                            aria-selected={isActive}
                                            onClick={() => handleExperienceTabClick(group.id)}
                                            className={`flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-md text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                                                isActive
                                                    ? `${c.bgBadgeActive} ${c.textBadgeActive} shadow-sm`
                                                    : `${c.textMuted} hover:bg-white/5`
                                            }`}
                                        >
                                            <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
                                                {group.id === 'expert-hub' ? 'Expert Hub' : 'Dealer'}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 text-[10px] tabular-nums opacity-80">
                                                {group.flows.length} paths
                                                <span className="opacity-50">·</span>
                                                {totalSteps} steps
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* F84.2 · Diego 2026-08-21 · label "FLUJOS" above the
                                 path sub-nav for the same non-technical clarity. */}
                            <div className={`pt-2 text-[10px] font-bold uppercase tracking-wider ${c.textMuted} px-1`}>
                                Flujos
                            </div>
                            {/* Sub-nav · paths que pertenecen al active experience */}
                            <ul
                                role="listbox"
                                aria-label={`${activeGroup.label} paths`}
                                className="space-y-1.5"
                            >
                                {activeGroup.flows.map(flow => {
                                    const isActiveFlow = activeProjexFlow === flow.id
                                    return (
                                        <li key={flow.id} role="option" aria-selected={isActiveFlow}>
                                            {/* F81.A · tile-shape path row · bordered · chevron on hover ·
                                                 cursor-pointer explicit · signals clickable affordance clearly */}
                                            <button
                                                type="button"
                                                onClick={() => handleProjexFlowSwitch(flow.id)}
                                                className={`group w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-all text-left cursor-pointer border ${
                                                    isActiveFlow
                                                        ? `${c.bgBadgeActive} ${c.textBadgeActive} font-semibold border-primary/50 shadow-sm`
                                                        : `${c.textMuted} border-transparent hover:border-white/10 hover:bg-white/5 hover:shadow-sm hover:translate-x-0.5`
                                                }`}
                                            >
                                                <span className="flex-1 truncate">
                                                    <span className="opacity-60 mr-1.5">{flow.short.split(' · ')[0]}</span>
                                                    {flow.label}
                                                </span>
                                                {/* F83.A · Diego 2026-08-21 · removed [N] step counters
                                                     · scenes count no longer stable · counters engañaban.
                                                     Sub-nav queda con path label + chevron/check solamente. */}
                                                {isActiveFlow ? (
                                                    <Check className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                                                ) : (
                                                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                                                )}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    )
                })()}

                {/* Officeworks · L&D vertical sub-toggle (Furniture ↔ Walls) */}
                {isOfficeworks && activeFlow === 'labor-delivery' && (
                    <div className="mt-2 flex gap-1 p-0.5 rounded-md bg-zinc-900/5 dark:bg-white/5">
                        <button
                            type="button"
                            onClick={() => handleVerticalSwitch('furniture')}
                            aria-pressed={activeVertical === 'furniture'}
                            className={`flex-1 px-2 py-1 rounded text-[10px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                                activeVertical === 'furniture'
                                    ? `${c.bgBadgeActive} ${c.textBadgeActive}`
                                    : `${c.textMuted} hover:opacity-80`
                            }`}
                        >
                            Furniture · 80%
                        </button>
                        <button
                            type="button"
                            onClick={() => handleVerticalSwitch('walls')}
                            aria-pressed={activeVertical === 'walls'}
                            className={`flex-1 px-2 py-1 rounded text-[10px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                                activeVertical === 'walls'
                                    ? `${c.bgBadgeActive} ${c.textBadgeActive}`
                                    : `${c.textMuted} hover:opacity-80`
                            }`}
                        >
                            Walls · 20%
                        </button>
                    </div>
                )}
            </div>

            {/* F82.2 · Projex playlist · THIS PATH + MOMENTS · replaces
                 the linear step list for Projex only · CEO scan-friendly.
                 Otros profiles siguen con el step list debajo. */}
            {isProjex && (() => {
                const landing = PROJEX_PATH_LANDINGS[activeProjexFlow]
                if (!landing) return null
                const visibleMoments = showProjexAllDetail
                    ? landing.moments
                    : landing.moments.filter(m => m.isCore)
                const hiddenCount = landing.moments.length - visibleMoments.length

                return (
                    <div className="flex-1 overflow-y-auto p-3 pt-6 scrollbar-micro space-y-5">
                        {/* THIS PATH · compact tagline + value chip */}
                        <div className="space-y-2">
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${c.textDim}`}>
                                En este flujo
                            </p>
                            <p className={`text-sm font-semibold ${c.textTitle}`}>
                                {landing.tagline.split(' · ')[0]}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-primary/15 text-foreground">
                                <Star className="h-2.5 w-2.5" aria-hidden="true" />
                                {landing.valueChip.label}
                            </span>
                        </div>

                        {/* MOMENTS · compact tiles · click to jump */}
                        <div className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${c.textDim}`}>
                                    Moments · {visibleMoments.length}
                                </p>
                                {hiddenCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowProjexAllDetail(true)}
                                        className={`text-[10px] font-semibold ${c.textMuted} hover:opacity-80 transition-opacity underline decoration-dotted underline-offset-2`}
                                    >
                                        + {hiddenCount} detail
                                    </button>
                                )}
                                {hiddenCount === 0 && landing.moments.length > 3 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowProjexAllDetail(false)}
                                        className={`text-[10px] font-semibold ${c.textMuted} hover:opacity-80 transition-opacity underline decoration-dotted underline-offset-2`}
                                    >
                                        show core only
                                    </button>
                                )}
                            </div>
                            <ul className="space-y-1.5">
                                {visibleMoments.map(moment => {
                                    const idx = steps.findIndex(s => s.id === moment.stepId)
                                    const isActive = idx === currentStepIndex
                                    const isDone = idx >= 0 && idx < currentStepIndex
                                    return (
                                        <li key={moment.stepId}>
                                            <button
                                                type="button"
                                                onClick={() => idx >= 0 && goToStep(idx)}
                                                className={`w-full text-left rounded-lg border p-2.5 transition-all cursor-pointer group ${
                                                    isActive
                                                        ? `${c.bgBadgeActive} ${c.textBadgeActive} border-primary/50 shadow-sm`
                                                        : `${c.textMuted} border-transparent hover:border-white/10 hover:bg-white/5`
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="shrink-0">
                                                        {isDone ? (
                                                            <CheckCircle2 size={14} className={c.iconDone} />
                                                        ) : isActive ? (
                                                            <div className={`w-3.5 h-3.5 rounded-full border-2 ${c.iconActive} flex items-center justify-center`}>
                                                                <div className={`w-1 h-1 rounded-full ${c.iconActiveDot}`} />
                                                            </div>
                                                        ) : (
                                                            <Circle size={14} className={c.iconPending} />
                                                        )}
                                                    </span>
                                                    <span className="flex-1 min-w-0 text-[12px] font-semibold leading-tight truncate">
                                                        {moment.title}
                                                    </span>
                                                    <span className={`text-[9px] font-mono tabular-nums shrink-0 ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                                                        {moment.estTime}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] leading-snug mt-1 opacity-70 line-clamp-2">
                                                    {moment.description}
                                                </p>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                )
            })()}

            {/* Steps List · not for Projex (F82.3 · playlist replaces it above) */}
            {!isProjex && (
            <div className="flex-1 overflow-y-auto p-3 space-y-1 pt-6 scrollbar-micro">
                {displayedSteps.map(({ step, originalIndex }, displayIndex) => {
                    const isActive = originalIndex === currentStepIndex;
                    const isCompleted = originalIndex < currentStepIndex;
                    const prevDisplayed = displayIndex > 0 ? displayedSteps[displayIndex - 1] : null;
                    const nextDisplayed = displayIndex < displayedSteps.length - 1 ? displayedSteps[displayIndex + 1] : null;
                    const showGroupHeader = displayIndex === 0 || prevDisplayed!.step.groupId !== step.groupId;
                    // Compute sequential display number from group position WITHIN the
                    // displayed (filtered) array so numbering looks contiguous per tab.
                    const groupIds = [...new Set(displayedSteps.map(d => d.step.groupId))];
                    const groupSteps = displayedSteps.filter(d => d.step.groupId === step.groupId);
                    const posInGroup = groupSteps.findIndex(d => d.step.id === step.id);
                    const groupDisplayNum = groupIds.indexOf(step.groupId) + 1;
                    const displayNumber = `${groupDisplayNum}.${posInGroup + 1}`;

                    return (
                        <React.Fragment key={step.id}>
                            {showGroupHeader && (
                                <div className="pt-4 pb-2 first:pt-0">
                                    <h3 className={`text-[10px] font-bold ${c.textDim} uppercase tracking-widest`}>{step.groupTitle}</h3>
                                </div>
                            )}
                            <div
                                onClick={() => goToStep(originalIndex)}
                                className={`relative flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${isActive ? `${c.bgStepActive} border-l-2 ${c.activeBorder}` : 'hover:opacity-80'}`}
                            >
                                {/* Connector Line · only when next displayed step is in same group */}
                                {nextDisplayed && nextDisplayed.step.groupId === step.groupId && (
                                    <div className={`absolute left-[22px] top-11 w-0.5 h-8 ${isCompleted ? c.connectorDone : c.connectorPending}`} />
                                )}

                                {/* Icon / Status */}
                                <div className="z-10 mt-0.5 shrink-0">
                                    {isCompleted ? (
                                        <CheckCircle2 size={20} className={`${c.iconDone} ${c.iconDoneFill}`} />
                                    ) : isActive ? (
                                        <div className={`w-5 h-5 rounded-full border-2 ${c.iconActive} flex items-center justify-center`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${c.iconActiveDot}`} />
                                        </div>
                                    ) : (
                                        <Circle size={20} className={c.iconPending} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? `${c.bgBadgeActive} ${c.textBadgeActive}` : `${c.bgBadge} ${c.textBadge}`}`}>
                                            STEP {displayNumber}
                                        </span>
                                        {(() => {
                                            const label = resolveRoleLabel(step.role, step.app, activeProfile.id);
                                            return (
                                                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm border ${label === 'Facility Manager' ? c.fmBadge : label === 'Facility User' ? c.fuBadge : label === 'Dealer' ? c.dealerBadge : label === 'End User' ? c.endUserBadge : label === 'Sales Coordinator' ? c.scBadge : label === 'Estimator' ? c.estimatorBadge : label === 'Designer' ? c.designerBadge : label === 'Employee' ? c.employeeBadge : label === 'Operations Manager' ? c.opsMgrBadge : label === 'AP Coordinator' ? c.apCoordBadge : label === 'CFO' ? c.cfoBadge : label === 'Account Manager' ? c.accountLeadBadge : label === 'Project Manager' ? c.projectMgrBadge : label === 'Finance / AR' ? c.financeArBadge : label === 'System' ? c.expertBadge : c.expertBadge}`}>
                                                    {label === 'Facility Manager' ? 'FACILITY MANAGER' : label === 'Facility User' ? 'FACILITY USER' : label}
                                                </span>
                                            );
                                        })()}
                                        {STEP_BEHAVIOR[step.id]?.mode === 'auto' && (
                                            <span className={`text-[9px] px-1 py-0.5 rounded flex items-center gap-0.5 ${isActive ? `${c.bgBadgeActive} ${c.textBadgeActive}` : `${c.bgBadge} ${c.textBadge}`}`}>
                                                <Loader2 size={8} className={isActive ? 'animate-spin' : ''} />
                                                AUTO
                                            </span>
                                        )}
                                        {HERO_STEP_IDS.has(step.id) && (
                                            <span
                                                className={`text-[9px] px-1 py-0.5 rounded flex items-center gap-0.5 font-bold uppercase tracking-wider ${
                                                    isActive
                                                        ? 'bg-amber-500/30 text-amber-200'
                                                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                }`}
                                                title="Hero moment — the demo's emotional peak"
                                            >
                                                <Star size={8} className="fill-current" />
                                                HERO
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`font-semibold text-sm leading-tight ${isActive ? c.textTitle : c.textBody}`}>
                                        {step.title}
                                    </h3>
                                    {isActive && (
                                        <p className={`text-[11px] ${c.textMuted} leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300`}>
                                            {step.description}
                                        </p>
                                    )}
                                    {isCompleted && hasDataThreads && getStepDataThread(step.id, activeProfile.id) && (
                                        <p className={`text-[8px] italic ${c.textDim} leading-tight`}>
                                            → {getStepDataThread(step.id, activeProfile.id)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
            )}
            {/* /F82.3 · Steps List conditional (non-Projex only) */}

            {/* Paused Indicator */}
            {isPaused && (
                <div className={`mx-4 mb-2 flex items-center justify-center gap-2 py-2 rounded-lg border ${isDarkSidebar ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'} animate-pulse`}>
                    <Pause size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Paused</span>
                </div>
            )}

            {/* Navigation Controls */}
            <div className={`p-4 border-t ${c.border} ${c.bgHeader}`}>
                <div className="flex gap-2">
                    <button
                        onClick={prevStep}
                        disabled={currentStepIndex === 0}
                        className={`flex-1 flex items-center justify-center gap-1.5 ${c.bgBtn} ${c.textBtn} py-2 rounded-lg text-sm font-semibold disabled:opacity-40 ${c.bgBtnHover} transition-colors`}
                    >
                        <ChevronLeft size={16} />
                        Back
                    </button>
                    <button
                        onClick={togglePause}
                        className={`flex items-center justify-center w-10 rounded-lg text-sm font-semibold transition-colors ${isPaused
                            ? (isDarkSidebar ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-amber-100 text-amber-600 hover:bg-amber-200')
                            : `${c.bgBtn} ${c.textBtn} ${c.bgBtnHover}`
                        }`}
                        title={isPaused ? 'Resume' : 'Pause'}
                    >
                        {isPaused ? <Play size={16} /> : <Pause size={16} />}
                    </button>
                    <button
                        onClick={nextStep}
                        disabled={currentStepIndex === steps.length - 1}
                        className={`flex-[1.5] flex items-center justify-center gap-1.5 ${c.bgNext} ${c.textNext} py-2 rounded-lg text-sm font-semibold disabled:opacity-40 ${c.bgNextHover} transition-colors shadow-sm`}
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
