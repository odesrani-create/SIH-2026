import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <span
          className={cn(
            "eyebrow-mono mb-3 inline-flex items-center gap-2 uppercase",
            light ? "text-jic-saffron" : "text-jic-forest"
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "text-balance font-display text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl",
          light ? "text-white" : "text-jic-charcoal"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-3.5 text-balance text-base leading-relaxed", light ? "text-white/75" : "text-muted-foreground")}>
          {description}
        </p>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ElementType;
  tone?: "default" | "dark";
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border p-5 transition-colors duration-300",
        tone === "dark"
          ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
          : "border-border bg-card hover:border-jic-forest/30"
      )}
    >
      <div className="flex items-start justify-between">
        <p className={cn("text-sm font-medium", tone === "dark" ? "text-white/70" : "text-muted-foreground")}>
          {label}
        </p>
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
              tone === "dark" ? "bg-white/10 text-jic-saffron" : "bg-jic-forest-light text-jic-forest"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className={cn("mt-2 font-display text-3xl font-semibold tabular-nums", tone === "dark" ? "text-white" : "text-jic-charcoal")}>
        {value}
      </p>
      {hint && <p className={cn("mt-1 text-xs", tone === "dark" ? "text-white/60" : "text-muted-foreground")}>{hint}</p>}
    </div>
  );
}
