import { formatCLP } from "@/lib/currency";
import {
  useGetDashboardSummary,
  useGetRecentOrders,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  processing: { label: "Procesando", color: "bg-blue-100 text-blue-800 border-blue-200", icon: TrendingUp },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800 border-purple-200", icon: Truck },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
};

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#22c55e", "#ef4444"];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: recentOrders, isLoading: loadingOrders } = useGetRecentOrders();

  const stats = [
    {
      title: "Ingresos Totales",
      value: formatCLP(summary?.totalRevenue ?? 0),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-100 dark:border-green-900",
      sub: "Ventas acumuladas",
    },
    {
      title: "Pedidos Totales",
      value: String(summary?.totalOrders ?? 0),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-100 dark:border-blue-900",
      sub: "Órdenes recibidas",
    },
    {
      title: "Pedidos Pendientes",
      value: String(summary?.pendingOrders ?? 0),
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      border: "border-yellow-100 dark:border-yellow-900",
      sub: "Requieren atención",
    },
    {
      title: "Productos Activos",
      value: String(summary?.totalProducts ?? 0),
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-100 dark:border-purple-900",
      sub: `${summary?.lowStockProducts ?? 0} con stock bajo`,
    },
  ];

  // Build pie chart data from recent orders
  const statusCounts: Record<string, number> = {};
  recentOrders?.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  });
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_CONFIG[status]?.label ?? status,
    value: count,
  }));

  // Build bar chart for top products
  const barData = (summary?.topProducts ?? []).map((p) => ({
    name: p.name.length > 20 ? p.name.slice(0, 18) + "…" : p.name,
    ventas: p.sales,
    ingresos: p.revenue,
  }));

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Resumen general de tu tienda de dropshipping.
            </p>
          </div>
          <Link
            href="/admin/pedidos"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Ver todos los pedidos <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className={`border ${stat.border} ${stat.bg} shadow-none`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        {stat.title}
                      </p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${stat.bg} border ${stat.border}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Products Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Productos más vendidos</CardTitle>
              <CardDescription>Unidades vendidas por producto</CardDescription>
            </CardHeader>
            <CardContent>
              {barData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 text-muted-foreground text-sm gap-2">
                  <Package className="h-8 w-8 opacity-30" />
                  No hay ventas registradas aún.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      formatter={(value: number) => [`${value} uds`, "Ventas"]}
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Order Status Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Estado de pedidos</CardTitle>
              <CardDescription>Distribución de los últimos 10 pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 text-muted-foreground text-sm gap-2">
                  <ShoppingCart className="h-8 w-8 opacity-30" />
                  No hay pedidos registrados aún.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value} pedidos`, name]}
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Pedidos Recientes</CardTitle>
                <CardDescription>Últimos pedidos recibidos en la tienda</CardDescription>
              </div>
              <Link href="/admin/pedidos" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingOrders ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : !recentOrders || recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm gap-2">
                <ShoppingCart className="h-8 w-8 opacity-30" />
                No hay pedidos recientes.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                      <th className="text-left px-6 py-3">#</th>
                      <th className="text-left px-6 py-3">Cliente</th>
                      <th className="text-left px-6 py-3">Estado</th>
                      <th className="text-left px-6 py-3">Total</th>
                      <th className="text-left px-6 py-3">Fecha</th>
                      <th className="text-left px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, i) => (
                      <tr
                        key={order.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">
                          #{order.id}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-medium text-foreground">{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-foreground">
                          {formatCLP(order.total)}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-3.5">
                          <Link
                            href={`/admin/pedidos/${order.id}`}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low stock warning */}
        {summary && summary.lowStockProducts > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900 shadow-none">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="mt-0.5 p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-orange-800 dark:text-orange-300 text-sm">
                  {summary.lowStockProducts} producto{summary.lowStockProducts > 1 ? "s" : ""} con stock bajo
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">
                  Revisa tu inventario y actualiza los productos antes de que se agoten.
                </p>
                <Link
                  href="/admin/productos"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-orange-700 dark:text-orange-300 hover:underline"
                >
                  Ir a gestión de productos <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
