import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <AppLayout>
      <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 text-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-30"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-lg"
        >
          {/* Big 404 */}
          <div className="relative mb-6">
            <p className="text-[9rem] sm:text-[12rem] font-black leading-none select-none"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #818cf8 50%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                opacity: 0.15,
              }}>
              404
            </p>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-primary/10 text-primary p-4 rounded-2xl mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <p className="text-2xl font-bold text-foreground">Página no encontrada</p>
            </div>
          </div>

          <p className="text-muted-foreground text-base mb-8 leading-relaxed">
            Esta página no existe o fue movida. No te preocupes, puedes volver al inicio
            o buscar lo que necesitas en el catálogo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto rounded-xl font-bold">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Ir al inicio
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto rounded-xl font-bold">
              <Link href="/productos">
                <Search className="mr-2 h-4 w-4" /> Ver catálogo
              </Link>
            </Button>
          </div>

          <Link href="javascript:history.back()"
            className="inline-flex items-center gap-1.5 mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver atrás
          </Link>
        </motion.div>
      </div>
    </AppLayout>
  );
}
