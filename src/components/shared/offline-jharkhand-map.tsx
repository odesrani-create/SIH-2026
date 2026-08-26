import { useMemo, useState } from "react";
import { ExternalLink, MapPin, Radio, WifiOff } from "lucide-react";
import type { Challenge, District } from "@/types";

interface DistrictPoint {
  name: string;
  x: number;
  y: number;
  latitude: number;
  longitude: number;
}

const DISTRICT_POINTS: DistrictPoint[] = [
  { name: "Palamu", x: 18, y: 30, latitude: 24.03, longitude: 84.07 },
  { name: "Gumla", x: 27, y: 56, latitude: 23.04, longitude: 84.54 },
  { name: "Simdega", x: 37, y: 78, latitude: 22.62, longitude: 84.51 },
  { name: "Ranchi", x: 47, y: 51, latitude: 23.34, longitude: 85.31 },
  { name: "Hazaribagh", x: 52, y: 29, latitude: 23.99, longitude: 85.36 },
  { name: "Giridih", x: 70, y: 30, latitude: 24.19, longitude: 86.30 },
  { name: "Dhanbad", x: 78, y: 45, latitude: 23.80, longitude: 86.43 },
  { name: "Bokaro", x: 64, y: 49, latitude: 23.67, longitude: 86.15 },
  { name: "Jamshedpur", x: 66, y: 72, latitude: 22.80, longitude: 86.20 },
  { name: "Chaibasa", x: 49, y: 76, latitude: 22.56, longitude: 85.80 },
  { name: "Dumka", x: 84, y: 25, latitude: 24.27, longitude: 87.25 },
  { name: "Deoghar", x: 88, y: 42, latitude: 24.48, longitude: 86.70 },
];

export function OfflineJharkhandMap({ districts, challenges }: { districts: District[]; challenges: Challenge[] }) {
  const [selectedDistrict, setSelectedDistrict] = useState("Ranchi");
  const selected = districts.find((district) => district.name === selectedDistrict) ?? districts[0];
  const selectedChallenges = useMemo(
    () => challenges.filter((challenge) => challenge.district === selectedDistrict),
    [challenges, selectedDistrict]
  );
    const selectedPoint = DISTRICT_POINTS.find((point) => point.name === selectedDistrict) ?? DISTRICT_POINTS[3];
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=83.2%2C21.8%2C87.9%2C25.5&layer=mapnik&marker=${selectedPoint.latitude}%2C${selectedPoint.longitude}`;

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
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-jic-forest-light px-3 py-1.5 text-xs font-semibold text-jic-forest">
            <WifiOff className="h-3.5 w-3.5" /> Local problem data
          </span>
          <a href="https://organicmaps.app/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-jic-deep px-3 py-1.5 text-xs font-semibold text-jic-cream hover:bg-jic-forest">
            Open in Organic Maps <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative min-h-[390px] p-3 sm:p-6">
          <iframe title="Live map of Jharkhand" src={mapUrl} className="h-[360px] w-full rounded-xl border border-jic-forest/20 bg-white" loading="lazy" />
          <div className="pointer-events-none absolute bottom-5 left-6 rounded-lg border border-jic-forest/15 bg-white/90 px-3 py-2 text-[11px] text-muted-foreground shadow-sm">
            Live map · marker shows {selectedDistrict}
          </div>
        </div>

        <div className="border-t border-jic-forest/15 bg-white/65 p-5 lg:border-l lg:border-t-0">
          <p className="text-xs font-bold uppercase tracking-wide text-jic-forest">Selected district</p>
          <label htmlFor="map-district" className="sr-only">Choose a district</label>
          <select id="map-district" value={selectedDistrict} onChange={(event) => setSelectedDistrict(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-jic-charcoal outline-none focus:ring-2 focus:ring-jic-forest/30">
            {districts.map((district) => <option key={district.name} value={district.name}>{district.name}</option>)}
          </select>
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