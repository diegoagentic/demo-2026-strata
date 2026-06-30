import type { BadgeColor } from './types'
import type { Vertical } from './enums'

// Mapping vertical → semantic color key · usado por VerticalChip y badges.
export const VERT_COLOR: Record<string, BadgeColor> = {
    'Financial': 'orange',
    'Government': 'green',
    'Healthcare': 'red',
    'Technology': 'blue',
    'Legal': 'purple',
    'Commercial / Corporate': 'blue',
    'Education (Higher Ed)': 'yellow',
    'Education (K-12)': 'yellow',
    'Hospitality': 'orange',
    'Architectural Interiors': 'purple',
    'Life Sciences / Lab': 'green',
    'Non-Profit / NGO': 'yellow',
}

// DS-compliant color classes per BadgeColor key · respeta regla brand-300 solo
// como bg · usa semantic tokens (emerald/amber/red/blue/violet/yellow) en lugar
// de los hex hardcoded del standalone.
export const BADGE_CLASSES: Record<BadgeColor, { bg: string; fg: string }> = {
    green: { bg: 'bg-emerald-500/15', fg: 'text-emerald-700 dark:text-emerald-400' },
    orange: { bg: 'bg-amber-500/15', fg: 'text-amber-700 dark:text-amber-400' },
    yellow: { bg: 'bg-yellow-500/15', fg: 'text-yellow-800 dark:text-yellow-400' },
    blue: { bg: 'bg-blue-500/15', fg: 'text-blue-700 dark:text-blue-400' },
    purple: { bg: 'bg-violet-500/15', fg: 'text-violet-700 dark:text-violet-400' },
    red: { bg: 'bg-red-500/15', fg: 'text-red-700 dark:text-red-400' },
}

export function verticalColor(vertical: Vertical | string): BadgeColor {
    return VERT_COLOR[vertical] ?? 'blue'
}
