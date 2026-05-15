import { AdminLayout } from "@/components/layout/AdminLayout";
import { formatCLP } from "@/lib/currency";
import {
  useListOrders,
  useUpdateOrderStatus,
  getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Link } from "wouter";
import {
  Eye,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

const STATUS_CONFIG: Record<string, {
  label: string;
  dot: string;
  badge: string;
  icon: typeof Clock;
  row: string;
}> = {
  pending:    { label: "Pendiente",  dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200",   icon: Clock,         row: "border-l-amber-400" },
  processing: { label: "Procesando", dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200",      icon: TrendingUp,    row: "border-l-blue-400" },
  shipped:    { label: "Enviado",    dot: "bg-purple-400",  badge: "bg-purple-50 text-purple-700 border-purple-200", icon: Truck,         row: "border-l-purple-400" },
  delivered:  { label: "Entregado",  dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, row: "border-l-emerald-400" },
  cancelled:  { label: "Cancelado",  dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200",         icon: XCircle,       row: "border-l-red-400" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, dot: "bg-gray-400", badge: "bg-gray-50 text-gray-700 border-gray-200", icon: Package, row: "" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function StatusDropdown({ orderId, current, onChange }: { orderId: number; current: string; onChange: (id: number, s: string) => void }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[current] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge} cursor-pointer hover:opacity-80 transition-opacity`}
      >
        <Icon className="h-3 w-3" />
        {cfg.label}
        <ChevronDown className="h-3 w-3 ml-0.5 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
            {Object.entries(STATUS_CONFIG).map(([key, s]) => {
              const SIcon = s.icon;
              return (
                <button
                  key={key}
                  onClick={() => { onChange(orderId, key); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${key === current ? "bg-slate-50" : ""}`}
                >
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <SIcon className="h-3 w-3 text-slate-400" />
                  {s.label}
                  {key === current && <span className="ml-auto text-primary text-[10px] font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-pink-100 text-pink-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700"];

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const queryParams = statusFilter === "all" ? {} : { status: statusFilter };
  const { data: orders, isLoading } = useListOrders(queryParams);
  const { data: allOrders } = useListOrders({});

  const queryClient = useQueryClient();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatus.mutate(
      { id, data: { status: newStatus } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(queryParams) }) }
    );
  };

  const counts = allOrders
    ? Object.keys(STATUS_CONFIG).reduce((acc, key) => {
        acc[key] = allOrders.filter((o) => o.status === key).length;
        return acc;
      }, {} as Record<string, number>)
    : {};

  const totalRevenue = allOrders?.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0) ?? 0;
  const pendingCount = counts["pending"] ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestión de Pedidos</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Actualiza el estado y gestiona cada pedido de tus clientes
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-xs font-semibold text-amber-700">
                {pendingCount} pedido{pendingCount > 1 ? "s" : ""} esperando procesarse en AliExpress
              </span>
            </div>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total pedidos",  value: String(allOrders?.length ?? 0),           color: "text-slate-700",   bg: "bg-white",          icon: ShoppingBag, iconBg: "bg-slate-100 text-slate-500" },
            { label: "Pendientes",     value: String(pendingCount),                      color: "text-amber-600",   bg: "bg-amber-50",       icon: Clock,       iconBg: "bg-amber-100 text-amber-600" },
            { label: "Enviados",       value: String((counts.shipped ?? 0) + (counts.processing ?? 0)), color: "text-purple-600", bg: "bg-purple-50", icon: Truck, iconBg: "bg-purple-100 text-purple-600" },
            { label: "Ingresos",       value: formatCLP(totalRevenue),                   color: "text-emerald-600", bg: "bg-emerald-50",     icon: TrendingUp,  iconBg: "bg-emerald-100 text-emerald-600" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`${card.bg} rounded-2xl border border-slate-200/70 p-4 flex items-center gap-3`}>
                <div className={`p-2 rounded-xl shrink-0 ${card.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{card.label}</p>
                  <p className={`text-base font-bold truncate ${card.color}`}>{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === "all"
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            Todos ({allOrders?.length ?? 0})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const n = counts[key] ?? 0;
            if (n === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  statusFilter === key
                    ? `${cfg.badge} shadow-sm`
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label} ({n})
              </button>
            );
          })}
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="p-5 rounded-2xl bg-slate-100">
                <ShoppingBag className="h-9 w-9 text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Sin pedidos</p>
                <p className="text-sm text-slate-500 mt-1">
                  {statusFilter !== "all" ? "No hay pedidos con este estado." : "Aún no has recibido ningún pedido."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                    <th className="text-left px-5 py-3.5">Pedido</th>
                    <th className="text-left px-5 py-3.5">Cliente</th>
                    <th className="text-left px-5 py-3.5 hidden md:table-cell">Productos</th>
                    <th className="text-left px-5 py-3.5">Total</th>
                    <th className="text-left px-5 py-3.5">Estado</th>
                    <th className="text-left px-5 py-3.5 hidden lg:table-cell">Fecha</th>
                    <th className="px-5 py-3.5 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => {
                    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                    const avatarColor = AVATAR_COLORS[order.id % AVATAR_COLORS.length];
                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors group border-l-2 ${cfg.row}`}
                        data-testid={`row-order-${order.id}`}
                      >
                        <td className="px-5 py-4">
                          <div className="font-mono text-xs font-bold text-slate-400">
                            #{String(order.id).padStart(5, "0")}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor}`}>
                              {initials(order.customerName)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate text-sm">{order.customerName}</p>
                              <p className="text-xs text-slate-400 truncate">{order.customerEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            {order.items?.slice(0, 3).map((item, i) => (
                              <div key={i} className="w-7 h-7 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-slate-100 shrink-0">
                                {item.imageUrl
                                  ? <img src={item.imageUrl} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center"><Package className="h-3 w-3 text-slate-300" /></div>
                                }
                              </div>
                            ))}
                            {(order.items?.length ?? 0) > 3 && (
                              <span className="text-xs text-slate-400 ml-1">+{(order.items?.length ?? 0) - 3}</span>
                            )}
                            <span className="text-xs text-slate-400 ml-1">
                              {order.items?.length ?? 0} ítem{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-800">{formatCLP(order.total)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusDropdown
                            orderId={order.id}
                            current={order.status}
                            onChange={handleStatusChange}
                          />
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap hidden lg:table-cell">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/pedidos/${order.id}`}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                            data-testid={`link-order-detail-${order.id}`}
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
