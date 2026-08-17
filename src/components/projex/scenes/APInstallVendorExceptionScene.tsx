/**
 * COMPONENT: APInstallVendorExceptionScene (Projex · p1.4)
 * PURPOSE: Daniel abre su AP inbox (vista general). Un nuevo Warehouse by
 *          Design bill llega sin PO # · Strata resalta la fila + dispara
 *          notif Action Center · "trabajá este primero". Daniel click → abre
 *          el canonical AIEmailComposer (slide-over) · Strata pre-drafts el
 *          PM double-check email a Jeff · un click envía. Held bill queda
 *          "awaiting PM confirmation" hasta que Jeff responda con el PO #.
 *
 * SHAPE: Inbox-first list (secondary interaction · F1 kanban is primary).
 *        Composer = shared/AIEmailComposer.tsx (canonical email UI).
 *
 * DS TOKENS: bg-card · bg-destructive/10 · text-destructive · bg-primary
 *            · text-primary-foreground · bg-ai-light · text-ai · border-border
 *
 * SOURCE OF TRUTH: _SOT_projex.md §12a · Jacob names verbatim · AP9 pattern
 * REUSE FROM: shared/AIEmailComposer.tsx (canonical composer · slide-over)
 *             bfi/MichaelApprovalScene.tsx (Send flash pattern reference)
 */

import { useEffect, useState } from 'react'
import {
    Sparkles, Send, CheckCircle2, Clock, AlertTriangle, Paperclip,
    Building2, Mail, ChevronRight, ArrowRight, Inbox, Circle,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import AIEmailComposer, { type EmailPolishDirection } from '../../shared/AIEmailComposer'
import { PROJEX_BILLS_OVERNIGHT } from '../../../config/profiles/projex-data/bills'
import { PROJEX_VENDORS } from '../../../config/profiles/projex-data/vendors'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'

const HELD_BILL_ID = 'PJX-BILL-8484'

const DRAFT_SUBJECT = 'Please confirm PO # for Warehouse by Design bill WBD-2026-0812 · Denver Financial install'
const DRAFT_BODY = `Hi Jeff,

We received an install invoice from Warehouse by Design for the Denver Financial project (Aug 12-13). It came in with the project name only — no PO # on the vendor's copy.

Before I save this bill to NetSuite, please double-check:
  1. Which PO does this bill match?
  2. Is the work complete on your side?
  3. Approved to pay?

Bill · WBD-2026-0812
Amount · $3,200.00
Vendor · Warehouse by Design

Reply with the PO # and I'll close it out today.

Thanks,
Daniel`

// Jeff-specific tone variants · surfaced via AIEmailComposer's polish toolbar
const POLISH_TONES: Record<EmailPolishDirection, string> = {
    friendlier: `Hey Jeff — hope the Denver Financial install wrapped up OK!

We got a Warehouse by Design invoice on the AP inbox this morning with just the project name, no PO # on the vendor's side. Quick sanity check before I save it?

  • Which PO does this one match?
  • Are the crews done on your end?
  • Green light to pay?

Bill · WBD-2026-0812 · $3,200.00

Any time today works — appreciate it!
Daniel`,
    firmer: `Jeff,

Warehouse by Design invoice WBD-2026-0812 ($3,200) landed in AP with project name only. Per our policy, I cannot post an install-vendor bill without PO # confirmation.

Please confirm today:
  1. PO #
  2. Work complete
  3. Approved to pay

Bill is held until I hear back.

Daniel`,
    shorter: `Hi Jeff — WBD-2026-0812 ($3,200) arrived without a PO #. Which PO does it match, is the install complete, and are we clear to pay? Held until you confirm. Thanks — Daniel`,
}

type Phase = 'inbox' | 'sent'

interface InboxEmail {
    id: string
    from: string
    fromInitials: string
    subject: string
    snippet: string
    time: string
    unread: boolean
    attachment?: boolean
    tag?: { label: string; tone: 'success' | 'muted' | 'ai' | 'destructive' }
}

const BASELINE_INBOX: InboxEmail[] = [
    {
        id: 'em-teknion',
        from: 'Teknion Bills · NCBA project',
        fromInitials: 'TK',
        subject: 'Invoice WT12-9871 · 291 lines · NCBA PO-DC-0009642',
        snippet: 'Auto-matched to the penny · saved to NetSuite yesterday.',
        time: 'Aug 15',
        unread: false,
        attachment: true,
        tag: { label: 'Matched', tone: 'success' },
    },
    {
        id: 'em-hbf',
        from: 'HBF Furnishings',
        fromInitials: 'HB',
        subject: 'Invoice HBF-8034 · Fairport furniture batch',
        snippet: 'Matched · saved to NetSuite yesterday · Communications tab drop.',
        time: 'Aug 15',
        unread: false,
        attachment: true,
        tag: { label: 'Matched', tone: 'success' },
    },
    {
        id: 'em-alec',
        from: 'Alec Walker · Walls Director',
        fromInitials: 'AW',
        subject: 'Re: MWH progress-bill 40% tranche',
        snippet: 'Stacy has the field verification for zone 3 · will forward by EOD.',
        time: 'Today · 9:12 am',
        unread: false,
        tag: { label: 'Internal', tone: 'muted' },
    },
    {
        id: 'em-isabella',
        from: 'Isabella Chen · Coord',
        fromInitials: 'IC',
        subject: 'PIF workbook attached · NCBA reorder',
        snippet: '300 lines + 26 S&H · needs your review before I split POs by vendor.',
        time: 'Today · 9:47 am',
        unread: true,
        attachment: true,
        tag: { label: 'FYI', tone: 'muted' },
    },
]

const WBD_EMAIL: InboxEmail = {
    id: 'em-wbd',
    from: 'Warehouse by Design · Billing',
    fromInitials: 'WB',
    subject: 'Invoice WBD-2026-0812 · Denver Financial install labor',
    snippet: 'Install labor for Denver Financial (Aug 12-13) · $3,200.00 · project name only, no PO # on the vendor\'s copy.',
    time: 'Today · 10:04 am',
    unread: true,
    attachment: true,
    tag: { label: 'Needs PM check · AP9', tone: 'ai' },
}

export default function APInstallVendorExceptionScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const bill = PROJEX_BILLS_OVERNIGHT.find(b => b.id === HELD_BILL_ID)
    const vendor = PROJEX_VENDORS.find(v => v.id === 'warehouse-by-design')
    const jeff = PROJEX_PERSONAS.jeff
    const daniel = PROJEX_PERSONAS.daniel

    // WBD arrives 900ms after scene mounts · Action Center already scripted
    // by PROJEX_STEP_NOTIFICATIONS['p1.4'] via step-enter dispatch.
    const [wbdArrived, setWbdArrived] = useState(false)
    const [composerOpen, setComposerOpen] = useState(false)
    const [phase, setPhase] = useState<Phase>('inbox')

    useEffect(() => {
        pauseAwareTimeout(() => setWbdArrived(true), 900)
    }, [pauseAwareTimeout])

    const emails: InboxEmail[] = wbdArrived
        ? [WBD_EMAIL, ...BASELINE_INBOX]
        : BASELINE_INBOX

    const handleOpenComposer = () => {
        if (!wbdArrived || phase === 'sent') return
        setComposerOpen(true)
    }

    const handleSend = () => {
        setComposerOpen(false)
        pauseAwareTimeout(() => setPhase('sent'), 300)
    }

    const customPolish = (_body: string, direction: EmailPolishDirection) =>
        POLISH_TONES[direction] ?? _body

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.AP_INBOX_PJX] },
        { sources: [PROJEX_SOURCES.STRATA_COMPOSER] },
        { sources: [PROJEX_SOURCES.SHAREPOINT_PROJECTS, PROJEX_SOURCES.NETSUITE_PO] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F1</span>
                    <span>AP intake &amp; matching · step 4</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                        <Sparkles className="h-3 w-3" aria-hidden="true" /> AI-drafted
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    AP inbox · install-vendor bill without PO # · Strata flags for {jeff.fullName.split(' ')[0]}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Classic <strong className="text-foreground">AP9</strong> pattern · install vendors (Warehouse by Design · Clear Space · Digital Interior) send bills with project name only. {daniel.fullName.split(' ')[0]} works out of the AP inbox · Strata highlights the new held bill and pre-drafts the PM double-check to {jeff.fullName.split(' ')[0]}.
                </p>
            </div>

            {/* Inbox card */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Inbox header */}
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    <Inbox className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {daniel.fullName.split(' ')[0]}&apos;s AP inbox · ap@projex-inc.com
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                        <Circle className="h-1.5 w-1.5 fill-success text-success" aria-hidden="true" />
                        Strata live · flagging held bills
                    </span>
                </div>

                {/* Email list */}
                <ul className="divide-y divide-border">
                    {emails.map(email => {
                        const isWbd = email.id === 'em-wbd'
                        const isHeld = isWbd && phase !== 'sent'
                        const isSent = isWbd && phase === 'sent'

                        return (
                            <li
                                key={email.id}
                                className={`
                                    group relative px-4 py-3 transition-colors
                                    ${isHeld ? 'bg-ai-light/40 ring-1 ring-inset ring-ai/40' : 'hover:bg-muted/30'}
                                    ${isWbd ? 'animate-in fade-in slide-in-from-top-2 duration-500' : ''}
                                `}
                            >
                                {/* Left accent for held row */}
                                {isHeld && (
                                    <div className="absolute inset-y-0 left-0 w-1 bg-ai animate-pulse" aria-hidden="true" />
                                )}

                                <div className="flex items-start gap-3">
                                    {/* Unread dot + avatar */}
                                    <div className="flex flex-col items-center gap-1.5 pt-0.5">
                                        <div className={`h-2 w-2 rounded-full ${email.unread ? 'bg-primary' : 'bg-transparent'}`} aria-hidden="true" />
                                        <div className={`
                                            h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                                            ${isWbd ? 'bg-ai/20 text-ai' : 'bg-muted text-muted-foreground'}
                                        `}>
                                            {email.fromInitials}
                                        </div>
                                    </div>

                                    {/* Email body */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 flex-wrap">
                                            <span className={`text-xs ${email.unread ? 'font-bold text-foreground' : 'text-foreground'}`}>
                                                {email.from}
                                            </span>
                                            {email.tag && (
                                                <span className={`
                                                    text-[10px] font-semibold rounded px-1.5 py-0.5 inline-flex items-center gap-1
                                                    ${email.tag.tone === 'success' ? 'bg-success-light text-success' : ''}
                                                    ${email.tag.tone === 'muted' ? 'bg-muted text-muted-foreground' : ''}
                                                    ${email.tag.tone === 'ai' ? 'bg-ai-light text-ai' : ''}
                                                    ${email.tag.tone === 'destructive' ? 'bg-destructive/10 text-destructive' : ''}
                                                `}>
                                                    {email.tag.tone === 'ai' && <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />}
                                                    {email.tag.label}
                                                </span>
                                            )}
                                            <span className="ml-auto text-[10px] font-mono text-muted-foreground shrink-0">
                                                {email.time}
                                            </span>
                                        </div>
                                        <div className={`text-xs mt-0.5 truncate ${email.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                            {email.subject}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                                            {email.snippet}
                                        </div>

                                        {/* WBD expanded panel · shows held bill mini-details + action */}
                                        {isWbd && (
                                            <div className="mt-3 rounded-lg border border-ai/30 bg-card p-3 space-y-3 animate-in fade-in duration-500">
                                                <div className="flex items-start gap-2 text-[11px]">
                                                    <AlertTriangle className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" aria-hidden="true" />
                                                    <div className="text-foreground">
                                                        <strong>Strata says:</strong> new install-vendor bill · no PO # on vendor&apos;s copy. Draft is ready · send the PM double-check to {jeff.fullName.split(' ')[0]}.
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-2 border-t border-border">
                                                    <div>
                                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Bill</div>
                                                        <div className="text-foreground font-semibold mt-0.5">{bill?.vendorInvoiceNumber}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Amount</div>
                                                        <div className="text-foreground font-bold tabular-nums mt-0.5">
                                                            ${bill?.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Project</div>
                                                        <div className="text-foreground font-medium mt-0.5">{bill?.projectName}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">PM</div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <div className="h-5 w-5 rounded-full bg-primary/15 text-foreground flex items-center justify-center text-[9px] font-bold">
                                                                {jeff.initials}
                                                            </div>
                                                            <span className="text-foreground font-medium">{jeff.fullName.split(' ')[0]}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action bar */}
                                                <div className="flex items-center gap-2 pt-2 border-t border-border">
                                                    {isSent ? (
                                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-success">
                                                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                            Sent · bill held for PM confirmation
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                Bill held until {jeff.fullName.split(' ')[0]} replies with the PO #.
                                                            </span>
                                                            <button
                                                                onClick={handleOpenComposer}
                                                                className="ml-auto inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                                            >
                                                                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                                                Draft PM double-check
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Attachment icon */}
                                    {email.attachment && !isWbd && (
                                        <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" aria-hidden="true" />
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>

                {/* Inbox footer · counters */}
                <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{emails.length} messages</span>
                    <span className="text-muted-foreground/50">·</span>
                    <span>{emails.filter(e => e.unread).length} unread</span>
                    <span className="text-muted-foreground/50">·</span>
                    <span>{wbdArrived && phase !== 'sent' ? '1 held for PM check' : '0 held'}</span>
                </div>
            </div>

            {/* Waiting banner · appears after send */}
            {phase === 'sent' && (
                <div className="rounded-xl border border-warning/40 bg-warning/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Clock className="h-5 w-5 text-warning" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">Held bill · waiting on {jeff.fullName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Strata will re-check every 4 hours. When {jeff.fullName.split(' ')[0]} replies with the PO #, the bill returns to the matching queue automatically.
                        </div>
                    </div>
                    <button
                        onClick={nextStep}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        Continue to Tue payment run
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* Same-pattern vendors context */}
            <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Other install vendors on the same AP9 pattern</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PROJEX_VENDORS.filter(v => v.installVendor && v.id !== 'warehouse-by-design').slice(0, 3).map(v => (
                        <div key={v.id} className="rounded-lg border border-border bg-card px-3 py-2">
                            <div className="text-xs font-semibold text-foreground">{v.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{v.billsLast12mo} bills / 12mo · always sends w/o PO #</div>
                        </div>
                    ))}
                </div>
                <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" aria-hidden="true" />
                    Long-term · Strata proposes a coordinator-side &quot;install PO stub&quot; form so these bills stop landing without a #.
                </div>
            </div>

            <DataSourcesBar groups={dataGroups} label="Held bill · PM confirmation loop" />

            {/* Canonical AI Email Composer · slide-over */}
            <AIEmailComposer
                isOpen={composerOpen}
                onClose={() => setComposerOpen(false)}
                title="PM double-check email"
                subtitle={`To ${jeff.fullName} · ${jeff.role}`}
                icon={<Mail className="h-4 w-4 text-ai" aria-hidden="true" />}
                width="lg"
                presentation="centered"
                to={`${jeff.fullName} <${jeff.id}@projex-inc.com>`}
                initialSubject={DRAFT_SUBJECT}
                initialBody={DRAFT_BODY}
                badge={{ label: 'Draft by Strata', tone: 'ai', icon: <Sparkles className="h-2.5 w-2.5" aria-hidden="true" /> }}
                polishEnabled
                polishFn={customPolish}
                actionLabel="Send double-check"
                actionIcon={<Send className="h-3.5 w-3.5" aria-hidden="true" />}
                onAction={handleSend}
                resetLabel="Reset to Strata draft"
            />
        </div>
    )
}
