import { useState } from "react";
import { Handshake, TrendingUp, Building2, CheckCircle2, Factory } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SectionHeading, StatCard } from "@/components/shared/section-heading";
import { PROJECTS, INDUSTRY_PARTNERS } from "@/data/demoData";

export function IndustryPage() {
  const [partnered, setPartnered] = useState<string[]>([]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-jic-forest-light/40">
        <div className="absolute inset-0 bg-grid-texture opacity-[0.25]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-jic-forest/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-jic-forest shadow-elevation-sm">
            <Factory className="h-3.5 w-3.5" /> Industry &amp; Startups
          </span>
          <SectionHeading
            className="mt-5 max-w-2xl"
            title="Fund, mentor and scale student-built solutions"
            description="Discover challenge projects that match your technology area and support them through mentorship, funding, hardware, or deployment."
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Tabs defaultValue="discover">
          <TabsList>
            <TabsTrigger value="discover">Discover Projects</TabsTrigger>
            <TabsTrigger value="partners">Our Partners</TabsTrigger>
            <TabsTrigger value="dashboard">Industry Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.map((p) => {
                const isPartnered = partnered.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-elevation-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevation-md"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-jic-forest">
                      {p.domain} · {p.district}
                    </p>
                    <p className="mt-2 font-display text-base font-semibold leading-snug text-jic-charcoal">{p.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{p.university}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {["Mentorship", "Funding", "Hardware"].map((s) => (
                        <span key={s} className="rounded-full bg-jic-forest-light px-2 py-0.5 text-[11px] font-medium text-jic-forest">
                          {s}
                        </span>
                      ))}
                    </div>
                    <Button
                      className="mt-4 gap-1.5 bg-jic-deep text-jic-cream hover:bg-jic-deep/90 disabled:opacity-70"
                      disabled={isPartnered}
                      onClick={() => setPartnered((arr) => [...arr, p.id])}
                    >
                      {isPartnered ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Partnership Requested
                        </>
                      ) : (
                        <>
                          <Handshake className="h-4 w-4" /> Partner With Project
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="partners" className="mt-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {INDUSTRY_PARTNERS.map((p) => (
                <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-elevation-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-jic-forest-light text-xs font-bold text-jic-forest">
                    {p.logo}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-jic-charcoal">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.technologyArea} · {p.district}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.support.map((s) => (
                      <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs font-semibold text-jic-forest">{p.activeCollaborations} active collaborations</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Active Collaborations" value={6} icon={Handshake} />
              <StatCard label="Funding Committed" value="₹42L" icon={TrendingUp} />
              <StatCard label="Projects Supported" value={9} icon={Building2} />
              <StatCard label="Solutions Deployed" value={3} icon={CheckCircle2} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-sm">
              <p className="text-sm font-semibold text-jic-charcoal">Your Active Collaborations</p>
              <div className="mt-4 space-y-3">
                {PROJECTS.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-border p-3.5 transition-colors hover:bg-jic-forest-light/30">
                    <div>
                      <p className="text-sm font-medium text-jic-charcoal">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.university}</p>
                    </div>
                    <span className="rounded-full bg-jic-forest-light px-2.5 py-1 text-xs font-semibold text-jic-forest">{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
