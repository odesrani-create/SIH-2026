import { useState } from "react";
import { ArrowLeft, Check, Circle, Dot, FileText, Upload, Users2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/data/demoData";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

const PIPELINE = ["Problem Identified", "Research", "Design", "Prototype", "Testing", "Pilot", "Deployment"];

export function ProjectWorkspacePage() {
  const { nav, goTo } = useAppState();
  const project = PROJECTS.find((p) => p.id === nav.params.id) ?? PROJECTS[0];
  const [docs, setDocs] = useState(project.documents);

  const activeStageIndex = Math.min(Math.floor((project.progress / 100) * PIPELINE.length), PIPELINE.length - 1);

  return (
    <div>
      <div className="border-b border-border bg-jic-forest-light/30 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button onClick={() => goTo("university-dashboard")} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-jic-forest">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>

          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-jic-forest">Project · {project.district}</p>
              <h1 className="mt-1 font-display text-2xl font-semibold text-jic-charcoal sm:text-3xl">{project.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{project.university}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card px-5 py-3 text-center shadow-elevation-xs">
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <p className="mt-0.5 text-sm font-semibold text-jic-forest">{project.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Progress */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-jic-charcoal">Overall Progress</span>
          <span className="font-semibold text-jic-forest">{project.progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-jic-forest transition-all" style={{ width: `${project.progress}%` }} />
        </div>
      </div>

      {/* Pipeline timeline */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-elevation-sm">
        <p className="text-sm font-semibold text-jic-charcoal">Timeline</p>
        <div className="mt-4 flex flex-wrap items-center gap-1">
          {PIPELINE.map((stage, i) => (
            <div key={stage} className="flex items-center gap-1">
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium",
                  i < activeStageIndex ? "bg-jic-forest text-white" : i === activeStageIndex ? "bg-jic-saffron-light text-jic-earth ring-1 ring-jic-earth/30" : "bg-muted text-muted-foreground"
                )}
              >
                {stage}
              </span>
              {i < PIPELINE.length - 1 && <span className="text-muted-foreground">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Milestones */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-sm">
          <p className="text-sm font-semibold text-jic-charcoal">Milestones</p>
          <div className="mt-4 space-y-3">
            {project.milestones.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                {m.status === "done" ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-jic-forest text-white">
                    <Check className="h-3 w-3" />
                  </span>
                ) : m.status === "active" ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-jic-earth text-jic-earth">
                    <Dot className="h-4 w-4" />
                  </span>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    m.status === "done" ? "text-jic-charcoal line-through decoration-jic-forest/40" : m.status === "active" ? "font-semibold text-jic-charcoal" : "text-muted-foreground"
                  )}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team & industry */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-sm">
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4 text-jic-forest" />
              <p className="text-sm font-semibold text-jic-charcoal">Team</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.team.map((m) => (
                <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-jic-forest-light px-2.5 py-1 text-xs font-medium text-jic-forest">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-jic-forest text-[9px] text-white">{m.name.charAt(0)}</span>
                  {m.name}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-jic-forest" />
              <p className="text-sm font-semibold text-jic-charcoal">Industry Partners</p>
            </div>
            {project.industryPartners.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {project.industryPartners.map((p) => (
                  <span key={p} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{p}</span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">No industry partner attached yet.</p>
            )}
            <Button variant="link" className="mt-2 h-auto p-0 text-jic-forest" onClick={() => goTo("industry")}>
              Find an industry partner
            </Button>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-elevation-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-jic-charcoal">Documents</p>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setDocs((d) => [...d, { name: `New_Document_${d.length + 1}.pdf`, type: "Report", date: new Date().toISOString().slice(0, 10) }])}
          >
            <Upload className="h-3.5 w-3.5" /> Upload
          </Button>
        </div>
        <div className="mt-4 divide-y divide-border">
          {docs.map((d) => (
            <div key={d.name} className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-2 text-sm text-jic-charcoal">
                <FileText className="h-4 w-4 text-jic-forest" /> {d.name}
              </span>
              <span className="text-xs text-muted-foreground">{d.type} · {d.date}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
