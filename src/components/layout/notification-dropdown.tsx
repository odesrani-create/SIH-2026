import { useState } from "react";
import { Bell, CheckCircle2, Users2, Building2, Flag, ThumbsUp, PartyPopper, ClipboardCheck } from "lucide-react";
import { NOTIFICATIONS } from "@/data/demoData";
import type { AppNotification } from "@/types";
import { cn } from "@/lib/utils";

const ICONS: Record<AppNotification["type"], React.ElementType> = {
  status: ClipboardCheck,
  assignment: CheckCircle2,
  team: Users2,
  industry: Building2,
  milestone: Flag,
  approval: ThumbsUp,
  pilot: PartyPopper,
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-jic-charcoal hover:bg-jic-forest-light"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-jic-saffron text-[10px] font-bold text-jic-deep">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-40 w-80 rounded-xl border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-jic-charcoal">Notifications</p>
              <button
                onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
                className="text-xs font-medium text-jic-forest hover:underline"
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.map((n) => {
                const Icon = ICONS[n.type];
                return (
                  <button
                    key={n.id}
                    onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left last:border-0 hover:bg-jic-forest-light/50",
                      !n.read && "bg-jic-forest-light/30"
                    )}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-jic-forest-light text-jic-forest">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-jic-charcoal">{n.title}</span>
                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-jic-saffron" />}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{n.description}</span>
                      <span className="mt-1 block text-[11px] text-muted-foreground/70">{n.time}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
