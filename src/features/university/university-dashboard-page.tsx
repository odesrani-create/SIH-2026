import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Compass,
  Users2,
  GraduationCap,
  FolderKanban,
  FileSignature,
  Building2,
  FlaskConical,
  Bell,
  ArrowRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import type { DashboardNavItem } from "@/components/shared/dashboard-shell";
import { StatCard } from "@/components/shared/section-heading";
import { ChallengeCard } from "@/components/shared/challenge-card";
import { Button } from "@/components/ui/button";
import { NOTIFICATIONS, CHALLENGES, PROJECTS, UNIVERSITIES, INDUSTRY_PARTNERS } from "@/data/demoData";
import { useAppState } from "@/lib/app-state";

const CHART_COLORS = ["#3a3f5c", "#5b6485", "#b8825a", "#a85c5c", "#9098b0"];

const NAV_ITEMS: DashboardNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "assigned", label: "Assigned Challenges", icon: ClipboardList, badge: 24 },
  { id: "discover", label: "Discover Challenges", icon: Compass },
  { id: "teams", label: "Teams", icon: Users2 },
  { id: "faculty", label: "Faculty", icon: GraduationCap },
  { id: "projects", label: "Projects", icon: FolderKanban, badge: 12 },
  { id: "proposals", label: "Proposals", icon: FileSignature },
  { id: "industry", label: "Industry Partners", icon: Building2 },
  { id: "research", label: "Research", icon: FlaskConical },
  { id: "notifications", label: "Notifications", icon: Bell, badge: 2 },
];

const DOMAIN_CHART = [
  { domain: "Water", value: 6 },
  { domain: "Health", value: 4 },
  { domain: "Agri", value: 5 },
  { domain: "Env", value: 4 },
  { domain: "Energy", value: 3 },
  { domain: "Infra", value: 2 },
];

const PROJECT_PROGRESS = [
  { name: "Completed", value: 12 },
  { name: "In Progress", value: 12 },
  { name: "Planning", value: 6 },
];

const PARTICIPATION = [
  { month: "Sep", students: 34 },
  { month: "Oct", students: 46 },
  { month: "Nov", students: 58 },
  { month: "Dec", students: 67 },
  { month: "Jan", students: 78 },
  { month: "Feb", students: 86 },
];

export function UniversityDashboardPage() {
  const { user, goTo } = useAppState();
  const [tab, setTab] = useState("overview");
  const university = UNIVERSITIES[0];
  const assigned = CHALLENGES.filter((c) => c.assignedUniversity === university.name);
  const discoverable = CHALLENGES.filter((c) => !c.assignedUniversity).slice(0, 6);
  const projects = PROJECTS.filter((p) => p.university === university.name);

  return (
    <DashboardShell
      title={`Welcome back${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
      subtitle={user?.organization ?? university.name}
      navItems={NAV_ITEMS}
      activeId={tab}
      onSelect={setTab}
    >
      {tab === "overview" && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Assigned Challenges" value={24} icon={ClipboardList} hint="Across 6 domains" />
            <StatCard label="Active Projects" value={12} icon={FolderKanban} hint="From research to pilot" />
            <StatCard label="Student Researchers" value={86} icon={Users2} hint="Across all projects" />
            <StatCard label="Industry Collaborations" value={9} icon={Building2} hint="Active partnerships" />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Challenges by Domain">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={DOMAIN_CHART}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="domain" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#5b6485" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Project Progress">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={PROJECT_PROGRESS} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {PROJECT_PROGRESS.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {PROJECT_PROGRESS.map((p, i) => (
                  <span key={p.name} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {p.name} ({p.value})
                  </span>
                ))}
              </div>
            </ChartCard>
            <ChartCard title="Student Participation">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={PARTICIPATION}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip />
                  <Line type="monotone" dataKey="students" stroke="#3a3f5c" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Research Outcomes">
              <div className="grid grid-cols-2 gap-4 py-4">
                <MiniMetric label="Publications" value="9" />
                <MiniMetric label="Patents filed" value="2" />
                <MiniMetric label="Pilots completed" value="4" />
                <MiniMetric label="Startups spun off" value="1" />
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {tab === "assigned" && (
        <TabList
          heading="Assigned Challenges"
          items={assigned}
          empty="No challenges assigned yet."
          renderCard={(c) => <ChallengeCard key={c.id} challenge={c} />}
        />
      )}

      {tab === "discover" && (
        <TabList
          heading="Discover Challenges"
          description="Unassigned challenges your departments are well matched for."
          items={discoverable}
          empty="No open challenges right now."
          renderCard={(c) => <ChallengeCard key={c.id} challenge={c} />}
        />
      )}

      {tab === "teams" && (
        <div>
          <SectionTitle title="Teams" description="Multidisciplinary teams currently working across your active projects." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm font-semibold text-jic-charcoal">{p.title}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.team.map((m) => (
                    <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-jic-forest-light px-2.5 py-1 text-xs font-medium text-jic-forest">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-jic-forest text-[9px] text-white">
                        {m.name.charAt(0)}
                      </span>
                      {m.name} · {m.role}
                    </span>
                  ))}
                </div>
                <Button variant="link" className="mt-2 h-auto p-0 text-jic-forest" onClick={() => goTo("project", { id: p.id })}>
                  Open project workspace <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "faculty" && (
        <div>
          <SectionTitle title="Faculty" description="Mentors currently guiding active challenge projects." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Dr. Anita Kujur", dept: "Civil Engineering", projects: 3 },
              { name: "Dr. Prakash Verma", dept: "Mining Engineering", projects: 2 },
              { name: "Dr. Meena Toppo", dept: "Agriculture Science", projects: 2 },
              { name: "Dr. Farida Ansari", dept: "Environmental Science", projects: 1 },
              { name: "Dr. Ramesh Iyer", dept: "Computer Science", projects: 2 },
              { name: "Dr. Suman Kachhap", dept: "Electronics", projects: 1 },
            ].map((f) => (
              <div key={f.name} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-jic-deep text-sm font-semibold text-jic-saffron">
                  {f.name.split(" ")[1]?.charAt(0) ?? f.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-jic-charcoal">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.dept} · {f.projects} active projects</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "projects" && (
        <div>
          <SectionTitle title="Projects" description="All active and completed projects run by your institution." />
          <div className="mt-5 space-y-3">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => goTo("project", { id: p.id })}
                className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-jic-forest/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-jic-charcoal">{p.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.status} · {p.district}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-jic-forest" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-jic-forest">{p.progress}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "proposals" && (
        <div>
          <SectionTitle title="Proposals" description="Draft and submitted proposals awaiting government or industry review." />
          <div className="mt-5 space-y-3">
            {[
              { title: "IoT Water Monitoring — Phase 2 Expansion", status: "Under Government Review" },
              { title: "Mine Subsidence Sensor Network — Funding Request", status: "Draft" },
              { title: "Solar Cold Storage Cooperative — Industry Co-funding", status: "Submitted" },
            ].map((p) => (
              <div key={p.title} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-jic-charcoal">{p.title}</p>
                <span className="rounded-full bg-jic-saffron-light px-2.5 py-1 text-xs font-semibold text-jic-earth">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "industry" && (
        <div>
          <SectionTitle title="Industry Partners" description="Companies currently collaborating with your teams." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRY_PARTNERS.slice(0, 6).map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-jic-forest-light text-xs font-bold text-jic-forest">
                  {p.logo}
                </span>
                <p className="mt-3 text-sm font-semibold text-jic-charcoal">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.technologyArea}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "research" && (
        <div>
          <SectionTitle title="Research" description="Publications and technical outputs generated from platform projects." />
          <div className="mt-5 space-y-3">
            {[
              "Low-Cost IoT Framework for Rural Water Infrastructure Monitoring",
              "Ground Movement Sensing in Legacy Coal Mining Zones: A Field Study",
              "Solar Cold-Chain Cooperatives: Economic Viability in Eastern India",
            ].map((title) => (
              <div key={title} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <FlaskConical className="h-4 w-4 shrink-0 text-jic-forest" />
                <p className="text-sm text-jic-charcoal">{title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div>
          <SectionTitle title="Notifications" />
          <div className="mt-5 space-y-2">
            {NOTIFICATIONS.map((n) => (
              <div key={n.id} className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="text-sm font-medium text-jic-charcoal">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.description}</p>
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

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-semibold text-jic-forest">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
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

function TabList<T>({
  heading,
  description,
  items,
  empty,
  renderCard,
}: {
  heading: string;
  description?: string;
  items: T[];
  empty: string;
  renderCard: (item: T) => React.ReactNode;
}) {
  return (
    <div>
      <SectionTitle title={heading} description={description} />
      {items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{items.map(renderCard)}</div>
      )}
    </div>
  );
}
