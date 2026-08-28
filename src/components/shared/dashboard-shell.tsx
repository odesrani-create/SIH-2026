import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DashboardNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export function DashboardShell({
  title,
  subtitle,
  navItems,
  activeId,
  onSelect,
  children,
}: {
  title: string;
  subtitle?: string;
  navItems: DashboardNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 rounded-2xl border border-jic-forest/15 bg-gradient-to-r from-jic-forest-light/60 via-jic-forest-light/25 to-transparent px-5 py-5 sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-jic-charcoal sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-2 lg:pb-2 lg:shadow-elevation-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex shrink-0 items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-200 lg:w-full lg:shrink",
                  activeId === item.id
                    ? "bg-jic-deep text-jic-cream shadow-elevation-sm"
                    : "text-jic-charcoal/75 hover:bg-jic-forest-light hover:text-jic-forest"
                )}
              >
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <item.icon className="h-4 w-4" /> {item.label}
                </span>
                {item.badge ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      activeId === item.id ? "bg-white/20 text-white" : "bg-jic-forest-light text-jic-forest"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
