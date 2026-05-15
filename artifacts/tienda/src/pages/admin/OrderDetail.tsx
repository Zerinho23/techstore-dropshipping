import { AppLayout } from "@/components/layout/AppLayout";
import { formatCLP } from "@/lib/currency";
import { useGetOrder, useUpdateOrderStatus, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Package, Clock, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/AdminLayout";

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
        toast({ title: "Estado actualizado" });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-600";
      case "processing": return "bg-blue-500/10 text-blue-600";
      case "shipped": return "bg-purple-500/10 text-purple-600";
      case "delivered": return "bg-green-500/10 text-green-600";
      case "cancelled": return "bg-red-500/10 text-red-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  if (isLoading) {
    return <AdminLayout><div className="p-8">Cargando...</div></AdminLayout>;
  }

  if (!order) return <AdminLayout><div className="p-8">Pedido no encontrado</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/pedidos"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">Pedido #{order.id.toString().padStart(5, '0')}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-3 w-3" /> {new Date(order.createdAt).toLocaleString('es-CL')}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm font-medium">Estado:</span>
            <Select value={order.status} onValueChange={handleStatusChange}>
              <SelectTrigger className={`w-36 ${getStatusColor(order.status)} font-medium border-0`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" /> Artículos
              </h2>
              
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-muted rounded overflow-hidden shrink-0 border border-border">
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium leading-tight">{item.productName}</p>
                      <p className="text-sm text-muted-foreground mt-1">Precio unitario: {formatCLP(item.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCLP(item.price * item.quantity)}</p>
                      <p className="text-sm text-muted-foreground">Cant: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCLP(order.total)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{formatCLP(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {order.notes && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-semibold mb-2">Notas del cliente</h2>
                <p className="text-sm bg-muted/50 p-3 rounded-md italic">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-4">Cliente</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Nombre</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Correo electrónico</p>
                  <p className="font-medium">
                    <a href={`mailto:${order.customerEmail}`} className="text-primary hover:underline">
                      {order.customerEmail}
                    </a>
                  </p>
                </div>
                {order.customerPhone && (
                  <div>
                    <p className="text-muted-foreground mb-1">Teléfono</p>
                    <p className="font-medium">{order.customerPhone}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-4">Dirección de Envío</h2>
              <p className="text-sm leading-relaxed">
                {order.shippingAddress}<br />
                {order.shippingCity}<br />
                {order.shippingRegion}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
