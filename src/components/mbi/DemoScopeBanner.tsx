/**
 * COMPONENT: DemoScopeBanner
 * PURPOSE: Apr 23 stakeholder ask (Matt): "interactive prototype with AP
 *          + AR flow. Doesn't have to be functional — the goal is for MBI
 *          to understand the solution and engage."
 *
 *          The "Prototype" badge alone reads as ambiguous (prototype of a
 *          finished product? demo prototype?). This banner makes the scope
 *          explicit so the audience doesn't expect a working backend or
 *          ask why nothing persists.
 *
 *          Compact one-line strip · sits above the wizard / below the
 *          module header. Same component reused across Overview + the 3
 *          module pages so the framing stays consistent.
 *
 * USED BY: MBIOverviewPage · MBIAccountingPage · MBIQuotesPage · MBIDesignPage
 *
 * DS TOKENS: bg-info/5 · border-info/30 · text-foreground/muted
 */

import { Info } from 'lucide-react'

export default function DemoScopeBanner() {
    return (
        <div className="bg-info/5 dark:bg-info/10 border border-info/30 rounded-xl px-4 py-2.5 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
            <div className="text-[11px] text-foreground leading-snug">
                <strong className="text-foreground">Prototype · interactive but not functional.</strong>
                <span className="text-muted-foreground"> Click around to explore — the goal is for MBI to see the solution shape and engage with it. No backend, no real data writes, no production wiring yet.</span>
            </div>
        </div>
    )
}
