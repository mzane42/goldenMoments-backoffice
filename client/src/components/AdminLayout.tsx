import { useAuth } from "@/hooks/useSupabaseAuth";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/supabaseConst";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  Building2,
  Calendar,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Tableau de bord", href: "/admin", icon: Home },
  { name: "Réservations", href: "/admin/reservations", icon: Calendar },
  { name: "Expériences", href: "/admin/experiences", icon: ShoppingBag },
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
  { name: "Partenaires", href: "/admin/partners", icon: Building2 },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Rapports", href: "/admin/reports", icon: FileText },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: roleCheck, isLoading: roleLoading } = trpc.auth.checkRole.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (!roleLoading && roleCheck && !roleCheck.isAdmin) {
      window.location.href = "/";
    }
  }, [roleLoading, roleCheck]);

  const handleLogout = async () => {
    await logout();
    window.location.href = getLoginUrl();
  };

  if (loading || roleLoading || !isAuthenticated || !roleCheck?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center gap-3">
              {APP_LOGO && (
                <img src={APP_LOGO} alt="Logo" className="h-8 w-8 object-contain" />
              )}
              <span className="font-semibold text-lg text-foreground">
                {APP_TITLE}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location === item.href || location.startsWith(item.href + "/");
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="p-3 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.fullName?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.fullName || "Administrateur"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {roleCheck.admin?.role === "super_admin" ? "Super Admin" : "Admin"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <a className="flex items-center gap-2 w-full">
                      <Settings className="h-4 w-4" />
                      <span>Paramètres</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 h-16 bg-card border-b border-border lg:hidden">
          <div className="flex items-center justify-between h-full px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-accent"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              {APP_LOGO && (
                <img src={APP_LOGO} alt="Logo" className="h-8 w-8 object-contain" />
              )}
              <span className="font-semibold text-foreground">{APP_TITLE}</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
