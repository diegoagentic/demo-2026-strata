import { BADGE_CLASSES, verticalColor } from '../../config/profiles/crm-data'
import type { BadgeColor } from '../../config/profiles/crm-data'

interface Props {
    vertical: string
    /** Override color (e.g. seed cards with custom color). Si no, derive del vertical. */
    color?: BadgeColor
    className?: string
}

// Chip semántico por vertical · usa tokens DS (emerald/amber/red/blue/violet/yellow)
// en lugar de hex hardcoded. Respeta regla DS · brand-300 nunca como text.
export default function VerticalChip({ vertical, color, className = '' }: Props) {
    const c = BADGE_CLASSES[color ?? verticalColor(vertical)]
    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${c.bg} ${c.fg} ${className}`}
        >
            {vertical}
        </span>
    )
}
