import { useState } from "react";
import { Handshake, TrendingUp, Building2, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SectionHeading, StatCard } from "@/components/shared/section-heading";
import { PROJECTS, INDUSTRY_PARTNERS } from "@/data/demoData";

export function IndustryPage() {
  const [partnered, setPartnered] = useState<string[]>([]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Industry & Startups" title="Fund, mentor and scale student-built solutions" description="Discover challenge projects that match your technology area and support them through mentorship, funding, hardware, or deployment." />

      <Tabs defaultValue="discover" className="mt-8">
        <TabsList>
          <TabsTrigger value="discover">Discover Projects</TabsTrigger>
          <TabsTrigger value="partners">Our Partners</TabsTrigger>
          <TabsTrigger value="dashboard">Industry Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((p) => {
              const isPartnered = partnered.includes(p.id);
              return (
                <div key={p.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-jic-forest">{p.domain} · {p.district}</p>
                  <p className="mt-2 font-display text-base font-semibold leading-snug text-jic-charcoal">{p.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{p.university}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Mentorship", "Funding", "Hardware"].map((s) => (
                      <span key={s} className="rounded-full bg-jic-forest-light px-2 py-0.5 text-[11px] font-medium text-jic-forest">{s}</span>
                    ))}
                  </div>
                  <Button
                    className="mt-4 gap-1.5 bg-jic-deep text-jic-cream hover:bg-jic-deep/90 disabled:opacity-70"
                    disabled={isPartnered}
                    onClick={() => setPartnered((arr) => [...arr, p.id])}
                  >
                    {isPartnered ? <><CheckCircle2 className="h-4 w-4" /> Partnership Requested</> : <><Handshake className="h-4 w-4" /> Partner With Project</>}
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="partners" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRY_PARTNERS.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-jic-forest-light text-xs font-bold text-jic-forest">{p.logo}</span>
                <p className="mt-3 text-sm font-semibold text-jic-charcoal">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.technologyArea} · {p.district}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.support.map((s) => (
                    <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{s}</span>
                  ))}
                </div>
                <p className="mt-3 text-xs font-medium text-jic-forest">{p.activeCollaborations} active collaborations</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active Collaborations" value={6} icon={Handshake} />
            <StatCard label="Funding Committed" value="₹42L" icon={TrendingUp} />
            <StatCard label="Projects Supported" value={9} icon={Building2} />
            <StatCard label="Solutions Deployed" value={3} icon={CheckCircle2} />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-jic-charcoal">Your Active Collaborations</p>
            <div className="mt-4 space-y-3">
              {PROJECTS.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-border p-3.5">
                  <div>
                    <p className="text-sm font-medium text-jic-charcoal">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.university}</p>
                  </div>
                  <span className="text-xs font-semibold text-jic-forest">{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
