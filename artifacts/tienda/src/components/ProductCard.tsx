import { Link } from "wouter";
import { formatCLP } from "@/lib/currency";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@workspace/api-client-react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden flex flex-col h-full border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
      <Link href={`/productos/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted">
        {discount > 0 && (
          <Badge className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground">
            -{discount}%
          </Badge>
        )}
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
      </Link>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="text-xs text-muted-foreground mb-1">
          {product.category?.name || "Tecnología"}
        </div>
        <Link href={`/productos/${product.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto pt-2 flex items-end gap-2">
          <span className="font-bold text-lg">{formatCLP(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-muted-foreground line-through mb-1">
              {formatCLP(product.comparePrice)}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full gap-2" 
          variant="secondary"
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.(product.id);
          }}
          disabled={!product.stock || product.stock <= 0}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock && product.stock > 0 ? "Añadir" : "Agotado"}
        </Button>
      </CardFooter>
    </Card>
  );
}
