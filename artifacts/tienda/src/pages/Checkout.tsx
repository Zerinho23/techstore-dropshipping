import { AppLayout } from "@/components/layout/AppLayout";
import { formatCLP } from "@/lib/currency";
import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartSession } from "@/hooks/use-cart-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  customerEmail: z.string().email("Correo electrónico inválido"),
  customerPhone: z.string().min(8, "Teléfono inválido").optional().or(z.literal('')),
  shippingAddress: z.string().min(5, "La dirección es requerida"),
  shippingCity: z.string().min(2, "La ciudad es requerida"),
  shippingRegion: z.string().min(2, "La región es requerida"),
  notes: z.string().optional()
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const sessionId = useCartSession();
  const { data: cart, isLoading } = useGetCart({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } });
  
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      shippingCity: "",
      shippingRegion: "",
      notes: ""
    }
  });

  useEffect(() => {
    if (!isLoading && (!cart || cart.items.length === 0)) {
      setLocation('/carrito');
    }
  }, [cart, isLoading, setLocation]);

  const onSubmit = (values: CheckoutFormValues) => {
    createOrder.mutate({ 
      data: {
        ...values,
        sessionId
      }
    }, {
      onSuccess: (order) => {
        // Clear cart cache
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
        // Redirect to confirmation
        setLocation(`/confirmacion/${order.id}`);
      }
    });
  };

  if (isLoading || !cart || cart.items.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Finalizar Compra</h1>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Form */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 border-b border-border pb-4">Información de Envío</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input placeholder="juan@ejemplo.cl" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+56 9 1234 5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección de envío</FormLabel>
                        <FormControl>
                          <Input placeholder="Av. Providencia 1234, Depto 50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comuna / Ciudad</FormLabel>
                          <FormControl>
                            <Input placeholder="Providencia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shippingRegion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Región</FormLabel>
                          <FormControl>
                            <Input placeholder="Región Metropolitana" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas del pedido (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Instrucciones especiales para la entrega..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full text-base h-12"
                    disabled={createOrder.isPending}
                    data-testid="button-place-order"
                  >
                    {createOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmar Pedido - {formatCLP(cart.total)}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="w-full lg:w-96 order-1 lg:order-2">
            <div className="bg-muted/50 border border-border rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Resumen de tu pedido</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 bg-background rounded overflow-hidden shrink-0 border border-border">
                      {item.product.imageUrl && <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{item.product.name}</p>
                      <p className="text-muted-foreground">Cant: {item.quantity}</p>
                    </div>
                    <div className="font-semibold shrink-0">
                      {formatCLP(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 pt-4 border-t border-border text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCLP(cart.total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío</span>
                  <span className="text-primary font-medium">Gratis</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{formatCLP(cart.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
