import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Map,
  GraduationCap,
  Building2,
  FolderKanban,
  TrendingUp,
  FileBarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import type { DashboardNavItem } from "@/components/shared/dashboard-shell";
import { StatCard } from "@/components/shared/section-heading";
import { OfflineJharkhandMap } from "@/components/shared/offline-jharkhand-map";
import { Button } from "@/components/ui/button";
import {
  STATE_STATS,
  CHALLENGES_BY_DOMAIN,
  CHALLENGES,
  PROJECT_PIPELINE,
  INDUSTRY_ENGAGEMENT,
  DISTRICTS,
  UNIVERSITIES,
} from "@/data/demoData";
import { useAppState } from "@/lib/app-state";

const CHART_COLORS = ["#3a3f5c", "#5b6485", "#b8825a", "#a85c5c", "#9098b0", "#6b7392", "#c99a52", "#8a5a3d"];

const NAV_ITEMS: DashboardNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "challenges", label: "Challenges", icon: ClipboardList },
  { id: "districts", label: "Districts", icon: Map },
  { id: "universities", label: "Universities", icon: GraduationCap },
  { id: "industry", label: "Industry", icon: Building2 },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "impact", label: "Impact", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: FileBarChart2 },
];

export function GovernmentDashboardPage() {
  const { goTo } = useAppState();
  const [tab, setTab] = useState("overview");
  const topUniversities = [...UNIVERSITIES].sort((a, b) => b.assignedChallenges - a.assignedChallenges).slice(0, 6);

  return (
    <DashboardShell
      title="State Dashboard"
      subtitle="Department of IT & e-Governance, Government of Jharkhand · Jharkhand Innovation Connect"
      navItems={NAV_ITEMS}
      activeId={tab}
      onSelect={setTab}
    >
      {tab === "overview" && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Challenges" value={STATE_STATS.totalChallenges.toLocaleString("en-IN")} icon={ClipboardList} hint="+186 this quarter" />
            <StatCard label="Active Projects" value={STATE_STATS.activeProjects} icon={FolderKanban} hint="Research to pilot" />
            <StatCard label="Solutions Deployed" value={STATE_STATS.solutionsDeployed} icon={TrendingUp} hint="Live in communities" />
            <StatCard label="People Impacted" value={STATE_STATS.peopleImpacted} icon={Building2} hint="Across 42 districts" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Challenges by Domain">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={CHALLENGES_BY_DOMAIN} dataKey="count" nameKey="domain" innerRadius={60} outerRadius={95} paddingAngle={2}>
                    {CHALLENGES_BY_DOMAIN.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {CHALLENGES_BY_DOMAIN.map((d, i) => (
                  <span key={d.domain} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {d.domain} ({d.count})
                  </span>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Project Pipeline">
              <ResponsiveContainer width="100%" height={260}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="count" data={PROJECT_PIPELINE} isAnimationActive>
                    {PROJECT_PIPELINE.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                    <LabelList position="right" dataKey="stage" fill="hsl(222 32% 20%)" stroke="none" fontSize={12} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Challenges by District (Top 8)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={DISTRICTS.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="challenges" fill="#5b6485" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Industry Engagement">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={INDUSTRY_ENGAGEMENT}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="type" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#b8825a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {tab === "challenges" && (
        <div>
          <SectionTitle title="Challenges" description="State-wide challenge volume by status." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Submitted", value: 2548 },
              { label: "Validated", value: 1980 },
              { label: "Assigned", value: 1240 },
              { label: "Implemented", value: 74 },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-semibold text-jic-charcoal">{s.value.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-6 border-jic-forest/30" onClick={() => goTo("challenges")}>
            Open Challenge Explorer
          </Button>
        </div>
      )}

      {tab === "districts" && (
        <div>
          <SectionTitle title="Districts" description="Select a district to locate reported problems and inspect local activity." />
          <div className="mt-5">
            <OfflineJharkhandMap districts={DISTRICTS} challenges={CHALLENGES} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DISTRICTS.map((d) => (
              <div key={d.name} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-jic-charcoal">{d.name}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Challenges: <b className="text-jic-charcoal">{d.challenges}</b></span>
                  <span>Projects: <b className="text-jic-charcoal">{d.activeProjects}</b></span>
                  <span>Universities: <b className="text-jic-charcoal">{d.universities}</b></span>
                  <span>Solutions: <b className="text-jic-charcoal">{d.solutions}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "universities" && (
        <div>
          <SectionTitle title="University Participation" description="Ranked by number of assigned challenges." />
          <div className="mt-5 space-y-2.5">
            {topUniversities.map((u, i) => (
              <div key={u.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-jic-forest-light text-sm font-bold text-jic-forest">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-jic-charcoal">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.district} · {u.expertise.slice(0, 2).join(", ")}</p>
                </div>
                <span className="text-sm font-semibold text-jic-forest">{u.assignedChallenges} challenges</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "industry" && (
        <div>
          <SectionTitle title="Industry Engagement" description="How industry partners are supporting active projects." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRY_ENGAGEMENT.map((e) => (
              <div key={e.type} className="rounded-2xl border border-border bg-card p-5 text-center">
                <p className="font-display text-3xl font-semibold text-jic-forest">{e.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{e.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "projects" && (
        <div>
          <SectionTitle title="Projects" description="Pipeline stage distribution across all state projects." />
          <div className="mt-5 space-y-2">
            {PROJECT_PIPELINE.map((p) => (
              <div key={p.stage} className="flex items-center gap-4">
                <span className="w-28 shrink-0 text-sm text-muted-foreground">{p.stage}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-jic-forest" style={{ width: `${(p.count / PROJECT_PIPELINE[0].count) * 100}%` }} />
                </div>
                <span className="w-16 shrink-0 text-right text-sm font-semibold text-jic-charcoal">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "impact" && (
        <div>
          <SectionTitle title="Impact" description="Full public impact metrics." />
          <Button className="mt-4 bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={() => goTo("impact")}>
            Open Public Impact Dashboard
          </Button>
        </div>
      )}

      {tab === "reports" && (
        <div>
          <SectionTitle title="Reports" description="Generated summaries for legislative and CSR review." />
          <div className="mt-5 space-y-2.5">
            {[
              "Q3 2025-26 State Innovation Pipeline Report",
              "District-wise Solution Deployment Summary",
              "University & Industry Partnership Review",
              "Annual Social Impact Assessment (Draft)",
            ].map((r) => (
              <div key={r} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <span className="text-sm text-jic-charcoal">{r}</span>
                <Button size="sm" variant="outline">Download</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-2 text-sm font-semibold text-jic-charcoal">{title}</p>
      {children}
    </div>
  );
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-jic-charcoal">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
