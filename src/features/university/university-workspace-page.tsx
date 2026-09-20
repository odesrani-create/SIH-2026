import { useState } from "react";
import { ArrowLeft, Sparkles, Users2, Plus, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge, StatusBadge } from "@/components/shared/badges";
import { CHALLENGES } from "@/data/demoData";
import { useAppState } from "@/lib/app-state";

const REQUIRED_DISCIPLINES = ["Computer Science", "Civil Engineering", "Electronics", "Environmental Science"];

export function UniversityWorkspacePage() {
  const { nav, goTo } = useAppState();
  const challenge = CHALLENGES.find((c) => c.id === nav.params.id) ?? CHALLENGES[0];

  const [mentor, setMentor] = useState("");
  const [members, setMembers] = useState<{ name: string; discipline: string }[]>([]);
  const [memberName, setMemberName] = useState("");
  const [memberDiscipline, setMemberDiscipline] = useState("");
  const [teamCreated, setTeamCreated] = useState(false);

  const addMember = () => {
    if (!memberName.trim() || !memberDiscipline) return;
    setMembers((m) => [...m, { name: memberName.trim(), discipline: memberDiscipline }]);
    setMemberName("");
    setMemberDiscipline("");
  };

  return (
    <div>
      <div className="border-b border-border bg-jic-forest-light/30 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => goTo("university-dashboard")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-jic-forest"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={challenge.status} />
            <PriorityBadge priority={challenge.priority} />
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold text-jic-charcoal sm:text-3xl">{challenge.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{challenge.description}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-jic-forest/20 bg-jic-forest-light/40 p-5 shadow-elevation-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-jic-forest" />
            <p className="font-display text-base font-semibold text-jic-charcoal">AI Recommendations</p>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-jic-charcoal">
            <li>• Deploy low-cost sensor hardware validated for rural field conditions</li>
            <li>• Partner with the district block office for pilot-site access</li>
            <li>• Design for offline-first data capture given limited connectivity</li>
            <li>• Plan a 6-8 week field testing window before the village pilot</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-sm">
          <p className="font-display text-base font-semibold text-jic-charcoal">Required Disciplines</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {REQUIRED_DISCIPLINES.map((d) => (
              <span key={d} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {d}
              </span>
            ))}
          </div>
          <p className="mt-4 font-display text-base font-semibold text-jic-charcoal">Potential Solution Directions</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li>IoT sensor network with cloud monitoring dashboard</li>
            <li>Predictive maintenance model trained on failure history</li>
            <li>SMS-based alerting for low-connectivity areas</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-elevation-sm">
        <div className="flex items-center gap-2">
          <Users2 className="h-5 w-5 text-jic-forest" />
          <p className="font-display text-lg font-semibold text-jic-charcoal">Team Builder</p>
        </div>

        {teamCreated ? (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-jic-forest/30 bg-jic-forest-light/50 p-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-jic-forest" />
            <div>
              <p className="text-sm font-semibold text-jic-charcoal">Project team created</p>
              <p className="text-xs text-muted-foreground">A project workspace has been opened for this challenge.</p>
            </div>
            <Button className="ml-auto bg-jic-deep text-jic-cream hover:bg-jic-deep/90" onClick={() => goTo("project", { id: "proj-001" })}>
              Open Project
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-jic-charcoal">Faculty Mentor</label>
                <Input value={mentor} onChange={(e) => setMentor(e.target.value)} placeholder="e.g. Dr. Anita Kujur" />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-jic-charcoal">Student Members</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Student name" className="sm:flex-1" />
                <Select value={memberDiscipline} onValueChange={setMemberDiscipline}>
                  <SelectTrigger className="sm:w-56"><SelectValue placeholder="Discipline" /></SelectTrigger>
                  <SelectContent>
                    {REQUIRED_DISCIPLINES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={addMember} className="gap-1.5">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              {members.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {members.map((m, i) => (
                    <span key={`${m.name}-${i}`} className="inline-flex items-center gap-2 rounded-full bg-jic-forest-light px-3 py-1.5 text-xs font-medium text-jic-forest">
                      {m.name} · {m.discipline}
                      <button onClick={() => setMembers((arr) => arr.filter((_, idx) => idx !== i))} aria-label="Remove member">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="mt-6 bg-jic-deep text-jic-cream hover:bg-jic-deep/90"
              disabled={!mentor.trim() || members.length === 0}
              onClick={() => setTeamCreated(true)}
            >
              Create Project Team
            </Button>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
