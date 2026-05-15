import { AppLayout } from "@/components/layout/AppLayout";
import { formatCLP } from "@/lib/currency";
import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartSession } from "@/hooks/use-cart-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Lock, ShieldCheck, Truck, RotateCcw, ChevronRight, User, MapPin, FileText } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  customerEmail: z.string().email("Correo electrónico inválido"),
  customerPhone: z.string().min(8, "Teléfono inválido").optional().or(z.literal("")),
  shippingAddress: z.string().min(5, "La dirección es requerida"),
  shippingCity: z.string().min(2, "La ciudad es requerida"),
  shippingRegion: z.string().min(2, "La región es requerida"),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const CHILEAN_REGIONS = [
  "Región de Arica y Parinacota",
  "Región de Tarapacá",
  "Región de Antofagasta",
  "Región de Atacama",
  "Región de Coquimbo",
  "Región de Valparaíso",
  "Región Metropolitana",
  "Región del Libertador General Bernardo O'Higgins",
  "Región del Maule",
  "Región de Ñuble",
  "Región del Biobío",
  "Región de La Araucanía",
  "Región de Los Ríos",
  "Región de Los Lagos",
  "Región de Aysén",
  "Región de Magallanes y la Antártica Chilena",
];

function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof User; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
      <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="font-bold text-base">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Checkout() {
  const sessionId = useCartSession();
  const { data: cart, isLoading } = useGetCart(
    { sessionId },
    { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } }
  );

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
      notes: "",
    },
  });

  useEffect(() => {
    if (!isLoading && (!cart || cart.items.length === 0)) {
      setLocation("/carrito");
    }
  }, [cart, isLoading, setLocation]);

  const onSubmit = (values: CheckoutFormValues) => {
    createOrder.mutate(
      { data: { ...values, sessionId } },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
          setLocation(`/confirmacion/${order.id}`);
        },
      }
    );
  };

  if (isLoading || !cart || cart.items.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Progress bar */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 max-w-xl mx-auto text-sm">
            {[
              { label: "Carrito", step: 1 },
              { label: "Datos de envío", step: 2 },
              { label: "Confirmación", step: 3 },
            ].map(({ label, step }, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-2",
                  step === 2 ? "text-foreground" : "text-muted-foreground"
                )}>
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    step === 2
                      ? "bg-primary text-primary-foreground"
                      : step < 2
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {step < 2 ? "✓" : step}
                  </span>
                  <span className={cn("font-medium hidden sm:block", step === 2 && "text-foreground font-bold")}>
                    {label}
                  </span>
                </div>
                {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Finalizar Compra</h1>
          <p className="text-muted-foreground text-sm mt-1">Completa tus datos para procesar el pedido</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Form */}
          <div className="flex-1 order-2 lg:order-1 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Personal info */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <SectionHeader icon={User} title="Datos personales" subtitle="Tu información de contacto" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Nombre completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Juan Pérez"
                              className="h-11 rounded-xl"
                              {...field}
                            />
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
                          <FormLabel className="text-sm font-semibold">Correo electrónico</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="juan@ejemplo.cl"
                              type="email"
                              className="h-11 rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-sm font-semibold">
                            Teléfono <span className="text-muted-foreground font-normal">(opcional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+56 9 1234 5678"
                              className="h-11 rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Shipping info */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <SectionHeader icon={MapPin} title="Dirección de envío" subtitle="¿Dónde entregamos tu pedido?" />
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Dirección</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Av. Providencia 1234, Depto 50"
                              className="h-11 rounded-xl"
                              {...field}
                            />
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
                            <FormLabel className="text-sm font-semibold">Comuna / Ciudad</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Providencia"
                                className="h-11 rounded-xl"
                                {...field}
                              />
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
                            <FormLabel className="text-sm font-semibold">Región</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground"
                                {...field}
                              >
                                <option value="">Selecciona tu región</option>
                                {CHILEAN_REGIONS.map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <SectionHeader
                    icon={FileText}
                    title="Instrucciones adicionales"
                    subtitle="Opcional — indica cualquier detalle para la entrega"
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: Llamar antes de entregar, dejar con el conserje, etc."
                            className="rounded-xl min-h-[80px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-base rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  disabled={createOrder.isPending}
                  data-testid="button-place-order"
                >
                  {createOrder.isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Confirmar Pedido · {formatCLP(cart.total)}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Al confirmar, aceptas nuestros términos y condiciones de compra.
                </p>
              </form>
            </Form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[360px] shrink-0 order-1 lg:order-2">
            <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-primary/5 to-violet-500/5 border-b border-border px-6 py-4">
                <h2 className="font-bold text-base">Resumen de tu pedido</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{cart.itemCount} producto{cart.itemCount !== 1 ? "s" : ""}</p>
              </div>

              <div className="px-6 py-4 space-y-3 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden shrink-0 border border-border/50">
                      {item.product.imageUrl && (
                        <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-sm leading-tight">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Cant: {item.quantity}</p>
                    </div>
                    <div className="font-semibold text-sm shrink-0">{formatCLP(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-5 space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">{formatCLP(cart.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Envío</span>
                  <span className="text-emerald-600 font-semibold">¡Gratis!</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary text-xl">{formatCLP(cart.total)}</span>
                </div>

                {/* Trust section */}
                <div className="pt-3 space-y-2">
                  {[
                    { icon: Lock, label: "Pago 100% seguro con cifrado SSL" },
                    { icon: Truck, label: "Envío gratuito a todo Chile" },
                    { icon: ShieldCheck, label: "Garantía de satisfacción" },
                    { icon: RotateCcw, label: "Devoluciones sin costo" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
