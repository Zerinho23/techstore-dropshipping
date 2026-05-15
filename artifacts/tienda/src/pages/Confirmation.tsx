import { AppLayout } from "@/components/layout/AppLayout";
import { formatCLP } from "@/lib/currency";
import { useGetOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  CheckCircle2, Package, ArrowRight, Truck, Clock,
  MapPin, Mail, ShoppingBag, Home, Star,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const steps = [
  { icon: CheckCircle2, label: "Pedido confirmado",   desc: "Recibimos tu pedido",           color: "text-emerald-500", bg: "bg-emerald-500" },
  { icon: Package,      label: "En preparación",      desc: "Estamos preparando tu pedido",  color: "text-blue-500",    bg: "bg-blue-500" },
  { icon: Truck,        label: "En camino",            desc: "Tu pedido fue despachado",      color: "text-violet-500",  bg: "bg-violet-500" },
  { icon: Home,         label: "Entregado",            desc: "¡Disfuta tu compra!",           color: "text-orange-500",  bg: "bg-orange-500" },
];

export default function Confirmation({ params }: { params: { orderId: string } }) {
  const orderId = parseInt(params.orderId, 10);
  const { data: order, isLoading } = useGetOrder(orderId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="text-center mb-10">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-6" />
            <Skeleton className="h-9 w-72 mx-auto mb-3" />
            <Skeleton className="h-5 w-52 mx-auto" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <div className="text-6xl mb-6">📦</div>
          <h2 className="text-2xl font-bold mb-3">Pedido no encontrado</h2>
          <p className="text-muted-foreground mb-8">
            No pudimos encontrar este pedido. Verifica el número e inténtalo de nuevo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/seguimiento">Buscar mi pedido</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/">Ir al inicio</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-10 max-w-2xl">

        {/* ── Hero celebration ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-10"
        >
          {/* Animated checkmark */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </motion.div>
            </div>
            {/* Floating stars */}
            {["-top-2 -right-2", "-bottom-1 -left-3", "top-1 -left-4"].map((pos, i) => (
              <motion.div key={i}
                className={`absolute ${pos}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              ¡Gracias por tu compra!
            </h1>
            <p className="text-muted-foreground text-base">
              Tu pedido ha sido confirmado y está siendo procesado.
            </p>
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
              Pedido #{order.id.toString().padStart(5, "0")}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Order timeline ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6 mb-5"
        >
          <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-5">Estado del pedido</h3>
          <div className="flex items-start justify-between gap-2">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const active = i === 0;
              return (
                <div key={step.label} className="flex flex-col items-center flex-1 gap-2 relative">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-0.5 ${active ? "bg-emerald-200 dark:bg-emerald-900" : "bg-muted"}`} />
                  )}
                  <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${active ? step.bg : "bg-muted"}`}>
                    <Icon className={`h-4 w-4 ${active ? "text-white" : "text-muted-foreground"}`} />
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-bold leading-tight ${active ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 hidden sm:block">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Order summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl overflow-hidden mb-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Detalle del pedido</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString("es-CL")}</p>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-border/50">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-6 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-muted border border-border shrink-0 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold shrink-0">{formatCLP(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-6 py-4 border-t border-border bg-muted/20 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCLP(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Envío</span>
              <span className="text-emerald-600 font-medium">Gratis</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-1.5 border-t border-border">
              <span>Total pagado</span>
              <span className="text-primary">{formatCLP(order.total)}</span>
            </div>
          </div>
        </motion.div>

        {/* ── Shipping info ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8"
        >
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" /> Información de envío
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-2.5">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="text-muted-foreground">
                <p className="font-semibold text-foreground">{order.customerName}</p>
                <p>{order.shippingAddress}</p>
                <p>{order.shippingCity}, {order.shippingRegion}</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="text-muted-foreground">
                <p className="font-semibold text-foreground">Confirmación enviada a</p>
                <p>{order.customerEmail}</p>
                <p className="flex items-center gap-1 mt-1 text-xs">
                  <Clock className="h-3 w-3" /> Tiempo estimado: 3–7 días hábiles
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button asChild size="lg" className="flex-1 rounded-xl font-bold">
            <Link href="/productos">
              Seguir comprando <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="flex-1 rounded-xl font-bold">
            <Link href="/seguimiento">
              Rastrear pedido
            </Link>
          </Button>
        </motion.div>

      </div>
    </AppLayout>
  );
}
