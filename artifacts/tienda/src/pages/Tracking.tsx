import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Tracking() {
  const [orderId, setOrderId] = useState("");
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(orderId.trim(), 10);
    if (!orderId.trim() || isNaN(id) || id <= 0) {
      setError("Ingresa un número de pedido válido.");
      return;
    }
    setLocation(`/confirmacion/${id}`);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-5">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Rastrear mi pedido</h1>
          <p className="text-muted-foreground">
            Ingresa el número de pedido que recibiste en tu correo de confirmación.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm"
        >
          <label className="block text-sm font-semibold mb-2">
            Número de pedido
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">#</span>
              <input
                type="text"
                value={orderId}
                onChange={(e) => { setOrderId(e.target.value); setError(""); }}
                placeholder="00001"
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <Button type="submit" className="rounded-xl px-5 font-bold shrink-0">
              <Search className="h-4 w-4 mr-1.5" /> Buscar
            </Button>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3 font-medium">¿Dónde encuentro mi número de pedido?</p>
            <div className="space-y-2">
              {[
                "En el correo de confirmación que te enviamos al comprar",
                "En la página de confirmación que viste al finalizar el pago",
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </motion.form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Tienes problemas con tu pedido?{" "}
          <a
            href={`https://wa.me/56912345678?text=${encodeURIComponent("Hola, necesito ayuda con mi pedido.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline"
          >
            Escríbenos por WhatsApp
          </a>
        </p>
      </div>
    </AppLayout>
  );
}
