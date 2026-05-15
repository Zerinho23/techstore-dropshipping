import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "56912345678";
const WHATSAPP_MESSAGE = encodeURIComponent("Hola, tengo una consulta sobre un producto de TechStore.");

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <motion.main
        key={location}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="flex-1"
      >
        {children}
      </motion.main>
      <Footer />

      {/* WhatsApp floating button */}
      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 shadow-2xl rounded-full overflow-hidden group"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Tooltip label */}
        <span className="max-w-0 group-hover:max-w-[160px] overflow-hidden transition-all duration-300 whitespace-nowrap">
          <span className="bg-[#25D366] text-white text-sm font-semibold pl-4 pr-1 py-3.5 block">
            ¿Necesitas ayuda?
          </span>
        </span>
        {/* Icon button */}
        <span className="w-14 h-14 flex items-center justify-center rounded-full bg-[#25D366] shrink-0">
          <MessageCircle className="h-6 w-6 text-white fill-white" />
        </span>
      </motion.a>
    </div>
  );
}
