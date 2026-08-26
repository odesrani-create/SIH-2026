import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/section-heading";
import { ChallengeCard } from "@/components/shared/challenge-card";
import { OfflineJharkhandMap } from "@/components/shared/offline-jharkhand-map";
import { CHALLENGES, DISTRICTS, DISTRICT_NAMES, DOMAINS } from "@/data/demoData";
import type { ChallengeStatus, Priority } from "@/types";

const STATUSES: ChallengeStatus[] = [
  "Submitted",
  "Under Review",
  "Validated",
  "University Assigned",
  "Research Started",
  "Prototype",
  "Pilot",
  "Implemented",
];
const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];
const PAGE_SIZE = 9;

export function ChallengesPage() {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("all");
  const [domain, setDomain] = useState("all");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return CHALLENGES.filter((c) => {
      if (query && !`${c.title} ${c.description} ${c.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (district !== "all" && c.district !== district) return false;
      if (domain !== "all" && c.domain !== domain) return false;
      if (priority !== "all" && c.priority !== priority) return false;
      if (status !== "all" && c.status !== status) return false;
      return true;
    });
  }, [query, district, domain, priority, status]);

  const paged = filtered.slice(0, page * PAGE_SIZE);
  const activeFilterCount = [district, domain, priority, status].filter((v) => v !== "all").length;

  const resetFilters = () => {
    setDistrict("all");
    setDomain("all");
    setPriority("all");
    setStatus("all");
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Challenge Explorer" title="Browse societal problems across Jharkhand" description="Search, filter and find the challenges your team, lab or startup is best placed to solve." />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search challenges…"
            className="h-11 rounded-full pl-10"
          />
        </div>
        <Button
          variant="outline"
          className="h-11 gap-2 rounded-full border-jic-forest/30 sm:w-auto"
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
          <FilterSelect label="District" value={district} onChange={setDistrict} options={DISTRICT_NAMES} />
          <FilterSelect label="Domain" value={domain} onChange={setDomain} options={DOMAINS} />
          <FilterSelect label="Priority" value={priority} onChange={setPriority} options={PRIORITIES} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUSES} />
          <div className="flex items-end">
            <Button variant="ghost" className="h-10 w-full gap-1.5 text-muted-foreground" onClick={resetFilters}>
              <X className="h-3.5 w-3.5" /> Clear filters
            </Button>
          </div>
        </div>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        Showing <span className="font-semibold text-jic-charcoal">{Math.min(paged.length, filtered.length)}</span> of{" "}
        {filtered.length} challenges
      </p>

      <div className="mt-8">
        <OfflineJharkhandMap districts={DISTRICTS} challenges={CHALLENGES} />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="font-display text-lg font-semibold text-jic-charcoal">No challenges match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">Try broadening your search or clearing some filters.</p>
          <Button variant="outline" className="mt-4" onClick={resetFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}

      {paged.length < filtered.length && (
        <div className="mt-10 flex justify-center">
          <Button variant="outline" className="border-jic-forest/30" onClick={() => setPage((p) => p + 1)}>
            Load more challenges
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
