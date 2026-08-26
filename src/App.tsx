import { AppStateProvider, useAppState } from "@/lib/app-state";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { LandingPage } from "@/pages/landing-page";
import { ChallengesPage } from "@/pages/challenges-page";
import { ChallengeDetailPage } from "@/pages/challenge-detail-page";
import { SubmitChallengePage } from "@/pages/submit-challenge-page";
import { UniversityDashboardPage } from "@/pages/university-dashboard-page";
import { UniversityWorkspacePage } from "@/pages/university-workspace-page";
import { ProjectWorkspacePage } from "@/pages/project-workspace-page";
import { IndustryPage } from "@/pages/industry-page";
import { GovernmentDashboardPage } from "@/pages/government-dashboard-page";
import { ImpactPage } from "@/pages/impact-page";
import { TrackChallengePage } from "@/pages/track-challenge-page";
import { LoginPage } from "@/pages/login-page";

function CurrentPage() {
  const { nav } = useAppState();
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
      <main className={isDashboard ? "flex-1 bg-muted/20" : "flex-1"}>
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
