import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  MessageSquareText,
  Sparkles,
  GraduationCap,
  Factory,
  Rocket,
  MapPin,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading, StatCard } from "@/components/shared/section-heading";
import { ChallengeCard } from "@/components/shared/challenge-card";
import { JourneyRibbon } from "@/components/shared/journey-ribbon";
import { useAppState } from "@/lib/app-state";
import { CHALLENGES, STATE_STATS, IMPACT_STORIES } from "@/data/demoData";

const HOW_IT_WORKS = [
  { step: "01", title: "Report", description: "Citizens submit real-world problems with descriptions, photos, videos and location.", icon: MessageSquareText },
  { step: "02", title: "AI Understands", description: "AI categorises, prioritises and detects duplicate challenges automatically.", icon: Sparkles },
  { step: "03", title: "Match", description: "The platform identifies suitable universities, researchers and experts.", icon: GraduationCap },
  { step: "04", title: "Collaborate", description: "Students, faculty, startups and industries work together on the ground.", icon: Factory },
  { step: "05", title: "Deploy", description: "Solutions are tested, implemented and their social impact is measured.", icon: Rocket },
];

const ECOSYSTEM_ROLES = [
  { icon: MessageSquareText, label: "Citizen", desc: "Reports a local problem" },
  { icon: Sparkles, label: "AI Engine", desc: "Classifies & prioritises instantly" },
  { icon: GraduationCap, label: "University", desc: "Researches & prototypes" },
  { icon: Factory, label: "Industry", desc: "Funds & scales the solution" },
  { icon: Rocket, label: "Deployment", desc: "Impact measured on the ground" },
];

export function LandingPage() {
  const { goTo } = useAppState();
  const featured = CHALLENGES.slice(0, 3);

  return (
    <div>
      {/* HERO — dark, asymmetric, type-led */}
      <section className="relative overflow-hidden bg-jic-deep text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-texture-light opacity-[0.18]" />
        <div className="pointer-events-none absolute right-[-8%] top-[-15%] h-[30rem] w-[30rem] rounded-full bg-jic-saffron/[0.08] blur-[100px]" />

        <div className="relative mx-auto max-w-[1400px] px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <div className="flex items-center gap-2 text-white/50">
            <span className="eyebrow-mono">01 / GOVERNMENT OF JHARKHAND</span>
            <span className="h-px flex-1 bg-white/10" />
            <span className="eyebrow-mono hidden sm:inline">DEPT. OF IT &amp; E-GOVERNANCE</span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mt-8 max-w-4xl text-balance font-display text-5xl font-semibold leading-[0.98] sm:text-7xl lg:text-[5.5rem]"
          >
            Turn local
            <br />
            problems into
            <br />
            <span className="text-jic-saffron">real solutions.</span>
          </motion.h1>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="max-w-lg text-lg leading-relaxed text-white/60"
            >
              Connecting Jharkhand's communities, universities, innovators, industries and government to solve the
              challenges that matter most — end to end, in the open.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button size="lg" className="rounded-md bg-jic-saffron px-6 text-jic-deep hover:bg-jic-saffron/90" onClick={() => goTo("submit")}>
                Submit a Challenge <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-md border-white/20 bg-transparent px-6 text-white hover:bg-white/10" onClick={() => goTo("challenges")}>
                Explore Challenges
              </Button>
            </motion.div>
          </div>

          {/* Ecosystem flow — editorial row, not a floating card */}
          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-5">
            {ECOSYSTEM_ROLES.map((role) => (
              <div key={role.label} className="bg-jic-deep px-4 py-5">
                <role.icon className="h-4.5 w-4.5 text-jic-saffron" />
                <p className="mt-3 text-sm font-semibold text-white">{role.label}</p>
                <p className="mt-1 text-xs leading-snug text-white/45">{role.desc}</p>
              </div>
            ))}
          </div>

          {/* Stat strip */}
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-4">
            {[
              { value: "2,500+", label: "Challenges reported" },
              { value: "42", label: "Districts covered" },
              { value: "68", label: "Institutions active" },
              { value: "1.8M+", label: "People impacted" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-semibold tracking-tight text-white">{s.value}</p>
                <p className="mt-1 text-xs text-white/45">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNEY STRIP */}
      <section className="border-b border-border bg-background py-6">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <JourneyRibbon />
        </div>
      </section>

      {/* HOW IT WORKS — numbered editorial columns */}
      <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="How It Works" title="From a local problem to a deployed solution" />
        </div>
        <div className="mt-14 grid gap-0 border-t border-border sm:grid-cols-2 lg:grid-cols-5">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.step} className={`group border-b border-r border-border px-5 py-8 lg:border-b-0 ${i === 0 ? "lg:pl-0" : ""}`}>
              <span className="eyebrow-mono text-muted-foreground/50">{item.step}</span>
              <item.icon className="mt-4 h-5 w-5 text-jic-forest" />
              <h3 className="mt-4 font-display text-base font-semibold text-jic-charcoal">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED CHALLENGES */}
      <section className="border-y border-border bg-muted/40 py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Live Challenges" title="Problems waiting for innovators" />
            <Button variant="outline" className="rounded-md" onClick={() => goTo("challenges")}>
              View all challenges <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ECOSYSTEM STATS */}
      <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="State-wide Reach" title="An ecosystem, not a portal" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Challenges" value={STATE_STATS.totalChallenges.toLocaleString("en-IN")} hint="Since platform launch" icon={MessageSquareText} />
          <StatCard label="Active Projects" value={STATE_STATS.activeProjects} hint="In research to pilot stages" icon={Sparkles} />
          <StatCard label="Solutions Deployed" value={STATE_STATS.solutionsDeployed} hint="Live in communities" icon={Rocket} />
          <StatCard label="People Impacted" value={STATE_STATS.peopleImpacted} hint="Across 42 districts" icon={Building2} />
        </div>
      </section>

      {/* IMPACT PREVIEW */}
      <section className="relative overflow-hidden bg-jic-deep py-24 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-texture-light opacity-[0.15]" />
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Impact Stories" title="Every problem is an opportunity" light description="A glimpse of what happens when citizens, universities and industry work together." />
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 lg:grid-cols-3">
            {IMPACT_STORIES.map((story) => (
              <div key={story.id} className="group bg-jic-deep p-6 transition-colors duration-300 hover:bg-white/[0.04]">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50">
                  <MapPin className="h-3.5 w-3.5" /> {story.district}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">{story.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{story.solution}</p>
                <ul className="mt-4 space-y-1.5">
                  {story.impactPoints.slice(0, 2).map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-jic-saffron" /> <span className="text-white/80">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button variant="outline" className="rounded-md border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => goTo("impact")}>
              See the full impact dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA — flat, oversized type */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 border-t border-border pt-12 lg:flex-row lg:items-end">
            <div className="max-w-xl">
              <span className="eyebrow-mono text-jic-forest">GOT A PROBLEM WORTH SOLVING?</span>
              <h2 className="mt-4 text-balance font-display text-4xl font-semibold leading-[1.05] text-jic-charcoal sm:text-5xl">
                Bring it to the ecosystem.
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                It takes minutes to submit — and could connect your community to the researchers and industry
                partners who can actually fix it.
              </p>
            </div>
            <Button size="lg" className="shrink-0 rounded-md bg-jic-deep px-7 text-jic-cream hover:bg-jic-deep/90" onClick={() => goTo("submit")}>
              Submit a Challenge <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
