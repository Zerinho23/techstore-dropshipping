import { formatCLP } from "@/lib/currency";
import {
  useGetDashboardSummary,
  useGetRecentOrders,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Package, ShoppingCart, TrendingUp, AlertTriangle, ArrowUpRight,
  Clock, CheckCircle2, XCircle, Truck, BarChart3, Star, ShoppingBag, Target,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const STATUS_CONFIG: Record<string, { label: string; dot: string; icon: typeof Clock; color: string }> = {
  pending:    { label: "Pendiente",  dot: "bg-yellow-500", icon: Clock,        color: "#f59e0b" },
  processing: { label: "Procesando", dot: "bg-blue-500",   icon: TrendingUp,   color: "#3b82f6" },
  shipped:    { label: "Enviado",    dot: "bg-purple-500", icon: Truck,        color: "#8b5cf6" },
  delivered:  { label: "Entregado",  dot: "bg-green-500",  icon: CheckCircle2, color: "#22c55e" },
  cancelled:  { label: "Cancelado",  dot: "bg-red-500",    icon: XCircle,      color: "#ef4444" },
};

/* ── Solid-gradient stat card ── */
function StatCard({
  title, value, sub, icon: Icon, gradient, iconGlow, link,
}: {
  title: string; value: string; sub: string; icon: typeof TrendingUp;
  gradient: string; iconGlow: string; link?: string;
}) {
  const inner = (
    <div
      className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 h-full group"
      style={{ background: gradient }}
    >
      {/* Decorative circle */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
        style={{ background: "rgba(255,255,255,0.3)" }} />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10"
        style={{ background: "rgba(255,255,255,0.5)" }} />

      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white truncate">{value}</p>
        </div>
        <div className="p-3 rounded-2xl shrink-0 ml-3"
          style={{ background: iconGlow }}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="relative flex items-center justify-between">
        <p className="text-xs text-white/65 leading-tight">{sub}</p>
        {link && (
          <span className="flex items-center gap-0.5 text-xs font-bold text-white/80 group-hover:text-white transition-colors">
            Ver <ArrowUpRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  );

  return link ? (
    <Link href={link} className="block h-full">
      {inner}
    </Link>
  ) : (
    <div className="h-full">{inner}</div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, dot: "bg-gray-400", icon: Clock, color: "#9ca3af" };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name === "revenue" ? formatCLP(p.value) : `${p.value} pedidos`}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: recentOrders, isLoading: loadingOrders } = useGetRecentOrders();

  const stats = [
    {
      title: "Ingresos Totales",
      value: formatCLP(summary?.totalRevenue ?? 0),
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      iconGlow: "rgba(255,255,255,0.2)",
      sub: summary?.totalOrders ? `${summary.totalOrders} ventas en total` : "Sin ventas aún",
      link: "/admin/pedidos",
    },
    {
      title: "Pedidos Pendientes",
      value: String(summary?.pendingOrders ?? 0),
      icon: Clock,
      gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      iconGlow: "rgba(255,255,255,0.2)",
      sub: "Requieren atención urgente",
      link: "/admin/pedidos",
    },
    {
      title: "Valor Promedio",
      value: formatCLP(summary?.avgOrderValue ?? 0),
      icon: Target,
      gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      iconGlow: "rgba(255,255,255,0.2)",
      sub: "Por pedido",
    },
    {
      title: "Entregas Completadas",
      value: String(summary?.deliveredOrders ?? 0),
      icon: CheckCircle2,
      gradient: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      iconGlow: "rgba(255,255,255,0.2)",
      sub: `${summary?.totalOrders ? Math.round(((summary?.deliveredOrders ?? 0) / summary.totalOrders) * 100) : 0}% tasa de entrega`,
    },
    {
      title: "Productos Activos",
      value: String(summary?.totalProducts ?? 0),
      icon: Package,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      iconGlow: "rgba(255,255,255,0.2)",
      sub: `${summary?.lowStockProducts ?? 0} con stock bajo`,
      link: "/admin/productos",
    },
  ];

  const pieData = (summary?.ordersByStatus ?? []).map((s) => ({
    name: STATUS_CONFIG[s.status]?.label ?? s.status,
    value: s.count,
    color: STATUS_CONFIG[s.status]?.color ?? "#9ca3af",
  }));

  const chartData = (summary?.revenueByDay ?? []).map((d) => ({
    date: formatShortDate(d.date),
    revenue: d.revenue,
    orders: d.orders,
    fullDate: d.date,
  }));

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-52" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/productos"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors">
              <Package className="h-3.5 w-3.5" /> Productos
            </Link>
            <Link href="/admin/pedidos"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
              <ShoppingBag className="h-3.5 w-3.5" /> Ver pedidos
            </Link>
          </div>
        </div>

        {/* Stat Cards — solid gradient backgrounds */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>

        {/* Revenue Chart + Order Status */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Area Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Ingresos — últimos 30 días</CardTitle>
                  <CardDescription>Evolución de ventas diarias en CLP</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total 30 días</p>
                  <p className="text-sm font-bold text-emerald-600">
                    {formatCLP(summary?.revenueByDay?.reduce((a, b) => a + b.revenue, 0) ?? 0)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.every((d) => d.revenue === 0) ? (
                <div className="flex flex-col items-center justify-center h-52 text-muted-foreground gap-2">
                  <BarChart3 className="h-10 w-10 opacity-20" />
                  <p className="text-sm">No hay ventas registradas todavía.</p>
                  <p className="text-xs opacity-60">Los datos aparecerán aquí cuando recibas pedidos.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false}
                      tickFormatter={(v) => v === 0 ? "0" : `$${(v / 1000).toFixed(0)}k`} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2}
                      fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: "hsl(var(--primary))" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Order Status Pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Estado de pedidos</CardTitle>
              <CardDescription>Distribución actual por estado</CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 text-muted-foreground gap-2">
                  <ShoppingCart className="h-10 w-10 opacity-20" />
                  <p className="text-sm">Sin pedidos aún.</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [`${value}`, name]}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
                          <span className="text-muted-foreground">{entry.name}</span>
                        </span>
                        <span className="font-semibold">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products + Low Stock */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" /> Más vendidos
                  </CardTitle>
                  <CardDescription>Top 5 productos por unidades</CardDescription>
                </div>
                <Link href="/admin/productos" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Ver todos <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!summary?.topProducts || summary.topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                  <Package className="h-8 w-8 opacity-20" />
                  <p className="text-sm">Sin ventas registradas.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {summary.topProducts.map((p, i) => {
                    const maxSales = summary.topProducts[0]?.sales ?? 1;
                    const pct = Math.round((p.sales / maxSales) * 100);
                    return (
                      <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                        <span className={`text-sm font-bold w-5 shrink-0 ${i === 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${i === 0 ? "bg-amber-400" : "bg-primary/50"}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{p.sales} uds</span>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-emerald-600 shrink-0">{formatCLP(p.revenue)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={summary && summary.lowStockProducts > 0 ? "border-orange-200 dark:border-orange-900" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${summary && summary.lowStockProducts > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
                    Alertas de inventario
                  </CardTitle>
                  <CardDescription>Productos con menos de 5 unidades</CardDescription>
                </div>
                <Link href="/admin/productos" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Gestionar <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!summary?.lowStockItems || summary.lowStockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                  <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
                  <p className="text-sm font-medium text-green-600">¡Stock en buen estado!</p>
                  <p className="text-xs text-muted-foreground">Todos los productos tienen stock suficiente.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {summary.lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`w-2 h-1.5 rounded-sm ${i < item.stock ? "bg-orange-400" : "bg-muted"}`} />
                          ))}
                        </div>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${item.stock === 0 ? "text-red-600" : "text-orange-500"}`}>
                        {item.stock === 0 ? "Agotado" : `${item.stock} uds`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Pedidos recientes</CardTitle>
                <CardDescription>Últimos 10 pedidos recibidos</CardDescription>
              </div>
              <Link href="/admin/pedidos" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingOrders ? (
              <div className="p-5 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : !recentOrders || recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-2">
                <ShoppingCart className="h-10 w-10 opacity-20" />
                <p className="text-sm">No hay pedidos aún.</p>
                <p className="text-xs opacity-60">Los pedidos de tus clientes aparecerán aquí.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                      <th className="text-left px-5 py-3">Pedido</th>
                      <th className="text-left px-5 py-3">Cliente</th>
                      <th className="text-left px-5 py-3">Estado</th>
                      <th className="text-left px-5 py-3">Total</th>
                      <th className="text-left px-5 py-3 hidden md:table-cell">Items</th>
                      <th className="text-left px-5 py-3 hidden lg:table-cell">Fecha</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors group">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-muted-foreground">#{String(order.id).padStart(5, "0")}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-sm">{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                        </td>
                        <td className="px-5 py-3.5"><StatusPill status={order.status} /></td>
                        <td className="px-5 py-3.5 font-bold text-foreground">{formatCLP(order.total)}</td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground hidden md:table-cell">
                          {order.items?.length ?? 0} producto{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground hidden lg:table-cell">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <Link href={`/admin/pedidos/${order.id}`}
                            className="opacity-0 group-hover:opacity-100 text-xs text-primary font-semibold hover:underline transition-opacity flex items-center gap-0.5">
                            Ver <ArrowUpRight className="h-3 w-3" />
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

      </div>
    </AdminLayout>
  );
}
