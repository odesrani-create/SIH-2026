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

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75"
          : "border-transparent bg-background/60 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => goTo("landing")} className="group flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-jic-deep text-jic-saffron">
            <Sprout className="h-4 w-4" />
          </span>
          <span className="font-display text-[15px] font-semibold leading-none tracking-tight text-jic-charcoal">
            Jharkhand Innovation Connect
          </span>
        </button>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.page}
              onClick={() => goTo(link.page)}
              className={cn(
                "relative py-1.5 text-[13.5px] font-medium text-muted-foreground transition-colors duration-150 hover:text-jic-charcoal",
                "after:absolute after:-bottom-[1px] after:left-0 after:h-[1.5px] after:w-0 after:bg-jic-charcoal after:transition-all after:duration-200 hover:after:w-full",
                nav.page === link.page && "text-jic-charcoal after:w-full"
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {user && <NotificationDropdown />}
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border px-2 py-1.5 pr-3 text-sm font-medium transition-colors hover:border-jic-forest/40"
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
                  <div className="absolute right-0 top-11 z-40 w-60 animate-fade-up rounded-xl border border-border bg-popover p-2 shadow-elevation-lg">
                    <div className="px-2.5 py-2.5">
                      <p className="text-sm font-semibold text-jic-charcoal">{user.name}</p>
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
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => goTo("login")}>
              Login
            </Button>
          )}
          <Button
            size="sm"
            className="hidden rounded-md bg-jic-deep text-jic-cream hover:bg-jic-deep/90 sm:inline-flex"
            onClick={() => goTo("submit")}
          >
            Submit a Challenge
          </Button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md text-jic-charcoal hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in border-t border-border bg-background px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {[{ label: "Home", page: "landing" as PageId }, ...NAV_LINKS].map((link) => (
              <button
                key={link.page}
                onClick={() => {
                  goTo(link.page);
                  setMobileOpen(false);
                }}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-left text-sm font-medium text-jic-charcoal transition-colors hover:bg-muted",
                  nav.page === link.page && "bg-muted"
                )}
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
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-jic-charcoal hover:bg-muted"
              >
                Login
              </button>
            )}
            <Button
              className="mt-1 rounded-md bg-jic-deep text-jic-cream hover:bg-jic-deep/90"
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
