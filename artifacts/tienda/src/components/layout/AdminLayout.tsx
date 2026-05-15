import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  LogOut,
  TrendingUp,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useGetDashboardSummary } from "@workspace/api-client-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { logout } = useAdminAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { data: summary } = useGetDashboardSummary();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
    { name: "Productos", href: "/admin/productos", icon: Package },
    { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingBag },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/admin/login");
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="bg-primary text-white p-1.5 rounded-xl">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-base text-white">TechStore</span>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Admin Panel</div>
          </div>
        </div>

        {/* Quick stats */}
        {summary && summary.pendingOrders > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-yellow-400 shrink-0" />
            <span className="text-xs text-yellow-300">
              {summary.pendingOrders} pedido{summary.pendingOrders > 1 ? "s" : ""} pendiente{summary.pendingOrders > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="p-4 flex-1 space-y-1">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
          Navegación
        </p>
        {navItems.map((item) => {
          const isActive = item.exact
            ? location === item.href
            : location.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/20 text-primary border border-primary/20 shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
              data-testid={`link-admin-${item.name.toLowerCase()}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
              {item.name === "Pedidos" && summary && summary.pendingOrders > 0 && (
                <span className="ml-auto bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {summary.pendingOrders}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 space-y-2 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
        >
          <Store className="h-4 w-4" />
          Ver tienda
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-[#0b1120] text-slate-100 min-h-screen flex-col shrink-0 border-r border-white/5">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-[#0b1120] text-slate-100 z-50 flex flex-col md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col overflow-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-border flex items-center justify-between px-4 md:px-6 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground hidden sm:block">Panel de control</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {summary && (
              <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground mr-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                  {summary.totalProducts} productos
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />
                  {summary.totalOrders} pedidos
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border border-red-200 dark:border-red-800"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
