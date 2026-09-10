import { useState, useEffect } from "react";
import { Menu, X, Sprout, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import type { PageId } from "@/lib/app-state";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { cn } from "@/lib/utils";

const NAV_LINKS: { label: string; page: PageId }[] = [
  { label: "Challenges", page: "challenges" },
  { label: "Universities", page: "university-dashboard" },
  { label: "Industry", page: "industry" },
  { label: "Impact", page: "impact" },
  { label: "Track", page: "track" },
];

export function Navbar() {
  const { nav, goTo, user, logout } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled
          ? "border-jic-forest/15 bg-white/95 backdrop-blur-xl"
          : "border-jic-forest/10 bg-white/90 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex min-h-16 max-w-[1400px] items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <button
          onClick={() => goTo("landing")}
          className="group flex min-w-0 items-center gap-2.5"
          aria-label="Go to home"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-jic-forest text-white shadow-sm transition-transform group-hover:scale-105">
            <Sprout className="h-4 w-4" />
          </span>
          <span className="max-w-[190px] truncate font-display text-[14px] font-bold leading-tight tracking-tight text-jic-deep sm:max-w-none sm:text-[15px]">
            Jharkhand Innovation Connect
          </span>
        </button>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-7">
          {NAV_LINKS.map((link) => (
            <button
              key={link.page}
              onClick={() => goTo(link.page)}
              className={cn(
                "relative py-2 text-[13.5px] font-medium text-muted-foreground transition-colors duration-150 hover:text-jic-forest",
                "after:absolute after:-bottom-[1px] after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-jic-forest after:transition-all after:duration-200 hover:after:w-full",
                nav.page === link.page && "font-semibold text-jic-forest after:w-full"
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {user && <NotificationDropdown />}
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-jic-forest/20 bg-white px-2 py-1.5 pr-3 text-sm font-medium transition-colors hover:border-jic-forest/40 hover:bg-jic-forest-light/40"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-jic-forest text-[11px] font-bold text-white">
                  {user.name.charAt(0)}
                </span>
                <span className="max-w-[100px] truncate text-[13px]">{user.name}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", profileOpen && "rotate-180")} />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-11 z-40 w-60 animate-fade-up rounded-xl border border-jic-forest/15 bg-white p-2 shadow-elevation-lg">
                    <div className="px-2.5 py-2.5">
                      <p className="text-sm font-semibold text-jic-deep">{user.name}</p>
                      <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                        {user.role} {user.organization ? `· ${user.organization}` : ""}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex hover:bg-jic-forest-light hover:text-jic-forest" onClick={() => goTo("login")}>
              Login
            </Button>
          )}
          <Button
            size="sm"
            className="hidden rounded-md bg-jic-forest px-4 text-white hover:bg-jic-deep sm:inline-flex"
            onClick={() => goTo("submit")}
          >
            Submit a Challenge
          </Button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-jic-forest/15 text-jic-forest transition-colors hover:bg-jic-forest-light lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-jic-forest/10 bg-white px-4 pb-4 pt-2 shadow-sm lg:hidden">
          <div className="flex flex-col gap-1">
            {[{ label: "Home", page: "landing" as PageId }, ...NAV_LINKS].map((link) => (
              <button
                key={link.page}
                onClick={() => {
                  goTo(link.page);
                  closeMobile();
                }}
                className={cn(
                  "rounded-lg px-3 py-3 text-left text-sm font-medium text-jic-charcoal transition-colors hover:bg-jic-forest-light hover:text-jic-forest",
                  nav.page === link.page && "bg-jic-forest-light font-semibold text-jic-forest"
                )}
              >
                {link.label}
              </button>
            ))}
            {!user && (
              <button
                onClick={() => {
                  goTo("login");
                  closeMobile();
                }}
                className="rounded-lg px-3 py-3 text-left text-sm font-medium text-jic-charcoal hover:bg-jic-forest-light hover:text-jic-forest"
              >
                Login
              </button>
            )}
            <Button
              className="mt-2 min-h-11 w-full rounded-lg bg-jic-forest text-white hover:bg-jic-deep"
              onClick={() => {
                goTo("submit");
                closeMobile();
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
