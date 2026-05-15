import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Truck, Clock, RefreshCcw, MapPin, Shield, MessageCircle } from "lucide-react";

const sections = [
  {
    icon: Truck,
    color: "from-blue-500 to-blue-600",
    title: "Envío a todo Chile",
    content: [
      "Despachamos a todas las regiones de Chile, desde Arica y Parinacota hasta Magallanes.",
      "El costo de envío es completamente gratuito en todos los pedidos, sin monto mínimo.",
      "Trabajamos con Starken, Chilexpress y Blue Express para garantizar la mejor cobertura.",
    ],
  },
  {
    icon: Clock,
    color: "from-violet-500 to-violet-600",
    title: "Tiempos de entrega",
    content: [
      "Región Metropolitana: 2–4 días hábiles.",
      "Regiones V, VI, VII y VIII: 3–6 días hábiles.",
      "Regiones extremas (I, II, XI, XII y XV): 7–12 días hábiles.",
      "Los tiempos se cuentan desde la confirmación del pago, no desde el pedido.",
    ],
  },
  {
    icon: RefreshCcw,
    color: "from-emerald-500 to-emerald-600",
    title: "Política de devoluciones",
    content: [
      "Tienes 7 días corridos desde la recepción del producto para solicitar una devolución.",
      "El producto debe estar en su estado original, sin uso, con embalaje y accesorios completos.",
      "Para iniciar una devolución, escríbenos por WhatsApp o correo con fotos del producto.",
      "El costo de devolución es gratuito si el producto tiene algún defecto de fábrica.",
    ],
  },
  {
    icon: Shield,
    color: "from-orange-500 to-orange-600",
    title: "Garantía de productos",
    content: [
      "Todos los productos incluyen garantía de al menos 6 meses contra defectos de fábrica.",
      "En caso de un producto defectuoso, lo reemplazamos sin costo adicional.",
      "Para hacer válida la garantía, guarda el comprobante de compra y el embalaje original.",
    ],
  },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export default function Shipping() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-14 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Logística</p>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Envíos y Devoluciones</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Todo lo que necesitas saber sobre cómo enviamos tus productos y nuestra política de devoluciones.
          </p>
        </motion.div>

        {/* Highlight strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mb-10"
        >
          {[
            { icon: Truck,   label: "Envío gratis",    sub: "A todo Chile" },
            { icon: Clock,   label: "2–12 días",       sub: "Tiempo estimado" },
            { icon: RefreshCcw, label: "7 días",       sub: "Para devolver" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-sm font-bold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Sections */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                variants={fadeUp}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <div className={`flex items-center gap-3 px-6 py-4 bg-gradient-to-r ${section.color}`}>
                  <Icon className="h-5 w-5 text-white shrink-0" />
                  <h2 className="font-bold text-white">{section.title}</h2>
                </div>
                <ul className="px-6 py-5 space-y-2.5">
                  {section.content.map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      {line}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">¿Tienes dudas sobre tu envío?</p>
          <a
            href={`https://wa.me/56912345678?text=${encodeURIComponent("Hola, tengo una consulta sobre el envío de mi pedido.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-4 w-4" /> Consultar por WhatsApp
          </a>
        </motion.div>
      </div>
    </AppLayout>
  );
}
