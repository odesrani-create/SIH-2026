import { AppStateProvider, useAppState } from "@/lib/app-state";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { LandingPage } from "@/features/community/landing-page";
import { ChallengesPage } from "@/features/challenges/challenges-page";
import { ChallengeDetailPage } from "@/features/challenges/challenge-detail-page";
import { SubmitChallengePage } from "@/features/challenges/submit-challenge-page";
import { UniversityDashboardPage } from "@/features/university/university-dashboard-page";
import { UniversityWorkspacePage } from "@/features/university/university-workspace-page";
import { ProjectWorkspacePage } from "@/features/projects/project-workspace-page";
import { IndustryPage } from "@/features/partners/industry-page";
import { GovernmentDashboardPage } from "@/features/partners/government-dashboard-page";
import { ImpactPage } from "@/features/impact/impact-page";
import { TrackChallengePage } from "@/features/track/track-challenge-page";
import { LoginPage } from "@/features/auth/login-page";

function CurrentPage() {
  const { nav, user } = useAppState();
  if (!user && nav.page !== "login") {
    return <LoginPage />;
  }
  switch (nav.page) {
    case "landing":
      return <LandingPage />;
    case "challenges":
      return <ChallengesPage />;
    case "challenge-detail":
      return <ChallengeDetailPage />;
    case "submit":
      return <SubmitChallengePage />;
    case "university-dashboard":
      return <UniversityDashboardPage />;
    case "university-workspace":
      return <UniversityWorkspacePage />;
    case "project":
      return <ProjectWorkspacePage />;
    case "industry":
      return <IndustryPage />;
    case "government":
      return <GovernmentDashboardPage />;
    case "impact":
      return <ImpactPage />;
    case "track":
      return <TrackChallengePage />;
    case "login":
      return <LoginPage />;
    default:
      return <LandingPage />;
  }
}

function AppShell() {
  const { nav } = useAppState();
  const isDashboard = ["university-dashboard", "government"].includes(nav.page);
  return (
    <div className="flex min-h-screen flex-col bg-jic-cream font-sans text-jic-charcoal">
      <Navbar />
      <main className={isDashboard ? "flex-1 bg-muted/20 pb-20 lg:pb-0" : "flex-1 pb-20 lg:pb-0"}>
        <CurrentPage />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}
