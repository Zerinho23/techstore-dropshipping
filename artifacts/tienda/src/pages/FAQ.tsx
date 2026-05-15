import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";

const faqs = [
  {
    category: "Pedidos",
    items: [
      {
        q: "¿Cómo realizo un pedido?",
        a: "Agrega los productos que deseas al carrito, luego ingresa a 'Carrito' y completa el proceso de checkout con tus datos de envío. Recibirás un correo de confirmación al finalizar.",
      },
      {
        q: "¿Puedo cancelar o modificar mi pedido?",
        a: "Puedes cancelar tu pedido dentro de las primeras 2 horas después de realizarlo. Para hacerlo, contáctanos por WhatsApp o correo electrónico indicando tu número de pedido.",
      },
      {
        q: "¿Cómo rastro mi pedido?",
        a: "Visita nuestra página de 'Seguimiento de pedido' e ingresa el número de pedido que recibiste en tu correo de confirmación.",
      },
    ],
  },
  {
    category: "Envíos",
    items: [
      {
        q: "¿A qué regiones envían?",
        a: "Enviamos a todo Chile, incluyendo todas las regiones desde Arica hasta Magallanes. Los tiempos de entrega varían según la región.",
      },
      {
        q: "¿Cuánto demora el envío?",
        a: "El tiempo estimado de entrega es de 3 a 7 días hábiles para la Región Metropolitana, y de 5 a 12 días hábiles para regiones extremas.",
      },
      {
        q: "¿El envío tiene costo?",
        a: "El envío es gratuito en todos nuestros pedidos. No cobramos tarifa adicional por despacho a ninguna región de Chile.",
      },
    ],
  },
  {
    category: "Pagos",
    items: [
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos transferencia bancaria, tarjetas de crédito y débito (Visa, Mastercard), y pago en efectivo a través de Khipu y Webpay.",
      },
      {
        q: "¿Es seguro pagar en TechStore?",
        a: "Sí, todas las transacciones están encriptadas con SSL. Nunca almacenamos los datos de tu tarjeta y usamos plataformas de pago certificadas.",
      },
    ],
  },
  {
    category: "Devoluciones",
    items: [
      {
        q: "¿Cómo solicito una devolución?",
        a: "Tienes 7 días desde la recepción del producto para solicitar una devolución. Contáctanos por WhatsApp o correo con fotos del producto y tu número de pedido.",
      },
      {
        q: "¿Cuándo recibo mi reembolso?",
        a: "Una vez aprobada la devolución, el reembolso se procesa en 3 a 5 días hábiles dependiendo de tu banco.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="font-medium text-sm leading-snug">{q}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border bg-muted/20">
          <p className="pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-14 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Soporte</p>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Preguntas Frecuentes</h1>
          <p className="text-muted-foreground">
            Encuentra respuestas a las preguntas más comunes sobre pedidos, envíos y devoluciones.
          </p>
        </motion.div>

        <div className="space-y-10">
          {faqs.map((section, si) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.08, duration: 0.4 }}
            >
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                {section.category}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <FaqItem key={item.q} {...item} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center"
        >
          <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold mb-1.5">¿No encontraste tu respuesta?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Escríbenos directamente y te respondemos en menos de 1 hora.
          </p>
          <a
            href={`https://wa.me/56912345678?text=${encodeURIComponent("Hola, tengo una pregunta sobre TechStore.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-4 w-4" /> Contactar por WhatsApp
          </a>
        </motion.div>
      </div>
    </AppLayout>
  );
}
