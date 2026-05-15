import { useLocation } from "wouter";
import { Link } from "wouter";
import { ShoppingCart, Search, Menu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartSession } from "@/hooks/use-cart-session";
import { useGetCart } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const sessionId = useCartSession();
  const { data: cart } = useGetCart({ sessionId }, { query: { enabled: !!sessionId, queryKey: ['cart', sessionId] } });

  const itemCount = cart?.itemCount || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">TechStore</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/productos" className="transition-colors hover:text-primary" data-testid="link-products">Catálogo</Link>
            <Link href="/admin" className="transition-colors hover:text-primary text-muted-foreground" data-testid="link-admin">Admin</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden md:flex" aria-label="Buscar">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative" 
            onClick={() => setLocation('/carrito')}
            data-testid="button-cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-primary text-[10px]">
                {itemCount}
              </Badge>
            )}
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
