import { AdminLayout } from "@/components/layout/AdminLayout";
import { formatCLP } from "@/lib/currency";
import {
  useListOrders,
  useUpdateOrderStatus,
  getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  pending:    { label: "Pendiente",   dot: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  processing: { label: "Procesando",  dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700 border-blue-200" },
  shipped:    { label: "Enviado",     dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  delivered:  { label: "Entregado",   dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200" },
  cancelled:  { label: "Cancelado",   dot: "bg-red-500",    badge: "bg-red-50 text-red-700 border-red-200" },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, dot: "bg-gray-400", badge: "bg-gray-50 text-gray-700 border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const queryParams = statusFilter === "all" ? {} : { status: statusFilter };
  const { data: orders, isLoading } = useListOrders(queryParams);

  const queryClient = useQueryClient();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatus.mutate(
      { id, data: { status: newStatus } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(queryParams) }) }
    );
  };

  const statusCounts = orders
    ? Object.entries(STATUS_CONFIG).reduce((acc, [key]) => {
        acc[key] = orders.filter((o) => o.status === key).length;
        return acc;
      }, {} as Record<string, number>)
    : {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pedidos</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gestiona y actualiza el estado de los pedidos de tus clientes.
            </p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 rounded-xl" data-testid="select-status-filter">
              <SelectValue placeholder="Filtrar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status summary chips */}
        {orders && orders.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              statusCounts[key] > 0 && (
                <button
                  key={key}
                  onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    statusFilter === key ? cfg.badge + " shadow-sm" : "border-border bg-card text-muted-foreground hover:border-foreground/20"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}: {statusCounts[key]}
                </button>
              )
            ))}
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="p-4 rounded-2xl bg-muted">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">Sin pedidos</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {statusFilter !== "all" ? "No hay pedidos con este estado." : "Aún no has recibido ningún pedido."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    <th className="text-left px-5 py-3.5">Pedido</th>
                    <th className="text-left px-5 py-3.5">Cliente</th>
                    <th className="text-left px-5 py-3.5">Items</th>
                    <th className="text-left px-5 py-3.5">Total</th>
                    <th className="text-left px-5 py-3.5">Estado</th>
                    <th className="text-left px-5 py-3.5">Fecha</th>
                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                          #{String(order.id).padStart(5, "0")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-sm">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {order.items?.length ?? 0} producto{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                      </td>
                      <td className="px-5 py-4 font-bold">{formatCLP(order.total)}</td>
                      <td className="px-5 py-4">
                        <Select
                          value={order.status}
                          onValueChange={(val) => handleStatusChange(order.id, val)}
                        >
                          <SelectTrigger className="h-8 w-36 border-0 bg-transparent p-0 shadow-none focus:ring-0">
                            <StatusPill status={order.status} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>
                                <span className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[key]?.dot}`} />
                                  {label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`link-order-detail-${order.id}`}
                        >
                          Ver <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
