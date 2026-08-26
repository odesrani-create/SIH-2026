import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageSquareText,
  Sparkles,
  GraduationCap,
  Factory,
  Rocket,
  MapPin,
  Building2,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading, StatCard } from "@/components/shared/section-heading";
import { ChallengeCard } from "@/components/shared/challenge-card";
import { JourneyRibbon } from "@/components/shared/journey-ribbon";
import { useAppState } from "@/lib/app-state";
import { CHALLENGES, STATE_STATS, IMPACT_STORIES } from "@/data/demoData";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Report",
    description: "Citizens submit real-world problems with descriptions, photos, videos and location.",
    icon: MessageSquareText,
  },
  {
    step: "02",
    title: "AI Understands",
    description: "AI categorises, prioritises and detects duplicate challenges automatically.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Match",
    description: "The platform identifies suitable universities, researchers and experts.",
    icon: GraduationCap,
  },
  {
    step: "04",
    title: "Collaborate",
    description: "Students, faculty, startups and industries work together on the ground.",
    icon: Factory,
  },
  {
    step: "05",
    title: "Deploy",
    description: "Solutions are tested, implemented and their social impact is measured.",
    icon: Rocket,
  },
];

export function LandingPage() {
  const { goTo } = useAppState();
  const featured = CHALLENGES.slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-jic-forest-light/70 via-jic-cream to-jic-cream">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-jic-saffron/10 blur-3xl" />
        <div className="absolute -left-32 top-40 h-96 w-96 rounded-full bg-jic-forest/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-jic-forest/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-jic-forest shadow-sm">
                <Landmark className="h-3.5 w-3.5" /> An initiative by Govt. of Jharkhand, Dept. of IT &amp; e-Governance
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] text-jic-charcoal sm:text-5xl lg:text-[3.4rem]">
                Turn Local Problems Into <span className="text-jic-forest">Real-World Solutions.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Connecting Jharkhand's communities, universities, innovators, industries and government to solve the
                challenges that matter most.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="bg-jic-deep px-6 text-jic-cream hover:bg-jic-deep/90"
                  onClick={() => goTo("submit")}
                >
                  Submit a Challenge <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-jic-forest/30 px-6" onClick={() => goTo("challenges")}>
                  Explore Challenges
                </Button>
              </div>
              <div className="mt-10 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { value: "2,500+", label: "Challenges" },
                  { value: "42", label: "Districts" },
                  { value: "68", label: "Institutions" },
                  { value: "120+", label: "Industry Partners" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl font-semibold text-jic-charcoal">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative"
            >
              <div className="rounded-3xl border border-border bg-white p-6 shadow-xl sm:p-8">
                <p className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-jic-forest">The Ecosystem</p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: MessageSquareText, label: "Citizen", desc: "Reports a local problem", tone: "bg-jic-forest" },
                    { icon: Sparkles, label: "AI Engine", desc: "Classifies & prioritises", tone: "bg-jic-earth" },
                    { icon: GraduationCap, label: "University", desc: "Researches & prototypes", tone: "bg-jic-deep" },
                    { icon: Factory, label: "Industry", desc: "Funds & scales", tone: "bg-jic-forest" },
                    { icon: Rocket, label: "Solution", desc: "Deployed with measured impact", tone: "bg-jic-saffron" },
                  ].map((row, i, arr) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${row.tone} text-white`}>
                          <row.icon className="h-5 w-5" />
                        </span>
                        {i < arr.length - 1 && <span className="my-0.5 h-4 w-px bg-border" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-jic-charcoal">{row.label}</p>
                        <p className="text-xs text-muted-foreground">{row.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-white px-4 py-3 shadow-lg sm:block">
                <p className="text-xs text-muted-foreground">Impact this year</p>
                <p className="font-display text-xl font-semibold text-jic-forest">1.8M+ people</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* JOURNEY STRIP */}
      <section className="border-b border-border bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <JourneyRibbon />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="How It Works" title="From a local problem to a deployed solution" align="center" className="mx-auto" />
        <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="absolute left-0 right-0 top-9 hidden h-px bg-border lg:block" />
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-border bg-jic-cream shadow-sm">
                <item.icon className="h-7 w-7 text-jic-forest" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-jic-deep text-[10px] font-bold text-jic-saffron">
                  {item.step}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-jic-charcoal">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED CHALLENGES */}
      <section className="border-y border-border bg-jic-forest-light/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Live Challenges" title="Problems waiting for innovators" />
            <Button variant="outline" className="border-jic-forest/30" onClick={() => goTo("challenges")}>
              View all challenges <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ECOSYSTEM STATS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="State-wide Reach" title="An ecosystem, not a portal" align="center" className="mx-auto" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Challenges" value={STATE_STATS.totalChallenges.toLocaleString("en-IN")} hint="Since platform launch" icon={MessageSquareText} />
          <StatCard label="Active Projects" value={STATE_STATS.activeProjects} hint="In research to pilot stages" icon={Sparkles} />
          <StatCard label="Solutions Deployed" value={STATE_STATS.solutionsDeployed} hint="Live in communities" icon={Rocket} />
          <StatCard label="People Impacted" value={STATE_STATS.peopleImpacted} hint="Across 42 districts" icon={Building2} />
        </div>
      </section>

      {/* IMPACT PREVIEW */}
      <section className="bg-jic-deep py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Impact Stories" title="Every problem is an opportunity for innovation" light description="A glimpse of what happens when citizens, universities and industry work together." />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {IMPACT_STORIES.map((story) => (
              <div key={story.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60">
                  <MapPin className="h-3.5 w-3.5" /> {story.district}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">{story.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{story.solution}</p>
                <ul className="mt-4 space-y-1.5">
                  {story.impactPoints.slice(0, 2).map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-jic-saffron">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-jic-saffron" /> <span className="text-white/85">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10" onClick={() => goTo("impact")}>
              See the full impact dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-jic-forest/15 bg-jic-forest-light/50 px-8 py-14 text-center">
          <h2 className="max-w-xl font-display text-3xl font-semibold text-jic-charcoal sm:text-4xl">
            Have a problem worth solving? Bring it to the ecosystem.
          </h2>
          <p className="max-w-md text-muted-foreground">
            It takes minutes to submit — and could connect your community to the researchers and industry partners
            who can actually fix it.
          </p>
          <Button size="lg" className="bg-jic-deep px-7 text-jic-cream hover:bg-jic-deep/90" onClick={() => goTo("submit")}>
            Submit a Challenge <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
