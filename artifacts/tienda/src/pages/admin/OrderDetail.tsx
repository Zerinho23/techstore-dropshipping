import { formatCLP } from "@/lib/currency";
import { useGetOrder, useUpdateOrderStatus, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowLeft, Package, Clock, CheckCircle2, XCircle, Truck, TrendingUp,
  Mail, Phone, MapPin, ExternalLink, ChevronDown, User, ShoppingBag,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState } from "react";

const STATUS_STEPS = [
  { key: "pending",    label: "Pendiente",  icon: Clock,         color: "text-amber-500",   bg: "bg-amber-100",   ring: "ring-amber-300" },
  { key: "processing", label: "Procesando", icon: TrendingUp,    color: "text-blue-500",    bg: "bg-blue-100",    ring: "ring-blue-300" },
  { key: "shipped",    label: "Enviado",    icon: Truck,         color: "text-purple-500",  bg: "bg-purple-100",  ring: "ring-purple-300" },
  { key: "delivered",  label: "Entregado",  icon: CheckCircle2,  color: "text-emerald-500", bg: "bg-emerald-100", ring: "ring-emerald-300" },
];

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  pending:    { label: "Pendiente",  badge: "bg-amber-50 text-amber-700 border-amber-200",     dot: "bg-amber-400" },
  processing: { label: "Procesando", badge: "bg-blue-50 text-blue-700 border-blue-200",         dot: "bg-blue-400" },
  shipped:    { label: "Enviado",    badge: "bg-purple-50 text-purple-700 border-purple-200",   dot: "bg-purple-400" },
  delivered:  { label: "Entregado",  badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  cancelled:  { label: "Cancelado",  badge: "bg-red-50 text-red-700 border-red-200",            dot: "bg-red-400" },
};

function StatusDropdown({ current, onChange }: { current: string; onChange: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[current] ?? STATUS_CONFIG.pending;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border ${cfg.badge} hover:opacity-80 transition-opacity`}
      >
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        {cfg.label}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden min-w-[180px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pt-3 pb-1">Cambiar estado</p>
            {Object.entries(STATUS_CONFIG).map(([key, s]) => (
              <button
                key={key}
                onClick={() => { onChange(key); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors ${key === current ? "bg-slate-50" : ""}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                {s.label}
                {key === current && <span className="ml-auto text-primary font-bold">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminOrderDetail({ params }: { params: { id: string } }) {
  const orderId = parseInt(params.id, 10);
  const { data: order, isLoading } = useGetOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({ id: orderId, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
        toast({ title: "Estado actualizado correctamente" });
      },
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="md:col-span-2 h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="p-5 rounded-2xl bg-slate-100">
            <ShoppingBag className="h-9 w-9 text-slate-400" />
          </div>
          <p className="font-bold text-slate-700">Pedido no encontrado</p>
          <Link href="/admin/pedidos" className="text-sm text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver a pedidos
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const stepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/admin/pedidos"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Pedidos
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-800">
            Pedido <span className="font-mono">#{String(order.id).padStart(5, "0")}</span>
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {new Date(order.createdAt).toLocaleString("es-CL")}
            </span>
            <StatusDropdown current={order.status} onChange={handleStatusChange} />
          </div>
        </div>

        {/* Status timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Progreso del pedido</p>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i <= stepIdx;
                const active = i === stepIdx;
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        done
                          ? `${step.bg} ${step.color} ${active ? `ring-2 ${step.ring} ring-offset-2` : ""}`
                          : "bg-slate-100 text-slate-300"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className={`text-[10px] font-semibold whitespace-nowrap ${done ? step.color : "text-slate-300"}`}>
                        {step.label}
                      </p>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full mb-4 transition-colors ${i < stepIdx ? "bg-emerald-200" : "bg-slate-100"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm font-semibold text-red-700">Este pedido fue cancelado.</p>
          </div>
        )}

        {/* Body grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-400" />
                  Artículos del pedido
                </h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                  {order.items.length} ítem{order.items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 px-5 py-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                      {item.imageUrl
                        ? <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.productName} />
                        : <div className="w-full h-full flex items-center justify-center"><Package className="h-5 w-5 text-slate-300" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{item.productName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Cantidad: {item.quantity} × {formatCLP(item.price)}</p>
                      </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-800">{formatCLP(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Total */}
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Subtotal</span>
                  <span className="text-sm font-semibold text-slate-800">{formatCLP(order.total)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-slate-500">Despacho</span>
                  <span className="text-sm font-semibold text-emerald-600">Gratis</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="text-xl font-bold text-slate-800">{formatCLP(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">Nota del cliente</p>
                <p className="text-sm text-amber-800 italic">"{order.notes}"</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Customer */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" /> Cliente
                </h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {order.customerName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{order.customerName}</p>
                    <p className="text-xs text-slate-400">Cliente</p>
                  </div>
                </div>
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-primary transition-colors group"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary" />
                  {order.customerEmail}
                </a>
                {order.customerPhone && (
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-primary transition-colors group"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary" />
                    {order.customerPhone}
                  </a>
                )}
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" /> Dirección de envío
                </h2>
              </div>
              <div className="p-5">
                <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 leading-relaxed">
                  <p className="font-medium">{order.shippingAddress}</p>
                  <p className="text-slate-500 mt-0.5">{order.shippingCity}</p>
                  <p className="text-slate-500">{order.shippingRegion}</p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Acciones rápidas</p>
              <a
                href={`mailto:${order.customerEmail}?subject=Tu pedido %23${String(order.id).padStart(5,"0")} - TechStore`}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-blue-400" />
                Enviar email al cliente
              </a>
              <a
                href="https://aliexpress.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-semibold transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Buscar en AliExpress</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
