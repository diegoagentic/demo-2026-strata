import { useState, useEffect } from 'react'
import { GenUIProvider } from './context/GenUIContext'
import { useAuth } from './context/AuthContext'
import { useDemo } from './context/DemoContext'
import { useDemoProfile } from './context/useDemoProfile'
import Login from "./Login"
import Dashboard from "./Dashboard"
import Detail from "./Detail"
import QuoteDetail from "./QuoteDetail"
import OrderDetail from "./OrderDetail"
import AckDetail from "./AckDetail"
import Workspace from "./Workspace"
import Inventory from "./Inventory"
import Catalogs from "./Catalogs"
import MAC from "./MAC"
import Transactions from "./Transactions"
import CRM from "./CRM"
import Pricing from "./Pricing"
import Navbar from "./components/Navbar"
import DemoGuide from "./components/DemoGuide"
import SessionExpiryModal from "./components/SessionExpiryModal"
import DemoSidebar from "./components/demo/DemoSidebar"
import DemoSpotlight from "./components/demo/DemoSpotlight"
import DemoProcessPanel from "./components/demo/DemoProcessPanel"
import DemoStepBanner from "./components/demo/DemoStepBanner"
import DemoAIIndicator from "./components/demo/DemoAIIndicator"
import StrataArchitectureSlide from "./components/demo/StrataArchitectureSlide"

// Simulations
import ExpertHubTransactions from "./components/simulations/ExpertHubTransactions"
import EmailSimulation from "./components/simulations/EmailSimulation"
import DealerMonitorKanban from "./components/simulations/DealerMonitorKanban"
import ServiceNowSimulation from "./components/simulations/ServiceNowSimulation"
import SpecializedCatalog from "./components/simulations/SpecializedCatalog"
import ConversationalSurvey from "./components/simulations/ConversationalSurvey"
import CRMSimulation from "./components/simulations/CRMSimulation"
import DuplerPdfProcessor from "./components/simulations/DuplerPdfProcessor"
import DuplerWarehouse from "./components/simulations/DuplerWarehouse"
// WRG Demo v6 — Strata Estimator (Opción F: Collaborative Single-Shell)
import { StrataEstimatorShell } from "./features/strata-estimator"
// DuplerReporting now renders inside Dashboard.tsx (Follow Up notification + Metrics processing)

// MBI Demo — 5 page stubs (Phase 0.D · expanded in Phases 1-5)
import MBIOverviewPage from "./components/mbi/MBIOverviewPage"
import MBIBudgetPage from "./components/mbi/MBIBudgetPage"
import MBIAccountingPage from "./components/mbi/MBIAccountingPage"
import MBIQuotesPage from "./components/mbi/MBIQuotesPage"
import MBIDesignPage from "./components/mbi/MBIDesignPage"
import BFIPage, { BFIDashboardPage } from "./components/bfi/BFIPage"
import WorkspacesPage from "./components/workspaces/WorkspacesPage"
import OfficeworksPage, { OfficeworksDashboardPage } from "./components/officeworks/OfficeworksPage"
import CLCPage, { CLCDashboardPage } from "./components/clc/CLCPage"
// F74 · Projex demo · shell + 5 placeholder scenes
import ProjexPage from "./components/projex/ProjexPage"
import { Calculator as CalculatorIcon, Receipt as ReceiptIcon, FileSearch as FileSearchIcon, Palette as PaletteIcon, Sparkles as SparklesIcon, Mail as MailIcon, Database as DatabaseIcon, ShieldCheck as ShieldCheckIcon, Building2 as Building2Icon, LayoutDashboard as LayoutDashboardIcon, Inbox as InboxIcon, Pencil as PencilIcon, ClipboardCheck as ClipboardCheckIcon, Send as SendIcon, Calendar as CalendarIcon, Folder as FolderIcon, KanbanSquare as KanbanSquareIcon, BarChart3 as BarChart3Icon } from 'lucide-react'

// Leland Demo — 4 app shells (Phase L0 · expanded in L1-L5)
import { LelandStrataShell, LelandInboxApp, LelandSeradexApp, LelandReviewQueueApp } from "./features/leland"

import {
  HomeIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  UserPlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'

import logoLightBrand from './assets/logo-light-brand.png'
import logoDarkBrand from './assets/logo-dark-brand.png'
// F80.3 · Projex pre-demo · Expert Hub Transactions prod copy wrapped
// (F19 + F43.a synced desde expert-hub@f59da74 · via lift F80.1).
// F81.C.fix · reverted to raw wrapper (no ProjexExperienceShell chrome
// para evitar pseudo-navbar duplicate con el real Navbar).
import ProjexExpertHubWrapper from './vendor/prod-imports/wrappers/ExpertHubTransactionsWrapper'
// F81.C · Presenter notes overlay · discreet · presenter-only · Cmd+Shift+P
import PresenterNotesOverlay from './components/projex/PresenterNotesOverlay'

function App() {
  const { user, initialLoading, signOut, showSessionWarning, refreshSession } = useAuth()
  const { isDemoActive, currentStep, isSidebarCollapsed, steps, goToStep, setIsDemoActive } = useDemo()
  const { activeProfile: demoProfile } = useDemoProfile()
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'detail' | 'quote-detail' | 'order-detail' | 'ack-detail' | 'ack-detail-ai' | 'workspace' | 'inventory' | 'catalogs' | 'mac' | 'transactions' | 'crm' | 'pricing'>('transactions')
  // CRM view interno (Pipeline/Forecast/Design Intake) · controlado desde el
  // Navbar global vía customNavigation con pages 'crm:*'. CRM.tsx lo recibe
  // como prop para sincronizar con el activeTab del navbar.
  const [crmView, setCrmView] = useState<'pipeline' | 'forecast' | 'intake' | 'detail'>('pipeline')
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false)
  const [showArchSlide, setShowArchSlide] = useState(false)
  const [bfiLoginActive, setBfiLoginActive] = useState(false)
  const [bfiDashboardActive, setBfiDashboardActive] = useState(false)
  const [officeworksDashboardActive, setOfficeworksDashboardActive] = useState(false)
  const [clcDashboardActive, setClcDashboardActive] = useState(false)

  // Set initial page for CRM steps
  useEffect(() => {
    if (isDemoActive && currentStep?.app === 'crm') {
      setCurrentPage(currentStep.id === '1.12' ? 'dashboard' : 'crm')
    }
  }, [isDemoActive, currentStep?.app, currentStep?.id])

  // Cuando se selecciona un profile noTour (e.g. Strata CRM) · auto-navegar a su
  // defaultPage para que la UI muestre la experiencia completa sin esperar action.
  // También forzar isDemoActive=false porque steps:[] crashea los overlays
  // (DemoSpotlight depende de currentStep.id).
  useEffect(() => {
    if (demoProfile.noTour) {
      setIsDemoActive(false)
      if (demoProfile.defaultPage) {
        setCurrentPage(demoProfile.defaultPage as typeof currentPage)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoProfile.id, demoProfile.noTour, demoProfile.defaultPage])

  // Reset in-demo detail navigation when step changes
  useEffect(() => {
    if (isDemoActive && (currentPage === 'order-detail' || currentPage === 'quote-detail' || currentPage === 'ack-detail')) {
      setCurrentPage('transactions')
    }
  }, [currentStep?.id])

  // Reset BFI dashboard mode when any demo step advances
  useEffect(() => {
    if (bfiDashboardActive) setBfiDashboardActive(false)
  }, [currentStep?.id])

  // Reset Officeworks dashboard mode when any demo step advances
  useEffect(() => {
    if (officeworksDashboardActive) setOfficeworksDashboardActive(false)
  }, [currentStep?.id])

  const handleNavigate = (page: string) => {
    // CRM demo · pills internas (Pipeline/Forecast/Intake) navegan vía custom
    // pages 'crm:pipeline' etc · no cambian currentPage · solo el view interno.
    // 'crm:notes' y 'crm:messages' son placeholders icon-only del header (parity
    // con standalone) · no tienen view asociado · no-op.
    if (page.startsWith('crm:')) {
      const sub = page.slice(4)
      if (sub === 'notes' || sub === 'messages') return
      setCrmView(sub as 'pipeline' | 'forecast' | 'intake' | 'detail')
      if (currentPage !== 'crm') setCurrentPage('crm')
      return
    }
    if (page === 'overview') {
      setCurrentPage('dashboard')
    } else if (page === 'bfi-dashboard') {
      // BFI Dashboard is a permanent page — not a demo step
      setBfiDashboardActive(true)
    } else if (page === 'officeworks-dashboard') {
      // Officeworks Dashboard is a permanent page — not a demo step
      setOfficeworksDashboardActive(true)
    } else if (page.startsWith('mbi-') || page.startsWith('leland-') || page.startsWith('bfi-') || page.startsWith('officeworks-')) {
      // MBI/Leland/BFI/Officeworks nav tabs jump to the first demo step matching that module's app
      setBfiDashboardActive(false)
      setOfficeworksDashboardActive(false)
      const idx = steps.findIndex(s => s.app === page)
      if (idx >= 0) goToStep(idx)
    } else {
      // @ts-ignore
      setCurrentPage(page)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setCurrentPage('dashboard')
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src={logoLightBrand} alt="Strata" className="h-16 w-auto block dark:hidden" />
          <img src={logoDarkBrand} alt="Strata" className="h-16 w-auto hidden dark:block" />
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  // --- SIMULATION CONFIGURATIONS ---
  const isContinua = demoProfile.id === 'continua';
  const isDupler = demoProfile.id === 'dupler';
  const isWRG = demoProfile.id === 'wrg';
  const isMBI = demoProfile.id === 'mbi';
  const isLeland = demoProfile.id === 'leland';
  const isBFI = demoProfile.id === 'bfi';
  const isWorkspaces = demoProfile.id === 'workspaces';
  const isOfficeworks = demoProfile.id === 'officeworks';
  const isClc = demoProfile.id === 'clc';
  const isProjex = demoProfile.id === 'projex';
  const getSimulationConfig = () => {
    // CRM demo (noTour) · inyectar pills internas en el Navbar global ·
    // pages 'crm:*' interceptadas en handleNavigate para cambiar crmView.
    // Notes y Messages son icon-only placeholders (parity con standalone header) ·
    // handleNavigate los ignora (no-op).
    if (demoProfile.id === 'crm') {
      return {
        appName: 'Strata CRM',
        companyName: demoProfile.companyName,
        customNavigation: [
          { name: 'Pipeline', page: 'crm:pipeline', icon: KanbanSquareIcon },
          { name: 'Forecast', page: 'crm:forecast', icon: BarChart3Icon },
          { name: 'Design Intake', page: 'crm:intake', icon: InboxIcon },
          { name: 'Notes', page: 'crm:notes', icon: PencilIcon },
          { name: 'Messages', page: 'crm:messages', icon: MailIcon },
        ],
      };
    }
    if (!isDemoActive) return { appName: undefined, companyName: undefined, customNavigation: undefined };

    // Standardized app names and company per role
    const isExpert = ['expert-hub', 'dealer-kanban', 'ack-detail', 'transactions', 'mac', 'quote-detail'].includes(currentStep.app);

    // Continua: resolve appName by role (not app) for consistency
    const continuaAppName = currentStep.role === 'Expert' || currentStep.role === 'System' ? 'Expert Hub'
      : currentStep.role === 'Facility Manager' ? 'Facility Manager'
      : currentStep.role === 'Facility User' ? 'Facility User'
      : 'Expert Hub';
    const continuaCompany = currentStep.role === 'Expert' || currentStep.role === 'System' ? 'Strata Services'
      : demoProfile.companyName;

    const isDuplerExpert = isDupler && (currentStep.role === 'Expert' || currentStep.role === 'System');
    const isDuplerDealer = isDupler && currentStep.role === 'Dealer';
    const isWrgDealer = isWRG && currentStep.role === 'Dealer';
    const isWrgExpert = isWRG && currentStep.role === 'Expert';
    const isWrgDesigner = isWRG && currentStep.role === 'Designer';

    // Leland — appName follows the app's purpose; company switches by role.
    const lelandAppName = currentStep.app === 'leland-inbox' ? 'Inbox'
      : currentStep.app === 'leland-strata' ? 'PO Workspace'
      : currentStep.app === 'leland-seradex' ? 'Order System'
      : currentStep.app === 'leland-review' ? 'Review Queue'
      : 'PO Workspace';
    const lelandCompany = currentStep.role === 'System' ? 'Strata Services' : demoProfile.companyName;

    // BFI — appName follows the active module; company is always BFI Furniture
    const bfiAppName = currentStep.app === 'bfi-agency-fee' ? 'Agency Fee AI'
      : currentStep.app === 'bfi-receiving' ? 'Receiving AI'
      : 'Agency Fee AI';
    const bfiCompany = demoProfile.companyName;

    // Workspaces — appName follows the active module; company is Workscapes, Inc.
    const workspacesAppName = currentStep.app === 'workspaces-submit' ? 'Expense Submission'
      : currentStep.app === 'workspaces-approval' ? 'Manager Approval'
      : currentStep.app === 'workspaces-ap' ? 'AP Processing'
      : currentStep.app === 'workspaces-reporting' ? 'Spend Dashboard'
      : 'Expense AI';
    const workspacesCompany = demoProfile.companyName;

    // Officeworks — appName follows the active module; company is Officeworks Inc.
    const officeworksAppName = currentStep.app === 'officeworks-intake' ? 'Intake AI'
      : currentStep.app === 'officeworks-design' ? 'Design AI'
      : currentStep.app === 'officeworks-spec-check' ? 'Spec Check AI'
      : currentStep.app === 'officeworks-submission' ? 'Submission AI'
      : currentStep.app === 'officeworks-dashboard' ? 'Design Dashboard'
      : currentStep.app === 'officeworks-labor' ? 'Labor AI'
      : currentStep.app === 'officeworks-sales' ? 'Sales AI'
      : 'Spec Check AI';
    const officeworksCompany = demoProfile.companyName;

    // CLC — appName follows the active module; company is Creative Library Concepts
    const clcAppName = currentStep.app === 'clc-calendar' ? 'Schedule AI'
      : currentStep.app === 'clc-sharepoint' ? 'Asset Seeding AI'
      : currentStep.app === 'clc-intake' ? 'Project Intake AI'
      : currentStep.app === 'clc-dashboard' ? 'Data Lake Dashboard'
      : 'Schedule AI';
    const clcCompany = demoProfile.companyName;

    // F83.B · Diego 2026-08-21 · appName = experience label (`Expert Hub`
    // or `Dealer Experience`) para match visual con producción · antes
    // era el flow-specific label ("AP Intake AI" · etc.) que no existe
    // en prod. Companyname stays "Projex Inc." (tenant real).
    const isProjexExpertHubApp = isProjex && (
        currentStep.app === 'projex-ap' ||
        currentStep.app === 'projex-order-po' ||
        currentStep.app === 'projex-ack'
    );
    const projexAppName = isProjexExpertHubApp ? 'Expert Hub' : 'Dealer Experience';
    const projexCompany = demoProfile.companyName;

    const resolvedAppName = isContinua ? continuaAppName
      : isLeland ? lelandAppName
      : isBFI ? bfiAppName
      : isWorkspaces ? workspacesAppName
      : isOfficeworks ? officeworksAppName
      : isClc ? clcAppName
      : isProjex ? projexAppName
      : currentStep.app === 'email-marketplace' ? (isWRG ? 'WRG Mail' : 'Wells Fargo Mail')
      : currentStep.app === 'catalog' ? 'Marketplace'
      : currentStep.app === 'service-now' ? 'ServiceNow'
      : currentStep.app === 'crm' ? 'Strata CRM'
      : isWrgDesigner ? 'Designer Experience'
      : isWrgDealer ? 'Dealer Experience'
      : isWrgExpert ? 'Expert Hub'
      : isDuplerDealer ? 'Dealer Experience'
      : isDuplerExpert ? 'Expert Hub'
      : isExpert ? 'Expert Hub'
      : 'Dealer Experience';
    const resolvedCompany = isContinua ? continuaCompany
      : isLeland ? lelandCompany
      : isBFI ? bfiCompany
      : isWorkspaces ? workspacesCompany
      : isOfficeworks ? officeworksCompany
      : isClc ? clcCompany
      : isProjex ? projexCompany
      : isExpert || isDuplerExpert || isWrgExpert || isWrgDesigner ? 'Strata Services'
      : demoProfile.companyName;

    // Continua profile: 4-tab nav including Inventory with "Connected" badge
    const continuaNav = [
      { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
      { name: 'Inventory', page: 'inventory', icon: ArchiveBoxIcon, badge: 'Connected' },
      { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
      { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
    ];
    const expertNav = [
      { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
      { name: 'Service Center', page: 'mac', icon: WrenchScrewdriverIcon },
      { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
    ];
    const crmNav = [
      { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
      { name: 'CRM', page: 'crm', icon: UserGroupIcon },
      { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
    ];
    // Dupler profile: 3-tab nav (Dashboard, Inventory, Transactions)
    const duplerNav = [
      { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
      { name: 'Inventory', page: 'inventory', icon: ArchiveBoxIcon },
      { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
    ];
    // WRG profile: no center nav (demo auto-drives all steps)
    const wrgNav: { name: string; page: string; icon: any; badge?: string }[] = [];

    // MBI profile: 2-tab primary nav (Accounting + Quotes).
    // - Budget Builder: removed per Apr 23 (Carlos · not in scope).
    // - Design AI: removed from nav per Apr 27 user decision (was already
    //   removed from the active tour — keeping the tab open after the
    //   tour shrunk caused confusion). MBIDesignPage component + the
    //   'mbi-design' route handler + appToTab entry stay in the codebase
    //   for fast re-enable: paste the entry below back in.
    const mbiNav = [
      { name: 'Accounting AI', page: 'mbi-accounting', icon: ReceiptIcon },
      { name: 'Quotes AI', page: 'mbi-quotes', icon: FileSearchIcon },
    ];

    // Leland profile: 4-tab primary nav (PO Workspace · Inbox · Order System · Review)
    const lelandNav = [
      { name: 'PO Workspace', page: 'leland-strata', icon: SparklesIcon },
      { name: 'Inbox', page: 'leland-inbox', icon: MailIcon },
      { name: 'Order System', page: 'leland-seradex', icon: DatabaseIcon },
      { name: 'Review Queue', page: 'leland-review', icon: ShieldCheckIcon },
    ];

    // BFI profile: 3-tab primary nav (Dashboard · Agency Fee AI · Receiving AI)
    const bfiNav = [
      { name: 'Dashboard', page: 'bfi-dashboard', icon: LayoutDashboardIcon },
      { name: 'Agency Fee AI', page: 'bfi-agency-fee', icon: Building2Icon },
      { name: 'Receiving AI', page: 'bfi-receiving', icon: ReceiptIcon },
    ];

    // Workspaces profile: 3-tab primary nav (Expense Submission · AP & Reporting · Spend Dashboard)
    const workspacesNav = [
      { name: 'Expense Submission', page: 'workspaces-submit', icon: ReceiptIcon },
      { name: 'AP & Reporting', page: 'workspaces-ap', icon: Building2Icon },
      { name: 'Spend Dashboard', page: 'workspaces-dashboard', icon: LayoutDashboardIcon },
    ];

    // Officeworks profile: 5-tab primary nav (Dashboard persistent + 4 module tabs · per plan Iter 1 decision)
    const officeworksNav = [
      { name: 'Dashboard', page: 'officeworks-dashboard', icon: LayoutDashboardIcon },
      { name: 'Intake AI', page: 'officeworks-intake', icon: InboxIcon },
      { name: 'Design AI', page: 'officeworks-design', icon: PencilIcon },
      { name: 'Spec Check AI', page: 'officeworks-spec-check', icon: ClipboardCheckIcon },
      { name: 'Submission AI', page: 'officeworks-submission', icon: SendIcon },
    ];

    // CLC profile: 5-tab primary nav (Dashboard persistent + 4 module tabs)
    const clcNav = [
      { name: 'Dashboard', page: 'clc-dashboard', icon: LayoutDashboardIcon },
      { name: 'Schedule AI', page: 'clc-calendar', icon: CalendarIcon },
      { name: 'Asset Seeding AI', page: 'clc-sharepoint', icon: FolderIcon },
      { name: 'Project Intake AI', page: 'clc-intake', icon: ClipboardCheckIcon },
    ];

    // F83.B · Diego 2026-08-21 · Projex navbar debe replicar el prod
    // expert-hub Navbar (4 tabs · OCR Tracking · Transactions · Comparisons
    // · Feedback) cuando el active step es Expert Hub · Dealer variant (4
    // tabs · OCR · Observability · Feedback · Transactions) cuando es
    // Dealer. Antes mostraba 5 flow-tabs (AP Intake · Vendor Onboarding
    // · etc.) que NO existen en prod. Path switch entre flows sigue
    // funcionando via el sidebar sub-nav (F80.2).
    //
    // Active tab derived from `activeTabFor(currentStep.app)` (ProjexPage
    // F80.5 mapping) · match visual con prod ExpertHubTransactions.tsx /
    // OCRTracking.tsx / quote-converter Dealer shell.
    const isProjexExpertHub = isProjex && (
        currentStep.app === 'projex-ap' ||
        currentStep.app === 'projex-order-po' ||
        currentStep.app === 'projex-ack'
    );
    const projexNav = isProjexExpertHub
      ? [
          { name: 'OCR Tracking', page: 'projex-ocr' as string, icon: InboxIcon },
          { name: 'Transactions', page: 'projex-transactions' as string, icon: BanknotesIcon },
          { name: 'Comparisons', page: 'projex-comparisons' as string, icon: FileSearchIcon },
          { name: 'Feedback', page: 'projex-feedback' as string, icon: LayoutDashboardIcon },
        ]
      : [
          { name: 'OCR', page: 'projex-ocr' as string, icon: InboxIcon },
          { name: 'Observability', page: 'projex-observability' as string, icon: BarChart3Icon },
          { name: 'Feedback', page: 'projex-feedback' as string, icon: LayoutDashboardIcon },
          { name: 'Transactions', page: 'projex-transactions' as string, icon: BanknotesIcon },
        ];

    const nav = currentStep.app === 'crm' ? crmNav : isWRG ? wrgNav : isDupler ? duplerNav : isContinua ? continuaNav : isMBI ? mbiNav : isLeland ? lelandNav : isBFI ? bfiNav : isWorkspaces ? workspacesNav : isOfficeworks ? officeworksNav : isClc ? clcNav : isProjex ? projexNav : expertNav;
    return { appName: resolvedAppName, companyName: resolvedCompany, customNavigation: nav };
  };

  const { appName, companyName, customNavigation } = getSimulationConfig();

  // Determine the correct active nav tab during demo mode
  const getActiveTab = () => {
    // CRM demo · resaltar la pill activa basado en crmView (Pipeline/Forecast/Intake).
    // Detail view se trata como Pipeline · usuario sigue en el flujo de pipeline.
    if (demoProfile.id === 'crm' && currentPage === 'crm') {
      const v = crmView === 'detail' ? 'pipeline' : crmView
      return `crm:${v}`
    }
    if (!isDemoActive) return currentPage;
    const appToTab: Record<string, string> = {
      'dealer-kanban': 'transactions',
      'expert-hub': 'transactions',
      'service-now': 'dashboard',
      'catalog': 'dashboard',
      'email-marketplace': 'dashboard',
      'dashboard': 'dashboard',
      'transactions': 'transactions',
      'quote-po': 'quote-detail',
      'quote-detail': 'quote-detail',
      'order-detail': 'order-detail',
      'ack-detail': 'transactions',
      'mac': 'mac',
      'inventory': 'inventory',
      'crm': currentPage === 'dashboard' ? 'dashboard' : 'crm',
      'dupler-pdf': 'transactions',
      'dupler-warehouse': 'inventory',
      'dupler-reporting': 'dashboard',
      // WRG Demo v6: no global Navbar tab — Estimator owns its own tabs
      'wrg-estimator': 'dashboard',
      // Leland Demo: each app maps to its own primary nav tab (see lelandNav)
      'leland-strata': 'leland-strata',
      'leland-inbox': 'leland-inbox',
      'leland-seradex': 'leland-seradex',
      'leland-review': 'leland-review',
      // MBI Demo: each module owns its own primary nav tab (see mbiNav)
      'mbi-overview': 'mbi-overview',
      'mbi-budget': 'mbi-budget',
      'mbi-accounting': 'mbi-accounting',
      'mbi-quotes': 'mbi-quotes',
      'mbi-design': 'mbi-design',
      // BFI Demo: three tabs (Dashboard is permanent page, not a step)
      'bfi-dashboard': 'bfi-dashboard',
      'bfi-agency-fee': 'bfi-agency-fee',
      'bfi-receiving': 'bfi-receiving',
      // Workspaces Demo: two flows, submission tabs → submit nav, ap/reporting → ap nav
      'workspaces-submit': 'workspaces-submit',
      'workspaces-approval': 'workspaces-submit',
      'workspaces-ap': 'workspaces-ap',
      'workspaces-reporting': 'workspaces-dashboard',
      // Officeworks Demo: 5 tabs (Dashboard persistent + 4 module tabs)
      'officeworks-dashboard': 'officeworks-dashboard',
      'officeworks-intake': 'officeworks-intake',
      'officeworks-design': 'officeworks-design',
      'officeworks-spec-check': 'officeworks-spec-check',
      'officeworks-submission': 'officeworks-submission',
      'officeworks-labor': 'officeworks-labor',
      'officeworks-sales': 'officeworks-sales',
      // CLC Demo: 4 module tabs + Dashboard persistent
      'clc-dashboard': 'clc-dashboard',
      'clc-calendar': 'clc-calendar',
      'clc-sharepoint': 'clc-sharepoint',
      'clc-intake': 'clc-intake',
    };
    if (isBFI && bfiDashboardActive) return 'bfi-dashboard'
    if (isOfficeworks && officeworksDashboardActive) return 'officeworks-dashboard'
    if (isClc && clcDashboardActive) return 'clc-dashboard'
    return appToTab[currentStep.app] || currentPage;
  };

  // --- INDEPENDENT SIMULATION ROUTING ---
  const renderSimulation = () => {
    // Allow in-demo navigation to detail pages (e.g. step 1.2 → order-detail)
    if (currentPage === 'order-detail') {
      return <OrderDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    }
    if (currentPage === 'ack-detail') {
      return <AckDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    }
    switch (currentStep.app) {
      case 'expert-hub':
        return (
          <ExpertHubTransactions
            onLogout={handleLogout}
            onNavigateToDetail={(id) => {
              console.log('Navigate to detail', id);
              setCurrentPage('detail');
            }}
            onNavigateToWorkspace={() => setCurrentPage('workspace')}
            onNavigate={(p) => handleNavigate(p)}
          />
        );
      case 'email-marketplace':
        return <EmailSimulation />;
      case 'dealer-kanban':
        return <DealerMonitorKanban onNavigate={handleNavigate} />;
      case 'service-now':
        return <ServiceNowSimulation />;
      case 'catalog':
        return <SpecializedCatalog />;
      case 'survey':
        return <ConversationalSurvey />;
      case 'quote-po':
        return <QuoteDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'order-detail':
        return <OrderDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'ack-detail':
        return <AckDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'transactions':
        return <Transactions onLogout={handleLogout} onNavigateToDetail={(type) => setCurrentPage(type as any)} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'mac':
        return <MAC onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'quote-detail':
        return <QuoteDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'inventory':
        return <Inventory onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
      case 'crm':
        return <CRMSimulation onNavigate={handleNavigate} activePage={currentPage} />;
      case 'dupler-pdf':
        return (
          <>
            <DuplerPdfProcessor onNavigate={handleNavigate} />
            <Transactions onLogout={handleLogout} onNavigateToDetail={(type) => setCurrentPage(type as any)} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
          </>
        );
      case 'dupler-warehouse':
        return (
          <>
            <DuplerWarehouse onNavigate={handleNavigate} />
            <Inventory onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
          </>
        );
      case 'dupler-reporting':
        return (
          <Dashboard onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />
        );
      case 'wrg-estimator':
        // Single collaborative Shell — role + visual state driven by currentStep
        return <StrataEstimatorShell />;
      case 'mbi-overview':
        return <MBIOverviewPage />;
      case 'mbi-budget':
        return <MBIBudgetPage />;
      case 'mbi-accounting':
        return <MBIAccountingPage />;
      case 'mbi-quotes':
        return <MBIQuotesPage />;
      case 'mbi-design':
        return <MBIDesignPage />;
      case 'leland-strata':
        return <LelandStrataShell />;
      case 'leland-inbox':
        return <LelandInboxApp />;
      case 'leland-seradex':
        return <LelandSeradexApp />;
      case 'leland-review':
        return <LelandReviewQueueApp />;
      case 'bfi-agency-fee':
      case 'bfi-receiving':
        if (bfiDashboardActive) return <BFIDashboardPage />
        return <BFIPage />;
      case 'workspaces-submit':
      case 'workspaces-approval':
      case 'workspaces-ap':
      case 'workspaces-reporting':
        return <WorkspacesPage />;
      case 'officeworks-intake':
      case 'officeworks-design':
      case 'officeworks-spec-check':
      case 'officeworks-submission':
      case 'officeworks-labor':
      case 'officeworks-sales':
        if (officeworksDashboardActive) return <OfficeworksDashboardPage />
        return <OfficeworksPage />;
      case 'officeworks-dashboard':
        return <OfficeworksDashboardPage />;
      case 'clc-calendar':
      case 'clc-sharepoint':
      case 'clc-intake':
        if (clcDashboardActive) return <CLCDashboardPage />
        return <CLCPage />;
      case 'clc-dashboard':
        return <CLCDashboardPage />;
      // F74 · Projex · 5 flows todos rutean a ProjexPage (que routea internamente por stepId)
      case 'projex-ap':
      case 'projex-vendor-onboarding':
      case 'projex-billing':
      case 'projex-order-po':
      case 'projex-ack':
        return <ProjexPage />;
      default:
        return (
          <ExpertHubTransactions
            onLogout={handleLogout}
            onNavigateToDetail={(id) => {
              console.log('Navigate to detail', id);
              setCurrentPage('detail');
            }}
            onNavigateToWorkspace={() => setCurrentPage('workspace')}
            onNavigate={(p) => handleNavigate(p)}
          />
        );
    }
  };

  const renderCurrentPage = () => {
    // F81.C.fix · Diego 2026-08-21 · Projex pre-demo state simplified.
    // Antes (F81.B.3) el pre-demo mostraba el rich ProjexPathLanding con
    // playlist + hero + CTAs · user flagged como "demasiados elementos
    // para el inicio" + pseudo-navbar duplicado. Ahora pre-demo = raw
    // Expert Hub Transactions prod copy · minimal · alineado con lo que
    // el user ve como CEO al abrir la plataforma real. El rich landing
    // (ProjexPathLanding) queda disponible como componente · su new home
    // en el tour se define en Fase B.4 next iteration.
    if (isProjex) {
      return <ProjexExpertHubWrapper />;
    }
    if (currentPage === 'dashboard') return <Dashboard onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'inventory') return <Inventory onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'catalogs') return <Catalogs onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'mac') return <MAC onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'transactions') return (
      <Transactions
        onLogout={handleLogout}
        onNavigateToDetail={(type) => setCurrentPage(type as any)}
        onNavigateToWorkspace={() => setCurrentPage('workspace')}
        onNavigate={handleNavigate}
      />
    );
    if (currentPage === 'crm') return <CRM onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} view={crmView} setView={setCrmView} />;
    if (currentPage === 'pricing') return <Pricing onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'detail') return <Detail onBack={() => setCurrentPage('dashboard')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'quote-detail') return <QuoteDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'order-detail') return <OrderDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'ack-detail') return <AckDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'ack-detail-ai') return <AckDetail initialTab={1} onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
    if (currentPage === 'workspace') return <Workspace onBack={() => setCurrentPage('dashboard')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} />;
    return null;
  };

  return (
    <GenUIProvider onNavigate={handleNavigate}>
      <SessionExpiryModal
        isOpen={showSessionWarning}
        onExtend={refreshSession}
        onLogout={handleLogout}
      />

      {/* Demo UI Elements · skipped cuando el profile activo es noTour (e.g. Strata CRM)
          porque esos overlays asumen que currentStep existe · steps:[] crashea (issue #
          DemoSpotlight.tsx:55 cannot read 'id' of undefined). El profile noTour
          renderiza su propia experiencia completa sin tour overlay. */}
      {!demoProfile.noTour && (
        <>
          <DemoSidebar />
          <DemoSpotlight />
          <DemoProcessPanel onNavigate={handleNavigate} />
          <DemoStepBanner />
        </>
      )}

      {/* F81.C · Presenter notes overlay · siempre mounted · el component
           decide internamente si renderea (solo Projex + demo activo +
           notes disponibles). Toggle via `?presenter=1` o `Cmd/Ctrl+Shift+P`.
           Persistente por session · client-hostile design (small · bottom-left). */}
      <PresenterNotesOverlay />

      {/* FIXED NAVBAR (Unified) — hidden for email simulation, WRG Estimator routes & workspace/detail */}
      {/* isBFIMobile: hide navbar for BFI mobile-frame steps (r1.6) so the phone renders full-screen */}
      {(isDemoActive
        ? currentStep.app !== 'email-marketplace'
          && currentStep.app !== 'wrg-estimator'
          && currentStep.app !== 'workspaces-submit'
          && !bfiLoginActive
          && !(isBFI && ['r1.6', 'a1.0', 'a1.2'].includes(currentStep.id))
          && !['1.6', '2.1', '4.4'].includes(currentStep.id)
          && !(currentStep.id === '1.8' && currentStep.app !== 'crm')
          && !(currentStep.id === '3.5' && !isContinua)
        : currentPage !== 'detail' && currentPage !== 'workspace'
      ) && (
        <div className="fixed top-0 left-0 right-0 z-[100]">
          <Navbar
            onLogout={handleLogout}
            onNavigateToWorkspace={() => setCurrentPage('workspace')}
            onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
            activeTab={getActiveTab()}
            onNavigate={handleNavigate}
            appName={appName}
            companyName={companyName}
            customNavigation={customNavigation}
          />
        </div>
      )}

      {/* MAIN CONTENT VIEWPORT */}
      <main className={`transition-all duration-300 ${(isDemoActive ? currentStep.app !== 'email-marketplace' && currentStep.app !== 'wrg-estimator' && currentStep.app !== 'workspaces-submit' && !bfiLoginActive && !(isBFI && ['r1.6', 'a1.0', 'a1.2'].includes(currentStep.id)) : currentPage !== 'detail' && currentPage !== 'workspace') ? 'pt-16' : ''} ${isDemoActive ? (isSidebarCollapsed ? 'pl-0' : 'pl-80') + ' animate-in fade-in duration-500' : ''} min-h-screen bg-background`}>
        {isDemoActive && <DemoAIIndicator />}
        {isDemoActive ? renderSimulation() : renderCurrentPage()}
      </main>

      <DemoGuide
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Architecture Slide — kept for programmatic access, button removed */}
      <StrataArchitectureSlide open={showArchSlide} onClose={() => setShowArchSlide(false)} />
    </GenUIProvider>
  );
}

export default App
