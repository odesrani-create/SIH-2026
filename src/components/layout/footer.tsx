import { Sprout } from "lucide-react";
import { useAppState } from "@/lib/app-state";

export function Footer() {
  const { goTo } = useAppState();
  return (
    <footer className="border-t border-white/10 bg-jic-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-jic-saffron">
                <Sprout className="h-5 w-5" />
              </span>
              <span className="font-display text-base font-semibold">Jharkhand Innovation Connect</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              An AI-powered societal innovation platform connecting citizens, government, universities, students and
              industry to turn local problems into deployed solutions.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">Platform</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li><button onClick={() => goTo("challenges")} className="hover:text-jic-saffron">Explore Challenges</button></li>
              <li><button onClick={() => goTo("submit")} className="hover:text-jic-saffron">Submit a Challenge</button></li>
              <li><button onClick={() => goTo("track")} className="hover:text-jic-saffron">Track a Challenge</button></li>
              <li><button onClick={() => goTo("impact")} className="hover:text-jic-saffron">Impact Dashboard</button></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">Ecosystem</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li><button onClick={() => goTo("university-dashboard")} className="hover:text-jic-saffron">Universities</button></li>
              <li><button onClick={() => goTo("industry")} className="hover:text-jic-saffron">Industry Partners</button></li>
              <li><button onClick={() => goTo("government")} className="hover:text-jic-saffron">Government Dashboard</button></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">Department of IT &amp; e-Governance</p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Government of Jharkhand<br />Project Bhawan, Ranchi, Jharkhand 834004
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© 2026 Jharkhand Innovation Connect · Government of Jharkhand. Prototype build for demonstration.</p>
          <p>Designed for accessibility · WCAG 2.1 AA</p>
        </div>
      </div>
    </footer>
  );
}
