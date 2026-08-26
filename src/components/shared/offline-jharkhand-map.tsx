import { useMemo, useState } from "react";
import { MapPin, Radio, WifiOff } from "lucide-react";
import type { Challenge, District } from "@/types";

interface DistrictPoint {
  name: string;
  x: number;
  y: number;
}

const DISTRICT_POINTS: DistrictPoint[] = [
  { name: "Palamu", x: 18, y: 30 },
  { name: "Gumla", x: 27, y: 56 },
  { name: "Simdega", x: 37, y: 78 },
  { name: "Ranchi", x: 47, y: 51 },
  { name: "Hazaribagh", x: 52, y: 29 },
  { name: "Giridih", x: 70, y: 30 },
  { name: "Dhanbad", x: 78, y: 45 },
  { name: "Bokaro", x: 64, y: 49 },
  { name: "Jamshedpur", x: 66, y: 72 },
  { name: "Chaibasa", x: 49, y: 76 },
  { name: "Dumka", x: 84, y: 25 },
  { name: "Deoghar", x: 88, y: 42 },
];

const STATE_OUTLINE = "M18 17 L36 8 L58 10 L80 5 L94 19 L91 37 L98 52 L86 66 L75 83 L55 91 L38 86 L26 93 L12 76 L5 57 L10 39 Z";

export function OfflineJharkhandMap({ districts, challenges }: { districts: District[]; challenges: Challenge[] }) {
  const [selectedDistrict, setSelectedDistrict] = useState("Ranchi");
  const selected = districts.find((district) => district.name === selectedDistrict) ?? districts[0];
  const selectedChallenges = useMemo(
    () => challenges.filter((challenge) => challenge.district === selectedDistrict),
    [challenges, selectedDistrict]
  );
  const maxChallenges = Math.max(...districts.map((district) => district.challenges));

  return (
    <div className="overflow-hidden rounded-2xl border border-jic-forest/20 bg-[#f4f1e5]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-jic-forest/15 bg-white/70 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-jic-forest" />
            <h3 className="font-display text-lg font-semibold text-jic-charcoal">Problem locations</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">District-level view of reported problems across Jharkhand</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-jic-forest-light px-3 py-1.5 text-xs font-semibold text-jic-forest">
          <WifiOff className="h-3.5 w-3.5" /> Offline map data
        </span>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative min-h-[390px] p-3 sm:p-6">
          <svg viewBox="0 0 100 100" className="h-full min-h-[360px] w-full" role="img" aria-label="Offline map of Jharkhand districts">
            <path d={STATE_OUTLINE} fill="#dbe8d4" stroke="#2d6a4f" strokeWidth="0.8" strokeLinejoin="round" />
            <path d="M15 55 C35 44 57 55 88 38 M28 18 C42 36 43 63 38 86 M59 10 C57 34 68 55 73 82" fill="none" stroke="#a9c5a5" strokeWidth="0.45" strokeDasharray="2 2" />
            {DISTRICT_POINTS.map((point) => {
              const district = districts.find((item) => item.name === point.name);
              if (!district) return null;
              const active = point.name === selectedDistrict;
              const size = 2.3 + (district.challenges / maxChallenges) * 2.5;
              return (
                <g key={point.name} className="cursor-pointer" onClick={() => setSelectedDistrict(point.name)}>
                  {active && <circle cx={point.x} cy={point.y} r={size + 2} fill="#e0a72e" opacity="0.25" />}
                  <circle cx={point.x} cy={point.y} r={size} fill={active ? "#e0a72e" : "#2d6a4f"} stroke="#fff" strokeWidth="0.8" />
                  <text x={point.x} y={point.y - size - 1.5} textAnchor="middle" fontSize="3.2" fontWeight={active ? "700" : "500"} fill="#232323">
                    {point.name}
                  </text>
                  <title>{`${point.name}: ${district.challenges} reported problems`}</title>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-5 left-6 flex items-center gap-3 rounded-lg border border-jic-forest/15 bg-white/85 px-3 py-2 text-[11px] text-muted-foreground backdrop-blur-sm">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-jic-forest" /> Reported problems</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-jic-saffron" /> Selected district</span>
          </div>
        </div>

        <div className="border-t border-jic-forest/15 bg-white/65 p-5 lg:border-l lg:border-t-0">
          <p className="text-xs font-bold uppercase tracking-wide text-jic-forest">Selected district</p>
          <h4 className="mt-1 font-display text-2xl font-semibold text-jic-charcoal">{selected?.name}</h4>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Metric label="Reported" value={selected?.challenges ?? 0} />
            <Metric label="Live projects" value={selected?.activeProjects ?? 0} />
            <Metric label="Solutions" value={selected?.solutions ?? 0} />
            <Metric label="Impact" value={selected?.impact ?? "-"} />
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-jic-charcoal"><Radio className="h-3.5 w-3.5 text-jic-forest" /> Demo problem records</p>
            <div className="mt-3 space-y-2">
              {selectedChallenges.length > 0 ? selectedChallenges.map((challenge) => (
                <div key={challenge.id} className="rounded-lg border border-border bg-white p-2.5">
                  <p className="text-xs font-semibold leading-snug text-jic-charcoal">{challenge.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{challenge.block || "District-wide"} · {challenge.priority} priority</p>
                </div>
              )) : <p className="text-xs text-muted-foreground">No demo records in this district.</p>}
            </div>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">Data is bundled with the app, so this view remains available without internet or map tiles.</p>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-jic-forest-light/60 p-2.5"><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-0.5 text-sm font-bold text-jic-charcoal">{value}</p></div>;
}