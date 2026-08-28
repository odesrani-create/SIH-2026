import { Sprout } from "lucide-react";
import { useAppState } from "@/lib/app-state";

export function Footer() {
  const { goTo } = useAppState();
  return (
    <footer className="border-t border-white/10 bg-jic-deep text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-jic-saffron">
                <Sprout className="h-4 w-4" />
              </span>
              <span className="font-display text-[15px] font-semibold tracking-tight">Jharkhand Innovation Connect</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              An AI-powered societal innovation platform connecting citizens, government, universities, students and
              industry to turn local problems into deployed solutions.
            </p>
          </div>
          <div>
            <p className="eyebrow-mono uppercase text-white/40">Platform</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li><button onClick={() => goTo("challenges")} className="transition-colors hover:text-white">Explore Challenges</button></li>
              <li><button onClick={() => goTo("submit")} className="transition-colors hover:text-white">Submit a Challenge</button></li>
              <li><button onClick={() => goTo("track")} className="transition-colors hover:text-white">Track a Challenge</button></li>
              <li><button onClick={() => goTo("impact")} className="transition-colors hover:text-white">Impact Dashboard</button></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow-mono uppercase text-white/40">Ecosystem</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li><button onClick={() => goTo("university-dashboard")} className="transition-colors hover:text-white">Universities</button></li>
              <li><button onClick={() => goTo("industry")} className="transition-colors hover:text-white">Industry Partners</button></li>
              <li><button onClick={() => goTo("government")} className="transition-colors hover:text-white">Government Dashboard</button></li>
            </ul>
          </div>
          <div className="hairline-panel-dark rounded-xl p-5">
            <p className="eyebrow-mono uppercase text-jic-saffron/80">Dept. of IT &amp; e-Governance</p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Government of Jharkhand
              <br />
              Project Bhawan, Ranchi, Jharkhand 834004
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© 2026 Jharkhand Innovation Connect · Government of Jharkhand. Prototype build for demonstration.</p>
          <p className="eyebrow-mono">WCAG 2.1 AA</p>
        </div>
      </div>
    </footer>
  );
}
