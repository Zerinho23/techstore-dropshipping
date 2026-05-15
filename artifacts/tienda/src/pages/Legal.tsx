import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Shield, Lock } from "lucide-react";

const terminos = [
  {
    title: "1. Aceptación de términos",
    content:
      "Al acceder y utilizar TechStore Chile, aceptas quedar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguno de ellos, te pedimos que no uses nuestros servicios.",
  },
  {
    title: "2. Descripción del servicio",
    content:
      "TechStore es una tienda de dropshipping que comercializa productos de tecnología en Chile. Actuamos como intermediarios entre proveedores y clientes finales.",
  },
  {
    title: "3. Proceso de compra",
    content:
      "Al realizar un pedido, el cliente acepta que el precio mostrado en la página es el precio final. Las compras están sujetas a disponibilidad de stock. Nos reservamos el derecho de cancelar pedidos por razones justificadas.",
  },
  {
    title: "4. Precios",
    content:
      "Todos los precios mostrados están en pesos chilenos (CLP) e incluyen IVA. TechStore se reserva el derecho de modificar precios sin previo aviso, pero los pedidos confirmados mantienen el precio original.",
  },
  {
    title: "5. Responsabilidad",
    content:
      "TechStore no será responsable por daños indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso de nuestros productos o servicios.",
  },
  {
    title: "6. Modificaciones",
    content:
      "TechStore se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio.",
  },
];

const privacidad = [
  {
    title: "1. Datos que recopilamos",
    content:
      "Recopilamos nombre, correo electrónico, dirección de envío y datos de pago necesarios para procesar tus pedidos. No almacenamos datos de tarjetas de crédito.",
  },
  {
    title: "2. Uso de la información",
    content:
      "Usamos tus datos para procesar pedidos, enviarte confirmaciones de compra y, con tu consentimiento, informarte sobre ofertas y novedades.",
  },
  {
    title: "3. Protección de datos",
    content:
      "Implementamos medidas de seguridad técnicas y organizacionales para proteger tus datos personales contra acceso no autorizado, pérdida o alteración.",
  },
  {
    title: "4. Cookies",
    content:
      "Utilizamos cookies para mejorar la experiencia de usuario, recordar tu carrito de compras y analizar el tráfico del sitio. Puedes desactivarlas en la configuración de tu navegador.",
  },
  {
    title: "5. Tus derechos",
    content:
      "Tienes derecho a acceder, rectificar y eliminar tus datos personales. Para ejercer estos derechos, contáctanos en contacto@techstore.cl.",
  },
  {
    title: "6. Contacto",
    content:
      "Para consultas sobre privacidad, escríbenos a contacto@techstore.cl o llámanos al +56 9 1234 5678.",
  },
];

export default function Legal() {
  const [location] = useLocation();
  const isPrivacy = location === "/privacidad";

  const data = isPrivacy ? privacidad : terminos;
  const icon = isPrivacy ? Lock : Shield;
  const Icon = icon;
  const title = isPrivacy ? "Política de Privacidad" : "Términos de Servicio";
  const subtitle = isPrivacy
    ? "Cómo recopilamos, usamos y protegemos tu información personal."
    : "Las condiciones que regulan el uso de nuestra plataforma y la compra de productos.";

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-14 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-5">
            <Icon className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
          <p className="text-xs text-muted-foreground mt-2">Última actualización: enero 2026</p>
        </motion.div>

        <div className="space-y-5">
          {data.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="font-bold text-base mb-2.5">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          ¿Preguntas legales? Escríbenos a{" "}
          <a href="mailto:contacto@techstore.cl" className="text-primary hover:underline">
            contacto@techstore.cl
          </a>
        </p>
      </div>
    </AppLayout>
  );
}
