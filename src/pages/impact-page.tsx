import { Rocket, Users, FolderKanban, Map, Building2, FlaskConical, Award, Sparkles, MapPin, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { STATE_STATS, IMPACT_STORIES, CHALLENGES } from "@/data/demoData";
import { DomainVisual } from "@/components/shared/domain-visual";

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
      <section className="relative overflow-hidden bg-jic-deep py-24 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-texture-light opacity-40" />
        <div className="pointer-events-none absolute right-[-10%] top-[-20%] h-[32rem] w-[32rem] rounded-full bg-jic-saffron/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-jic-saffron">
            Public Impact Dashboard
          </span>
          <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.1] sm:text-6xl">
            Measure the change.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            Every deployed solution began as a citizen's report. Here's the measurable difference the ecosystem has
            made so far.
          </p>
        </div>
      </section>

      <section className="relative -mt-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 rounded-3xl border border-border bg-card p-3 shadow-elevation-xl sm:grid-cols-4 sm:gap-4 sm:p-5">
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className={`rounded-2xl p-4 text-center sm:p-5 ${i % 2 === 0 ? "bg-jic-forest-light/50" : ""}`}
            >
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-jic-forest/10 text-jic-forest">
                <m.icon className="h-4.5 w-4.5" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold tabular-nums text-jic-charcoal sm:text-3xl">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Success Stories" title="From local problem to lasting impact" />
        <div className="mt-10 space-y-5">
          {IMPACT_STORIES.map((story, i) => {
            const domain = CHALLENGES.find((c) => story.title.includes(c.title.split(" ")[0]))?.domain ?? storyDomains[i % 3];
            return (
              <div
                key={story.id}
                className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-elevation-sm sm:grid-cols-[280px_1fr]"
              >
                <div className="relative">
                  <DomainVisual domain={domain} className="h-44 w-full sm:h-full" />
                </div>
                <div className="p-6 sm:p-8">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-jic-forest">
                    <MapPin className="h-3.5 w-3.5" /> {story.district}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-semibold text-jic-charcoal sm:text-2xl">{story.title}</h3>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <div className="border-l-2 border-border pl-3.5">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Before</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{story.before}</p>
                    </div>
                    <div className="border-l-2 border-jic-forest pl-3.5">
                      <p className="text-xs font-bold uppercase tracking-wide text-jic-forest">Solution</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-jic-charcoal">{story.solution}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {story.impactPoints.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1 rounded-full bg-jic-saffron-light px-3 py-1 text-xs font-semibold text-jic-earth"
                      >
                        <ArrowUpRight className="h-3 w-3" /> {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
