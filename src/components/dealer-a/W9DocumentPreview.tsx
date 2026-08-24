/**
 * COMPONENT: W9DocumentPreview (Dealer A)
 * PURPOSE: W-9 form-like mock preview · usa MockDocumentPreview como shell y
 *          renderea el layout específico del IRS W-9 con data del W9Record
 *          (legal name · entity type checkboxes · TIN masked · address ·
 *          signature). Bounding-box overlay tint highlights fields OCR
 *          extractable cuando `highlightExtractedFields` está true (usado
 *          por p2.2 OCR review).
 *
 * DS TOKENS: bg-background · bg-ai-light · border-border · text-foreground ·
 *            text-muted-foreground · bg-success/10 · text-success
 *
 * USED BY: F2_p21_VendorIntakeScene · F2_p22_W9OcrScene (highlightExtracted)
 * REUSE FROM: MockDocumentPreview.tsx (generic shell)
 */

import { Sparkles, ShieldCheck } from 'lucide-react'
import MockDocumentPreview from './MockDocumentPreview'
import type { W9Record } from '../../config/profiles/dealer-a-data/w9Records'

interface W9DocumentPreviewProps {
    isOpen: boolean
    onClose: () => void
    record: W9Record
    /** When true, overlay a tint on fields that OCR extracted (visual cue for p2.2). */
    highlightExtractedFields?: boolean
}

export default function W9DocumentPreview({ isOpen, onClose, record, highlightExtractedFields = false }: W9DocumentPreviewProps) {
    const legalName = record.fields.find(f => f.key === 'legal-name')?.value ?? record.vendorName
    const entityType = record.fields.find(f => f.key === 'entity-type')?.value ?? ''
    const tin = record.fields.find(f => f.key === 'ein')?.value ?? ''
    const address = record.fields.find(f => f.key === 'address')?.value ?? ''
    const signed = record.signedDate

    const boxCls = highlightExtractedFields
        ? 'bg-ai-light/60 ring-1 ring-inset ring-ai/40'
        : 'bg-background'

    return (
        <MockDocumentPreview
            isOpen={isOpen}
            onClose={onClose}
            fileName={record.fileName}
            headerBadge={{ label: `Signed · ${signed}`, tone: 'success' }}
            subtitle={`Preview · attached to vendor request · 312 KB · ${highlightExtractedFields ? 'OCR extraction overlay' : 'source document'}`}
            footer={
                <div className="flex items-center gap-3 text-[11px]">
                    {highlightExtractedFields ? (
                        <span className="inline-flex items-center gap-1.5 text-ai font-semibold">
                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                            {record.fields.length} fields extracted by OCR · tinted areas
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-success font-semibold">
                            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            Signed &lt; 12 mo · matches Jacob&apos;s compliance rule
                        </span>
                    )}
                    <span className="ml-auto text-muted-foreground italic">
                        Mock document · adapted from officeworks/PDFPreviewModal pattern
                    </span>
                </div>
            }
        >
            <div className="max-w-2xl mx-auto bg-background border border-border rounded-lg shadow-sm p-8 font-sans text-foreground text-sm">
                {/* Form header */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-foreground">
                    <div>
                        <div className="text-xs font-mono text-muted-foreground">Form</div>
                        <div className="text-3xl font-bold tracking-tight">W-9</div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                            (Rev. October 2018) · Department of the Treasury · Internal Revenue Service
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold">Request for Taxpayer</div>
                        <div className="text-sm font-bold">Identification Number and Certification</div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                            Give Form to the requester. Do not send to the IRS.
                        </div>
                    </div>
                </div>

                {/* Line 1 · Legal name */}
                <div className="mt-4">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">1  Name (as shown on your income tax return)</div>
                    <div className={`mt-1 p-2 rounded border border-border ${boxCls} text-[13px] font-medium`}>
                        {legalName}
                    </div>
                </div>

                {/* Line 2 · Business name */}
                <div className="mt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">2  Business name / disregarded entity name (if different)</div>
                    <div className="mt-1 p-2 rounded border border-border bg-background text-[13px] text-muted-foreground italic">
                        —
                    </div>
                </div>

                {/* Line 3 · Federal tax classification */}
                <div className="mt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">3  Check appropriate box for federal tax classification</div>
                    <div className={`mt-1 p-2 rounded border border-border ${boxCls} grid grid-cols-2 gap-1.5 text-[11px]`}>
                        {[
                            { label: 'Individual/sole proprietor', on: entityType.includes('Sole') },
                            { label: 'C Corporation',              on: entityType.includes('C-Corp') },
                            { label: 'S Corporation',              on: entityType.includes('S-Corp') },
                            { label: 'Partnership',                on: entityType.includes('Partnership') },
                            { label: 'Trust/estate',               on: false },
                            { label: 'Limited liability company',  on: entityType.includes('LLC') },
                        ].map(cb => (
                            <label key={cb.label} className="flex items-center gap-1.5">
                                <span className={`inline-flex h-3 w-3 items-center justify-center rounded-sm border ${cb.on ? 'bg-foreground border-foreground' : 'border-border bg-background'}`}>
                                    {cb.on && <span className="text-[10px] leading-none text-background">✓</span>}
                                </span>
                                <span className={cb.on ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                                    {cb.label}
                                </span>
                            </label>
                        ))}
                    </div>
                    {entityType && (
                        <div className="mt-1 text-[10px] text-muted-foreground italic pl-2">
                            Extracted classification · <span className="text-foreground font-semibold">{entityType}</span>
                        </div>
                    )}
                </div>

                {/* Line 5 · Address */}
                <div className="mt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">5  Address (number, street, apt. or suite)</div>
                    <div className={`mt-1 p-2 rounded border border-border ${boxCls} text-[13px]`}>
                        {address}
                    </div>
                </div>

                {/* Part I · TIN */}
                <div className="mt-5 pt-4 border-t-2 border-foreground">
                    <div className="text-sm font-bold">Part I · Taxpayer Identification Number (TIN)</div>
                    <div className={`mt-2 p-3 rounded border border-border ${boxCls}`}>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Employer identification number</div>
                        <div className="mt-1 text-2xl font-mono tracking-widest text-foreground">
                            {tin}
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground italic">
                            Masked for compliance display · full value stored in Strata DB (encrypted)
                        </div>
                    </div>
                </div>

                {/* Part II · Certification */}
                <div className="mt-5 pt-4 border-t-2 border-foreground">
                    <div className="text-sm font-bold">Part II · Certification</div>
                    <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                        Under penalties of perjury, I certify that: (1) the number shown on this form is my correct taxpayer identification number,
                        (2) I am not subject to backup withholding, (3) I am a U.S. citizen or other U.S. person, and (4) the FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.
                    </p>

                    <div className="grid grid-cols-[2fr_1fr] gap-3 mt-4">
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Signature of U.S. person</div>
                            <div className={`mt-1 p-2 rounded border border-border ${boxCls} h-14 flex items-center`}>
                                <span className="italic text-[18px] text-foreground" style={{ fontFamily: '"Brush Script MT", cursive' }}>
                                    M. Ramirez
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date</div>
                            <div className={`mt-1 p-2 rounded border border-border ${boxCls} h-14 flex items-center text-[13px] font-mono`}>
                                {signed}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MockDocumentPreview>
    )
}
