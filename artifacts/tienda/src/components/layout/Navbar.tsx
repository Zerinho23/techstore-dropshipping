import { useLocation, Link } from "wouter";
import {
  ShoppingCart, Search, Menu, X, Zap, ChevronDown,
  LayoutDashboard, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartSession } from "@/hooks/use-cart-session";
import { useGetCart, useListCategories } from "@workspace/api-client-react";
import { getGetCartQueryKey } from "@workspace/api-client-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const sessionId = useCartSession();
  const { data: cart } = useGetCart(
    { sessionId },
    { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } }
  );
  const { data: categories } = useListCategories();
  const { isAdmin } = useAdminAuth();

  const [mobileOpen, setMobileOpen]   = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled]       = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const itemCount = cart?.itemCount ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatalogOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Close search on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b transition-all duration-200",
          scrolled
            ? "bg-background/95 backdrop-blur border-border/60 shadow-sm"
            : "bg-background/95 backdrop-blur border-border/40"
        )}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" data-testid="link-home">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">TechStore</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                "px-4 py-2 rounded-lg transition-colors",
                location === "/" ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Inicio
            </Link>

            <div className="relative" onMouseLeave={() => setCatalogOpen(false)}>
              <button
                onMouseEnter={() => setCatalogOpen(true)}
                onClick={() => setLocation("/productos")}
                className={cn(
                  "flex items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                  location.startsWith("/productos")
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                data-testid="link-products"
              >
                Catálogo
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", catalogOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {catalogOpen && categories && categories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-1 w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
                    onMouseEnter={() => setCatalogOpen(true)}
                  >
                    <div className="p-2">
                      <Link
                        href="/productos"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        Todos los productos
                      </Link>
                      <div className="h-px bg-border my-1.5" />
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/productos?category=${cat.slug}`}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <span>{cat.name}</span>
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{cat.productCount}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Buscar"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {/* Admin link */}
            {isAdmin ? (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                data-testid="link-admin"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Admin
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-admin-login"
              >
                Admin
              </Link>
            )}

            {/* Cart */}
            <button
              className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              onClick={() => setLocation("/carrito")}
              data-testid="button-cart"
              aria-label="Carrito"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full shadow"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </motion.span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search bar (desktop) — slides in below header */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border bg-background/98 backdrop-blur"
            >
              <form onSubmit={handleSearchSubmit} className="container mx-auto px-4 py-3 flex items-center gap-3">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos, marcas, categorías..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Buscar <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
                <button type="button" onClick={() => setSearchOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-16 left-0 right-0 z-40 bg-background border-b border-border shadow-xl overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {/* Mobile search */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) setLocation(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted mb-1"
              >
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </form>

              <Link href="/" className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-muted transition-colors font-medium">
                Inicio
              </Link>
              <Link href="/productos" className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-muted transition-colors font-medium">
                Todos los productos
              </Link>
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/productos?category=${cat.slug}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm text-muted-foreground"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{cat.productCount}</span>
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <Link href="/seguimiento" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm text-muted-foreground">
                Rastrear pedido
              </Link>
              <Link href="/faq" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm text-muted-foreground">
                Preguntas frecuentes
              </Link>
              <div className="h-px bg-border my-2" />
              <Link
                href={isAdmin ? "/admin" : "/admin/login"}
                className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-muted-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                {isAdmin ? "Panel de administración" : "Acceso Admin"}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
