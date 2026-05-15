import { AppLayout } from "@/components/layout/AppLayout";
import { formatCLP } from "@/lib/currency";
import { useGetOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Confirmation({ params }: { params: { orderId: string } }) {
  const orderId = parseInt(params.orderId, 10);
  const { data: order, isLoading } = useGetOrder(orderId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 flex flex-col items-center max-w-2xl text-center">
          <Skeleton className="h-16 w-16 rounded-full mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-12" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Pedido no encontrado</h2>
          <Button asChild><Link href="/">Volver al inicio</Link></Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-500 mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">¡Gracias por tu compra!</h1>
            <p className="text-muted-foreground text-lg">
              Tu pedido ha sido confirmado y está siendo procesado.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
            <div className="bg-muted p-6 border-b border-border flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Número de pedido</p>
                <p className="font-mono font-bold text-lg">#{order.id.toString().padStart(5, '0')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Fecha</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('es-CL')}</p>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" /> Detalles del pedido
              </h3>
              
              <div className="space-y-4 mb-6">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{item.quantity}x</span>
                      <span className="font-medium line-clamp-1">{item.productName}</span>
                    </div>
                    <span className="font-semibold shrink-0">{formatCLP(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCLP(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span>Gratis</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total pagado</span>
                  <span className="text-primary">{formatCLP(order.total)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 p-6 border-t border-border">
              <h3 className="font-semibold mb-2">Información de envío</h3>
              <p className="text-sm text-muted-foreground">
                {order.customerName}<br/>
                {order.shippingAddress}<br/>
                {order.shippingCity}, {order.shippingRegion}<br/>
                {order.customerEmail}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/productos">
                Seguir comprando <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
