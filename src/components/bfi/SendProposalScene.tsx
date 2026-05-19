/**
 * COMPONENT: SendProposalScene  (a1.2b3)
 * PURPOSE: After Quote Tool product pricing (a1.2b) and WIG labor quote (a1.2b2),
 *          Lauren has everything she needs. She generates the formal proposal
 *          (product + labor) and sends it to NYC Dept. of Education. The client
 *          will return the PO in the next step (a1.2c).
 */

import { useState } from 'react'
import { CheckCircle2, FileText, Send, X } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

export default function SendProposalScene() {
    const { nextStep } = useDemo()
    const [sent,      setSent]      = useState(false)
    const [fromEmail, setFromEmail] = useState('lauren.demarco@bfifurniture.com')

    const handleSend = () => {
        setSent(true)
        setTimeout(() => nextStep(), 1200)
    }

    return (
        <div className="max-w-2xl mx-auto">

            <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">

                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
                    <div className="h-8 w-8 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-black text-success">DOE</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-foreground truncate">NYC Dept. of Education</div>
                        <div className="text-[10px] text-muted-foreground">Procurement Office</div>
                    </div>
                    <button disabled className="p-1 rounded-lg text-muted-foreground/40 shrink-0" aria-label="Close">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Metadata */}
                <div className="px-5 pt-4 pb-3 border-b border-border/60 space-y-1.5">
                    <div className="text-[13px] font-bold text-foreground leading-snug">
                        Formal Proposal · DOE-2847
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-muted-foreground w-7 shrink-0">From:</span>
                            <input value={fromEmail} onChange={e => setFromEmail(e.target.value)} disabled={sent}
                                className="flex-1 bg-transparent outline-none text-foreground font-medium border-b border-transparent hover:border-border/60 focus:border-primary/50 transition-colors disabled:opacity-60 min-w-0" />
                        </div>
                        {[
                            { label: 'To',   value: 'nycdoe-procurement@schools.nyc.gov' },
                            { label: 'Date', value: 'May 6, 2026 · 10:45 AM' },
                        ].map(r => (
                            <div key={r.label} className="flex items-center gap-2 text-[10px]">
                                <span className="text-muted-foreground w-7 shrink-0">{r.label}:</span>
                                <span className="text-foreground font-medium truncate">{r.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-3">
                    <div className="text-[12px] text-foreground leading-relaxed space-y-3">
                        <p>Good morning,</p>
                        <p>
                            Please find attached our formal proposal for project{' '}
                            <span className="font-semibold">DOE-2847</span>. Pricing has been
                            validated against the CoNY contract through Quote Tool (one correction
                            applied: Filing Units $8,100 → $7,560 per T-code) and the WIG labor
                            schedule has been compiled and confirmed.
                        </p>

                        {/* Proposal summary */}
                        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5 text-[11px]">
                            <p className="font-bold text-foreground text-[10px] uppercase tracking-wide">Proposal Summary</p>
                            {[
                                { label: 'Contract',        value: 'CoNY · City of New York' },
                                { label: 'Price corrected', value: 'Filing Units $8,100 → $7,560 per T-code' },
                                { label: 'Adjusted total',  value: '$235,560' },
                                { label: 'CoNY discount',   value: '−$88,335 (37.5%)' },
                                { label: 'Labor (WIG)',     value: 'Teamsters 24h · Carpenters 50h · OT 8h' },
                                { label: 'Delivery window', value: 'May 14–21, 2026 (30 days)' },
                                { label: 'Install crew',    value: '3 technicians · Open Area · Lounge · Storage Room' },
                            ].map(r => (
                                <div key={r.label} className="flex items-start gap-2">
                                    <span className="text-muted-foreground w-28 shrink-0">{r.label}:</span>
                                    <span className="font-medium text-foreground">{r.value}</span>
                                </div>
                            ))}
                        </div>

                        <p>
                            The updated SIF, Quote Tool validation, and WIG labor quote are
                            attached for your records. Please review and confirm so we can
                            proceed with the Purchase Order.
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                            — Lauren DeMarco<br />BFI Furniture · CoNY Account Manager
                        </p>
                    </div>

                    {/* Attachment chips */}
                    <div className="flex flex-col gap-1.5">
                        {[
                            { name: 'DOE-2847-SIF-updated.pdf',     label: 'Updated SIF' },
                            { name: 'QuoteTool-DOE-2847.pdf',       label: 'Quote Tool'  },
                            { name: 'WIG-Labor-Quote-DOE-2847.pdf', label: 'Labor Quote' },
                        ].map(a => (
                            <div key={a.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border text-[11px] text-foreground font-medium">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {a.name}
                                <span className="text-[9px] text-muted-foreground ml-1">· {a.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Sent confirmation */}
                    {sent && (
                        <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <div className="font-bold text-foreground">Proposal sent · NYC DOE · May 6 · 10:45 AM</div>
                                <div className="text-muted-foreground mt-0.5">Awaiting client review and Purchase Order issuance</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-5 pb-4">
                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                </div>

                {/* Footer CTA */}
                {!sent && (
                    <div className="px-5 py-3.5 border-t border-border bg-card">
                        <button
                            onClick={handleSend}
                            className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                        >
                            <Send className="h-3.5 w-3.5" />
                            Send Proposal to NYC DOE →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
