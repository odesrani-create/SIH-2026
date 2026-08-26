import { useState } from "react";
import { Menu, X, Sprout, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import type { PageId } from "@/lib/app-state";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { cn } from "@/lib/utils";

const NAV_LINKS: { label: string; page: PageId }[] = [
  { label: "Home", page: "landing" },
  { label: "Challenges", page: "challenges" },
  { label: "Universities", page: "university-dashboard" },
  { label: "Industry", page: "industry" },
  { label: "Impact", page: "impact" },
];

export function Navbar() {
  const { nav, goTo, user, logout } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-jic-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => goTo("landing")} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-jic-deep text-jic-saffron">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="font-display text-[17px] font-semibold leading-none text-jic-charcoal">
            Jharkhand
            <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-jic-forest">
              Innovation Connect
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.page}
              onClick={() => goTo(link.page)}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium text-jic-charcoal/80 transition-colors hover:bg-jic-forest-light hover:text-jic-forest",
                nav.page === link.page && "bg-jic-forest-light text-jic-forest"
              )}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => goTo("track")}
            className={cn(
              "rounded-full px-3.5 py-2 text-sm font-medium text-jic-charcoal/80 transition-colors hover:bg-jic-forest-light hover:text-jic-forest",
              nav.page === "track" && "bg-jic-forest-light text-jic-forest"
            )}
          >
            Track Challenge
          </button>
        </nav>

        <div className="flex items-center gap-2">
          {user && <NotificationDropdown />}
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border bg-white px-2 py-1.5 pr-3 text-sm font-medium hover:bg-jic-forest-light"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-jic-forest text-xs font-semibold text-white">
                  {user.name.charAt(0)}
                </span>
                <span className="max-w-[110px] truncate">{user.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-11 w-56 rounded-xl border border-border bg-white p-2 shadow-lg">
                  <div className="px-2.5 py-2">
                    <p className="text-sm font-semibold text-jic-charcoal">{user.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{user.role} {user.organization ? `· ${user.organization}` : ""}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => goTo("login")}>
              Login
            </Button>
          )}
          <Button
            className="hidden bg-jic-deep text-jic-cream hover:bg-jic-deep/90 sm:inline-flex"
            onClick={() => goTo("submit")}
          >
            Submit a Challenge
          </Button>
          <button className="lg:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-jic-cream px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {[...NAV_LINKS, { label: "Track Challenge", page: "track" as PageId }].map((link) => (
              <button
                key={link.page}
                onClick={() => {
                  goTo(link.page);
                  setMobileOpen(false);
                }}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-jic-charcoal hover:bg-jic-forest-light"
              >
                {link.label}
              </button>
            ))}
            {!user && (
              <button
                onClick={() => {
                  goTo("login");
                  setMobileOpen(false);
                }}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-jic-charcoal hover:bg-jic-forest-light"
              >
                Login
              </button>
            )}
            <Button
              className="mt-1 bg-jic-deep text-jic-cream hover:bg-jic-deep/90"
              onClick={() => {
                goTo("submit");
                setMobileOpen(false);
              }}
            >
              Submit a Challenge
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
