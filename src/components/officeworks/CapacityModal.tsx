/**
 * COMPONENT: CapacityModal
 * PURPOSE: Full Designer Capacity heatmap presented as a modal, decoupled
 *          from the funnel main view. Opens via "View capacity" button in
 *          OfficeworksFunnel header.
 *
 * USAGE:
 *   - Browse / forward planning (Felicia overview)
 *   - Independent of the Review modal (which has its own embedded
 *     CapacityHeatmap inside IntakeAssignPanel for in-context designer
 *     assignment)
 *
 * SHELL: identical pattern to other Officeworks modals (Headless UI Dialog
 *        + Transition + DialogPanel max-w-3xl + scrollable body + footer).
 */

import { Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, Users } from 'lucide-react'
import CapacityHeatmap from './shared/CapacityHeatmap'

interface CapacityModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function CapacityModal({ isOpen, onClose }: CapacityModalProps) {
    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[400]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-3xl transform rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">

                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/30 shrink-0">
                                <div className="h-8 w-8 rounded-full bg-info/15 flex items-center justify-center shrink-0">
                                    <Users className="h-4 w-4 text-info" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-bold text-foreground">Designer Capacity</div>
                                    <div className="text-[11px] text-muted-foreground">~30 designers · 3 regions · live utilization</div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                                    aria-label="Close"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Scrollable body — full heatmap */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                <CapacityHeatmap />
                            </div>

                            {/* Footer — close action */}
                            <div className="px-5 py-3.5 border-t border-border bg-card shrink-0 flex items-center justify-between gap-3">
                                <p className="text-[11px] text-muted-foreground">
                                    Click a designer card in the assignment flow to assign them to a project.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all"
                                >
                                    Close
                                </button>
                            </div>

                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
