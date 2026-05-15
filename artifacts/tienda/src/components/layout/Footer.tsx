import { Link } from "wouter";
import { Zap, Mail, Phone, MapPin, ArrowUpRight, Shield, Truck, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { name: "Audio & Auriculares", slug: "audio" },
  { name: "Smartphones",         slug: "smartphones" },
  { name: "Computación",         slug: "computacion" },
  { name: "Gaming",              slug: "gaming" },
  { name: "Electrónica",         slug: "electronica" },
  { name: "Hogar Inteligente",   slug: "hogar" },
];

const support = [
  { name: "Preguntas Frecuentes",  href: "/faq" },
  { name: "Envíos y Devoluciones", href: "/envios" },
  { name: "Seguimiento de pedido", href: "/seguimiento" },
  { name: "Términos de Servicio",  href: "/terminos" },
  { name: "Política de Privacidad",href: "/privacidad" },
];

const guarantees = [
  { icon: Shield,      label: "Compra 100% segura" },
  { icon: Truck,       label: "Envío a todo Chile" },
  { icon: RefreshCcw,  label: "Devoluciones fáciles" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast({ variant: "destructive", title: "Email inválido", description: "Ingresa un correo válido." });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmail("");
      toast({
        title: "¡Suscripción exitosa!",
        description: "Te avisaremos de las mejores ofertas antes que nadie.",
      });
    }, 800);
  };

  return (
    <footer className="bg-[#080d1a] text-slate-400 mt-auto">
      {/* Guarantee strip */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            {guarantees.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.label} className="flex items-center gap-3 px-6 py-4">
                  <div className="p-2 rounded-lg bg-primary/15 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{g.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="bg-primary text-primary-foreground p-2 rounded-xl">
                <Zap className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">TechStore</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Tu tienda de tecnología de confianza en Chile. Gadgets, periféricos y accesorios seleccionados al mejor precio.
            </p>
            <div className="space-y-2.5 text-sm">
              <a href="mailto:contacto@techstore.cl"
                className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                contacto@techstore.cl
              </a>
              <a href="tel:+56912345678"
                className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                +56 9 1234 5678
              </a>
              <span className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                Santiago, Chile
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-5">Categorías</h4>
            <ul className="space-y-2.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/productos?category=${c.slug}`}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors group"
                  >
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-1 transition-opacity text-primary" />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-5">Soporte</h4>
            <ul className="space-y-2.5">
              {support.map((s) => (
                <li key={s.name}>
                  <Link
                    href={s.href}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors group"
                  >
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-1 transition-opacity text-primary" />
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-5">Ofertas exclusivas</h4>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Recibe alertas de descuentos y nuevos productos antes que nadie.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 rounded-xl px-4 py-2.5 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground text-sm font-semibold rounded-xl py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Suscribiendo..." : "Suscribirme"}
              </button>
            </form>
            <p className="text-[11px] text-slate-600 mt-2">Sin spam. Cancela cuando quieras.</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} TechStore Chile. Todos los derechos reservados.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Tienda activa
            </span>
            <span>Dropshipping vía AliExpress</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
