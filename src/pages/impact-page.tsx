import { Rocket, Users, FolderKanban, Map, Building2, FlaskConical, Award, Sparkles, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { STATE_STATS, IMPACT_STORIES } from "@/data/demoData";
import { DomainVisual } from "@/components/shared/domain-visual";
import { CHALLENGES } from "@/data/demoData";

const METRICS = [
  { label: "Solutions Deployed", value: STATE_STATS.solutionsDeployed, icon: Rocket },
  { label: "People Impacted", value: STATE_STATS.peopleImpacted, icon: Users },
  { label: "Active Projects", value: STATE_STATS.activeProjects, icon: FolderKanban },
  { label: "Districts Reached", value: STATE_STATS.districts, icon: Map },
  { label: "Industry Collaborations", value: STATE_STATS.industryCollaborations, icon: Building2 },
  { label: "Research Publications", value: STATE_STATS.researchPublications, icon: FlaskConical },
  { label: "Patents", value: STATE_STATS.patents, icon: Award },
  { label: "Startups Created", value: STATE_STATS.startupsCreated, icon: Sparkles },
];

export function ImpactPage() {
  const storyDomains = ["Water", "Sanitation", "Healthcare"] as const;

  return (
    <div>
      <section className="border-b border-border bg-jic-deep py-20 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-jic-saffron">
            Public Impact Dashboard
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">Measure the Change.</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Every deployed solution began as a citizen's report. Here's the measurable difference the ecosystem has made
            so far.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.label} className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-jic-forest-light text-jic-forest">
                <m.icon className="h-4.5 w-4.5" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-jic-charcoal sm:text-3xl">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-jic-forest-light/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Success Stories" title="From local problem to lasting impact" />
          <div className="mt-10 space-y-6">
            {IMPACT_STORIES.map((story, i) => {
              const domain = CHALLENGES.find((c) => story.title.includes(c.title.split(" ")[0]))?.domain ?? storyDomains[i % 3];
              return (
                <div key={story.id} className="grid overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-[220px_1fr]">
                  <DomainVisual domain={domain} className="h-40 w-full sm:h-full" />
                  <div className="p-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-jic-forest">
                      <MapPin className="h-3.5 w-3.5" /> {story.district}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-semibold text-jic-charcoal">{story.title}</h3>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Before</p>
                        <p className="mt-1 text-sm text-muted-foreground">{story.before}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-jic-forest">Solution</p>
                        <p className="mt-1 text-sm text-jic-charcoal">{story.solution}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {story.impactPoints.map((p) => (
                        <span key={p} className="rounded-full bg-jic-saffron-light px-3 py-1 text-xs font-semibold text-jic-earth">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
