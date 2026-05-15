import { Link } from "wouter";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1 rounded-md">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-display font-bold text-lg">TechStore</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu tienda de confianza para gadgets y tecnología de última generación en Chile.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Categorías</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/productos" className="hover:text-primary">Audio</Link></li>
              <li><Link href="/productos" className="hover:text-primary">Periféricos</Link></li>
              <li><Link href="/productos" className="hover:text-primary">Smartwatches</Link></li>
              <li><Link href="/productos" className="hover:text-primary">Accesorios</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Preguntas Frecuentes</Link></li>
              <li><Link href="#" className="hover:text-primary">Envíos y Devoluciones</Link></li>
              <li><Link href="#" className="hover:text-primary">Términos de Servicio</Link></li>
              <li><Link href="#" className="hover:text-primary">Contacto</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contacto@techstore.cl</li>
              <li>+56 9 1234 5678</li>
              <li>Santiago, Chile</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TechStore. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Powered by AliExpress Dropshipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
