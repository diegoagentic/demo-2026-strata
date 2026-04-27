import { clsx } from 'clsx';

// ─── iPhone-style Device Frame ──────────────────────────────────────────────────
// Wraps children in a realistic phone bezel with status bar and Dynamic Island.

interface MobileDeviceFrameProps {
    children: React.ReactNode;
    className?: string;
}

export default function MobileDeviceFrame({ children, className }: MobileDeviceFrameProps) {
    return (
        <div className={clsx('flex justify-center', className)}>
            <div className="relative w-[375px] bg-background rounded-[3rem] border-[6px] border-zinc-800 dark:border-zinc-600 shadow-2xl shadow-black/30 dark:shadow-black/60 overflow-hidden">
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30">
                    <div className="w-[120px] h-[34px] bg-black rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-zinc-800 ring-1 ring-zinc-700" />
                    </div>
                </div>

                {/* Status Bar */}
                <div className="relative z-20 flex items-center justify-between px-8 pt-3 pb-1 bg-background">
                    <span className="text-[11px] font-semibold text-foreground">9:41</span>
                    <div className="flex items-center gap-1.5">
                        {/* Signal bars */}
                        <div className="flex items-end gap-[2px]">
                            {[6, 8, 10, 12].map((h, i) => (
                                <div key={i} className="w-[3px] rounded-sm bg-foreground" style={{ height: h }} />
                            ))}
                        </div>
                        {/* WiFi */}
                        <svg className="w-[15px] h-[11px] text-foreground" viewBox="0 0 15 11" fill="currentColor">
                            <path d="M7.5 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-3.18-2.12a4.5 4.5 0 016.36 0 .75.75 0 01-1.06 1.06 3 3 0 00-4.24 0 .75.75 0 01-1.06-1.06zm-2.83-2.83a8.25 8.25 0 0112.02 0 .75.75 0 01-1.06 1.06 6.75 6.75 0 00-9.9 0A.75.75 0 011.49 4.55z" />
                        </svg>
                        {/* Battery */}
                        <div className="flex items-center gap-[2px]">
                            <div className="w-[22px] h-[10px] rounded-[3px] border border-foreground/60 p-[1.5px]">
                                <div className="h-full w-[75%] rounded-[1.5px] bg-foreground" />
                            </div>
                            <div className="w-[1.5px] h-[4px] rounded-r-sm bg-foreground/60" />
                        </div>
                    </div>
                </div>

                {/* Content area */}
                <div className="min-h-[calc(100vh-12rem)] max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-micro bg-background">
                    {children}
                </div>

                {/* Home indicator */}
                <div className="flex justify-center py-2 bg-background">
                    <div className="w-[134px] h-[5px] rounded-full bg-foreground/30" />
                </div>
            </div>
        </div>
    );
}
