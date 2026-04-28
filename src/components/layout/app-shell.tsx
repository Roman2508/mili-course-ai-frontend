import {
  BookCopy,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  User,
  UsersRound,
  BrainCircuit,
  X,
  LibraryBig,
} from "lucide-react";
import { useState, type PropsWithChildren } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/use-auth";

const baseNavigation = [
  { to: "/courses", label: "Каталог курсів", icon: LibraryBig },
  { to: "/my-learning", label: "Моє навчання", icon: Sparkles },
  { to: "/recommendations", label: "AI-рекомендації", icon: BrainCircuit },
];

const adminNavigation = [
  { to: "/admin/courses", label: "Керування курсами", icon: BookCopy },
  { to: "/admin/users", label: "Користувачі", icon: UsersRound },
];

function NavigationLink({
  to,
  label,
  icon: Icon,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof Shield;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
          isActive
            ? "bg-ink text-white shadow-panel"
            : "text-ink/70 hover:bg-ink/5 hover:text-ink",
        )
      }
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </NavLink>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const { session, isAdmin, isLoggingOut, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigation = isAdmin
    ? [...baseNavigation, ...adminNavigation]
    : baseNavigation;

  async function handleLogout() {
    await logout();
    setMobileOpen(false);
    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-5">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="app-panel sticky top-4 hidden max-h-[calc(100dvh-32px)] flex-col justify-between p-5 lg:flex">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-ink px-3 py-2 text-sm font-bold uppercase tracking-[0.18em] text-white">
                  Mili
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate">
                    Course AI
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavigationLink key={item.to} {...item} />
              ))}
            </nav>
          </div>

          <div className="space-y-4 rounded-[28px] bg-ink px-4 py-5 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] leading-none text-white/50">
                У системі
              </p>
              <p className="mt-2 text-base font-semibold leading-none text-white">
                {session?.name ?? "Guest"}
              </p>
            </div>

            <NavLink
              to="/profile"
              className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <User className="size-4" />
              <span>Профіль</span>
            </NavLink>

            <Button
              variant="ghost"
              className="w-full justify-start bg-white/5 text-white hover:bg-white/10"
              onClick={() => {
                void handleLogout();
              }}
              disabled={isLoggingOut}
            >
              <LogOut className="size-4" />
              Вийти
            </Button>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col gap-4">
          <header className="app-panel app-grid-background sticky top-4 z-20 flex items-center justify-between gap-4 px-4 py-4 lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate">
                Mili Course AI
              </p>
              <p className="text-lg font-semibold">Operational Learning</p>
            </div>
            <Button
              variant="ghost"
              className="size-11 rounded-2xl p-0"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
          </header>

          {mobileOpen ? (
            <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden">
              <div className="ml-auto flex h-full w-[84%] max-w-sm flex-col bg-shell p-5 shadow-panel">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate">
                      Навігація
                    </p>
                    <p className="text-xl font-semibold">Mili Course AI</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="size-11 rounded-2xl p-0"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="size-5" />
                  </Button>
                </div>

                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <NavigationLink
                      key={item.to}
                      {...item}
                      onClick={() => setMobileOpen(false)}
                    />
                  ))}
                </nav>

                <div className="mt-auto space-y-4 rounded-[28px] bg-ink px-4 py-5 text-white">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] leading-none text-white/50">
                      У системі
                    </p>
                    <p className="mt-2 text-lg font-semibold leading-none text-white">
                      {session?.name ?? "Guest"}
                    </p>
                  </div>

                  <NavLink
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <User className="size-4" />
                    <span>Профіль</span>
                  </NavLink>

                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-white/5 text-white hover:bg-white/10"
                    onClick={() => {
                      void handleLogout();
                    }}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="size-4" />
                    Вийти
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <main className="min-h-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
