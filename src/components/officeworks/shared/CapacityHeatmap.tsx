/**
 * COMPONENT: CapacityHeatmap
 * PURPOSE: Display ~28 designers grouped by 3 manager regions with
 *          color-coded utilization (CEO #2 SC5 pain point dramatization)
 *
 * Regions:
 *   - DC + Southern    (Felicia Miano-Poles · 10 designers)
 *   - MA / NY / NJ     (Rebecca Warren · 10 designers)
 *   - PA / Pittsburgh / Ancillary  (Kimberly Tucker · 10 designers)
 *
 * Utilization status:
 *   - Available  (< 60%)  · success
 *   - Limited    (60-85%) · warning
 *   - At capacity (>= 85%) · destructive
 *
 * VISUAL PATTERN (P49 refactor):
 *   - Cards are neutral (bg-card / border-border)
 *   - Status is a small chip with dot + label that carries the color
 *   - "Lead" and "prior MANATT" rendered as compact badges
 *
 * EXPORTS:
 *   - default: CapacityHeatmap component
 *   - DESIGNERS: full designer roster (also re-exported for filter sources)
 *   - type Designer
 *   - utilizationStatus / utilizationLabel helpers
 */

import { Users, CheckCircle2 } from 'lucide-react'

export type UtilizationStatus = 'available' | 'limited' | 'at-capacity'

export interface Designer {
    name: string
    region: 'dc' | 'ma' | 'pa'
    utilization: number
    priorMANATT?: boolean
    isLead?: boolean
}

export const DESIGNERS: Designer[] = [
    // DC + Southern (Felicia)
    { name: 'Felicia Miano-Poles', region: 'dc', utilization: 95, isLead: true, priorMANATT: true },
    { name: 'Sandra Park',         region: 'dc', utilization: 72 },
    { name: 'James O\'Brien',      region: 'dc', utilization: 88 },
    { name: 'Maya Patel',          region: 'dc', utilization: 45, priorMANATT: true },
    { name: 'Tom Hartford',        region: 'dc', utilization: 67 },
    { name: 'Lisa Cheng',          region: 'dc', utilization: 82 },
    { name: 'David Ruiz',          region: 'dc', utilization: 59 },
    { name: 'Ana Sokolov',         region: 'dc', utilization: 91 },
    { name: 'Mike Davis',          region: 'dc', utilization: 38 },
    { name: 'Priya Iyer',          region: 'dc', utilization: 75 },
    // MA / NY / NJ (Rebecca)
    { name: 'Rebecca Warren',      region: 'ma', utilization: 89, isLead: true },
    { name: 'John Chen',           region: 'ma', utilization: 64 },
    { name: 'Sara Bennett',        region: 'ma', utilization: 55 },
    { name: 'Marco Russo',         region: 'ma', utilization: 78 },
    { name: 'Emily Stone',         region: 'ma', utilization: 92 },
    { name: 'Raj Kumar',           region: 'ma', utilization: 41 },
    { name: 'Hannah Liu',          region: 'ma', utilization: 70 },
    { name: 'Pete Falco',          region: 'ma', utilization: 83 },
    { name: 'Nora Singh',          region: 'ma', utilization: 49 },
    { name: 'Devin Hayes',         region: 'ma', utilization: 66 },
    // PA + Pittsburgh + Ancillary (Kimberly)
    { name: 'Kimberly Tucker',     region: 'pa', utilization: 65, isLead: true },
    { name: 'Olivia Berg',         region: 'pa', utilization: 71 },
    { name: 'Connor Walsh',        region: 'pa', utilization: 84 },
    { name: 'Yasmin El-Sayed',     region: 'pa', utilization: 47 },
    { name: 'Tyler Brooks',        region: 'pa', utilization: 90 },
    { name: 'Grace Park',          region: 'pa', utilization: 58 },
    { name: 'Eli Johnson',         region: 'pa', utilization: 76 },
    { name: 'Megan Reed',          region: 'pa', utilization: 39 },
    { name: 'Vincent Lo',          region: 'pa', utilization: 68 },
    { name: 'Sofia Marini',        region: 'pa', utilization: 87 },
]

export const REGION_LABELS = {
    dc: { label: 'DC + Southern', manager: 'Felicia Miano-Poles' },
    ma: { label: 'MA / NY / NJ', manager: 'Rebecca Warren' },
    pa: { label: 'PA / Pittsburgh / Ancillary', manager: 'Kimberly Tucker' },
} as const

export function utilizationStatus(u: number): UtilizationStatus {
    if (u >= 85) return 'at-capacity'
    if (u >= 60) return 'limited'
    return 'available'
}

export function utilizationLabel(s: UtilizationStatus): string {
    if (s === 'at-capacity') return 'At capacity'
    if (s === 'limited') return 'Limited'
    return 'Available'
}

function chipClass(s: UtilizationStatus): string {
    if (s === 'at-capacity') return 'bg-destructive/15 text-destructive border-destructive/30'
    if (s === 'limited') return 'bg-warning/15 text-warning border-warning/30'
    return 'bg-success/15 text-success border-success/30'
}

function dotClass(s: UtilizationStatus): string {
    if (s === 'at-capacity') return 'bg-destructive'
    if (s === 'limited') return 'bg-warning'
    return 'bg-success'
}

interface Props {
    /** Optional subset of designers · falls back to full DESIGNERS roster when undefined */
    designers?: Designer[]
    /** Highlight a specific designer (used by sc1.0 for Kimberly's assignment recommendation) */
    highlightName?: string
    /** When set, designer cards become clickable; calls back with selected name */
    onSelect?: (name: string) => void
    /** Name currently selected (highlighted with check icon + ring) */
    selectedName?: string | null
}

export default function CapacityHeatmap({ designers, highlightName, onSelect, selectedName }: Props) {
    const source = designers ?? DESIGNERS
    const regions: Array<'dc' | 'ma' | 'pa'> = ['dc', 'ma', 'pa']
    const isInteractive = !!onSelect

    return (
        <div className="space-y-5">
            {regions.map(region => {
                const regionDesigners = source.filter(d => d.region === region)
                if (regionDesigners.length === 0) return null

                // Region totals from the full roster so the "X of Y" makes sense when filtering
                const regionTotal = DESIGNERS.filter(d => d.region === region).length
                const showingCount = regionDesigners.length
                const showingNote = showingCount === regionTotal
                    ? `${regionTotal} designers`
                    : `${showingCount} of ${regionTotal}`

                return (
                    <div key={region} className="space-y-2.5">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold text-foreground">
                                {REGION_LABELS[region].label}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                · {REGION_LABELS[region].manager} · {showingNote}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {regionDesigners.map(d => {
                                const isHighlighted = highlightName === d.name
                                const isSelected = selectedName === d.name
                                const status = utilizationStatus(d.utilization)
                                return (
                                    <button
                                        key={d.name}
                                        type="button"
                                        disabled={!isInteractive}
                                        onClick={isInteractive ? () => onSelect!(d.name) : undefined}
                                        className={`relative text-left rounded-lg border bg-card border-border p-2.5 text-xs transition-all w-full ${
                                            isHighlighted ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                                        } ${
                                            isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md' : ''
                                        } ${
                                            isInteractive ? 'cursor-pointer hover:border-foreground/30 hover:shadow-sm hover:-translate-y-px' : 'cursor-default'
                                        }`}
                                    >
                                        {isSelected && (
                                            <CheckCircle2 className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />
                                        )}
                                        <div className="font-semibold text-foreground truncate flex items-center gap-1.5 pr-4">
                                            <span className="truncate">{d.name}</span>
                                            {d.isLead && (
                                                <span className="text-[8px] uppercase tracking-wide font-bold bg-foreground/10 text-foreground/70 rounded px-1 py-0.5 shrink-0">
                                                    Lead
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className="font-mono tabular-nums text-foreground">{d.utilization}%</span>
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${chipClass(status)}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${dotClass(status)}`} />
                                                {utilizationLabel(status)}
                                            </span>
                                        </div>
                                        {d.priorMANATT && (
                                            <div className="mt-1.5">
                                                <span className="inline-block text-[9px] uppercase tracking-wide font-bold bg-info/10 text-info border border-info/20 rounded px-1.5 py-0.5">
                                                    Prior MANATT
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
