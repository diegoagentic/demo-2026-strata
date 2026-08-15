/**
 * COMPONENT: APInstallVendorExceptionScene (Projex · p1.4)
 * PURPOSE: Warehouse by Design install-vendor invoice arrives with project name
 *          only (no PO #) · classic AP9 pattern (Clear Space + Digital Interior
 *          do the same). Strata drafts the PM double-check email to Jeff verbatim:
 *          "Which PO does this bill match? + confirm work complete + approved to
 *          pay?" · Daniel reviews the draft · one click sends · Strata queues
 *          bill as "Held · awaiting PM confirmation" until Jeff responds.
 *
 * DS TOKENS: bg-card · bg-destructive/10 + text-destructive (held) · bg-primary
 *            + text-primary-foreground · bg-ai-light + text-ai · border-border
 *
 * SOURCE OF TRUTH: _SOT_projex.md §12a · Jacob names verbatim · AP9 pattern
 * REUSE FROM: shared/AIEmailComposer.tsx · bfi/MichaelApprovalScene.tsx (Send flash)
 */

import { useState } from 'react'
import {
    Sparkles, Send, CheckCircle2, Clock, AlertTriangle, FileText,
    Building2, Mail, Wand2, ChevronRight, ArrowRight,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_BILLS_OVERNIGHT } from '../../../config/profiles/projex-data/bills'
import { PROJEX_VENDORS } from '../../../config/profiles/projex-data/vendors'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'

const HELD_BILL_ID = 'PJX-BILL-8484'

// Jeff's verbatim "PM double-check" template (Jacob's exact phrase)
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

// AI polish tools (mirror shared/AIEmailComposer options)
type Tone = 'original' | 'friendlier' | 'firmer' | 'shorter'
const TONES: { id: Tone; label: string; body: string }[] = [
    { id: 'original',   label: 'Original', body: DRAFT_BODY },
    {
        id: 'friendlier',
        label: 'Friendlier',
        body: `Hey Jeff — hope the Denver Financial install wrapped up OK!

We got a Warehouse by Design invoice on the AP inbox this morning with just the project name, no PO # on the vendor's side. Quick sanity check before I save it?

  • Which PO does this one match?
  • Are the crews done on your end?
  • Green light to pay?

Bill · WBD-2026-0812 · $3,200.00

Any time today works — appreciate it!
Daniel`,
    },
    {
        id: 'firmer',
        label: 'Firmer',
        body: `Jeff,

Warehouse by Design invoice WBD-2026-0812 ($3,200) landed in AP with project name only. Per our policy, I cannot post an install-vendor bill without PO # confirmation.

Please confirm today:
  1. PO #
  2. Work complete
  3. Approved to pay

Bill is held until I hear back.

Daniel`,
    },
    {
        id: 'shorter',
        label: 'Shorter',
        body: `Hi Jeff — WBD-2026-0812 ($3,200) arrived without a PO #. Which PO does it match, is the install complete, and are we clear to pay? Held until you confirm. Thanks — Daniel`,
    },
]

export default function APInstallVendorExceptionScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const bill = PROJEX_BILLS_OVERNIGHT.find(b => b.id === HELD_BILL_ID)
    const vendor = PROJEX_VENDORS.find(v => v.id === 'warehouse-by-design')
    const jeff = PROJEX_PERSONAS.jeff
    const daniel = PROJEX_PERSONAS.daniel

    const [tone, setTone] = useState<Tone>('original')
    const activeTone = TONES.find(t => t.id === tone) ?? TONES[0]

    const [subject] = useState(DRAFT_SUBJECT)
    const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent'>('idle')

    const handleSend = () => {
        if (sendState !== 'idle') return
        setSendState('sending')
        pauseAwareTimeout(() => setSendState('sent'), 800)
    }

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
                    Install-vendor bill without PO # · PM double-check email to {jeff.fullName.split(' ')[0]}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Classic <strong className="text-foreground">AP9</strong> pattern · install vendors (Warehouse by Design · Clear Space · Digital Interior) send bills with project name only. {daniel.fullName.split(' ')[0]} sends a PM double-check email · bill stays held until {jeff.fullName.split(' ')[0]} confirms.
                </p>
            </div>

            {/* Layout · held bill (left) + email composer (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4 items-start">

                {/* Held bill card */}
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 overflow-hidden">
                    <div className="px-4 py-3 bg-destructive/10 border-b border-destructive/20 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-destructive">
                            Held · PM double-check
                        </span>
                        <span className="ml-auto text-[10px] font-mono text-muted-foreground">AP9</span>
                    </div>
                    <div className="p-4 space-y-3 text-sm">
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Vendor bill</div>
                            <div className="text-foreground font-semibold mt-0.5">{bill?.vendorInvoiceNumber}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">{bill?.id}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-destructive/20">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Vendor</div>
                                <div className="text-xs text-foreground font-medium">{vendor?.name}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Install labor · AP9</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Amount</div>
                                <div className="text-xs text-foreground font-bold tabular-nums">
                                    ${bill?.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Project</div>
                                <div className="text-xs text-foreground font-medium">{bill?.projectName}</div>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-destructive/20 flex items-start gap-2 text-[11px]">
                            <FileText className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                            <div>
                                <div className="text-foreground font-semibold">No PO # on vendor's copy</div>
                                <div className="text-muted-foreground mt-0.5">{bill?.heldReason}</div>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-destructive/20">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">PM contact</div>
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-primary/15 text-foreground flex items-center justify-center text-[10px] font-bold">
                                    {jeff.initials}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs text-foreground font-semibold">{jeff.fullName}</div>
                                    <div className="text-[10px] text-muted-foreground">{jeff.role}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email composer */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">PM double-check email</span>
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold bg-ai-light text-ai rounded px-1.5 py-0.5">
                            <Sparkles className="h-3 w-3" aria-hidden="true" /> Draft by Strata
                        </span>
                    </div>

                    {/* Envelope */}
                    <div className="px-4 py-3 border-b border-border space-y-1.5 text-[12px]">
                        <div className="grid grid-cols-[60px_1fr] gap-x-2 items-center">
                            <span className="text-muted-foreground">From</span>
                            <span className="text-foreground">{daniel.fullName} &lt;{daniel.id}@projex-inc.com&gt;</span>
                        </div>
                        <div className="grid grid-cols-[60px_1fr] gap-x-2 items-center">
                            <span className="text-muted-foreground">To</span>
                            <span className="text-foreground">{jeff.fullName} &lt;{jeff.id}@projex-inc.com&gt;</span>
                        </div>
                        <div className="grid grid-cols-[60px_1fr] gap-x-2 items-center">
                            <span className="text-muted-foreground">Cc</span>
                            <span className="text-foreground">ap@projex-inc.com</span>
                        </div>
                        <div className="grid grid-cols-[60px_1fr] gap-x-2 items-start">
                            <span className="text-muted-foreground">Subject</span>
                            <span className="text-foreground font-semibold">{subject}</span>
                        </div>
                    </div>

                    {/* AI polish toolbar */}
                    <div className="px-4 py-2.5 border-b border-border bg-muted/10 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mr-2">
                            <Wand2 className="h-3 w-3" aria-hidden="true" /> Polish
                        </span>
                        {TONES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTone(t.id)}
                                className={`
                                    text-[11px] font-semibold px-2 py-1 rounded transition-colors
                                    ${tone === t.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'}
                                `}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Body */}
                    <div className="p-4">
                        <pre className="text-[12px] text-foreground font-sans whitespace-pre-wrap leading-relaxed">
                            {activeTone.body}
                        </pre>
                    </div>

                    {/* Send footer */}
                    <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                            Bill will be held until {jeff.fullName.split(' ')[0]} replies with the PO #.
                        </span>
                        {sendState === 'idle' && (
                            <button
                                onClick={handleSend}
                                className="ml-auto inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                Send double-check
                            </button>
                        )}
                        {sendState === 'sending' && (
                            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-ai animate-pulse">
                                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                Sending…
                            </span>
                        )}
                        {sendState === 'sent' && (
                            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-success animate-in fade-in duration-300">
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                Sent · bill held for PM confirmation
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Timer strip · shown after send */}
            {sendState === 'sent' && (
                <div className="rounded-xl border border-warning/40 bg-warning/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Clock className="h-5 w-5 text-warning" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">Held bill · waiting on {jeff.fullName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Strata will re-check every 4 hours. When Jeff replies with the PO #, the bill returns to the matching queue automatically.
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

            {/* Same-pattern vendors */}
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
                    Long-term · Strata proposes a coordinator-side "install PO stub" form so these bills stop landing without a #.
                </div>
            </div>

            <DataSourcesBar groups={dataGroups} label="Held bill · PM confirmation loop" />
        </div>
    )
}
