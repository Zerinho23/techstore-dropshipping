import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  Zap,
  TrendingUp,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useGetDashboardSummary } from "@workspace/api-client-react";

const NAV = [
  { name: "Dashboard",  href: "/admin",           icon: LayoutDashboard, exact: true,  desc: "Resumen general" },
  { name: "Productos",  href: "/admin/productos",  icon: Package,         exact: false, desc: "Catálogo y stock" },
  { name: "Pedidos",    href: "/admin/pedidos",    icon: ShoppingBag,     exact: false, desc: "Gestión de órdenes" },
];

function NavItem({
  item, isActive, pending, onClick,
}: {
  item: typeof NAV[0];
  isActive: boolean;
  pending?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-white/10 text-white shadow-inner"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      )}
      data-testid={`link-admin-${item.name.toLowerCase()}`}
    >
      {/* Active left bar */}
      {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r-full" />
      )}
      <div className={cn(
        "p-1.5 rounded-lg shrink-0 transition-colors",
        isActive ? "bg-primary/30 text-primary" : "bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300"
      )}>
        <item.icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span>{item.name}</span>
          {pending && pending > 0 ? (
            <span className="bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {pending}
            </span>
          ) : isActive ? (
            <ChevronRight className="h-3 w-3 opacity-40" />
          ) : null}
        </div>
        <p className="text-[10px] text-slate-600 group-hover:text-slate-500 transition-colors leading-none mt-0.5">
          {item.desc}
        </p>
      </div>
    </Link>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: summary } = useGetDashboardSummary();

  const handleLogout = async () => {
    await logout();
    setLocation("/admin/login");
  };

  const isActive = (item: typeof NAV[0]) =>
    item.exact ? location === item.href : location.startsWith(item.href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-primary to-blue-600 p-2 rounded-xl shadow-lg shadow-primary/30">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm tracking-tight">TechStore</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Panel Admin</p>
          </div>
        </div>

        {/* Pending alert */}
        {summary && summary.pendingOrders > 0 && (
          <div className="mt-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
            <Bell className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-pulse" />
            <p className="text-xs text-amber-300 font-medium">
              {summary.pendingOrders} pedido{summary.pendingOrders > 1 ? "s" : ""} pendiente{summary.pendingOrders > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em] px-3 mb-2">
          Menú principal
        </p>
        {NAV.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={isActive(item)}
            pending={item.name === "Pedidos" ? summary?.pendingOrders : undefined}
            onClick={() => setMobileOpen(false)}
          />
        ))}

        <div className="pt-4 mt-4 border-t border-white/5">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em] px-3 mb-2">
            Tienda
          </p>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
          >
            <div className="p-1.5 rounded-lg bg-white/5">
              <Store className="h-3.5 w-3.5" />
            </div>
            <div>
              <p>Ver tienda</p>
              <p className="text-[10px] text-slate-600 leading-none mt-0.5">Ir al front</p>
            </div>
          </Link>
        </div>
      </nav>

      {/* Bottom stats + logout */}
      <div className="border-t border-white/5 px-3 py-3 space-y-3">
        {/* Mini stats */}
        {summary && (
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "Ingresos", value: `$${Math.round((summary.totalRevenue ?? 0) / 1000)}k`, color: "text-emerald-400" },
              { label: "Pedidos",  value: String(summary.totalOrders ?? 0),                       color: "text-blue-400" },
              { label: "Prods",    value: String(summary.totalProducts ?? 0),                     color: "text-purple-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
                <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-slate-600 leading-none mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group"
          data-testid="button-logout"
        >
          <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
            <LogOut className="h-3.5 w-3.5" />
          </div>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  /* Page title from current route */
  const pageTitle =
    location === "/admin" ? "Dashboard" :
    location.startsWith("/admin/productos") ? "Productos" :
    location.startsWith("/admin/pedidos") && location !== "/admin/pedidos" ? "Detalle de Pedido" :
    location.startsWith("/admin/pedidos") ? "Pedidos" : "Admin";

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 bg-[#0b1120] min-h-screen flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-56 bg-[#0b1120] z-50 flex flex-col md:hidden transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          className="absolute top-4 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 flex items-center px-4 md:px-6 gap-4 shrink-0 shadow-sm shadow-slate-200/50">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 text-xs hidden sm:block">Admin</span>
            <ChevronRight className="h-3 w-3 text-slate-300 hidden sm:block" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{pageTitle}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Pending badge */}
            {summary && summary.pendingOrders > 0 && (
              <Link
                href="/admin/pedidos"
                className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1.5 rounded-full hover:bg-amber-100 transition-colors"
              >
                <Bell className="h-3 w-3" />
                {summary.pendingOrders} pendiente{summary.pendingOrders > 1 ? "s" : ""}
              </Link>
            )}

            {/* Quick stats */}
            <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 mr-1">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                {summary?.totalProducts ?? 0} productos
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                {summary?.totalOrders ?? 0} pedidos
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 border border-red-100 hover:border-red-200 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
