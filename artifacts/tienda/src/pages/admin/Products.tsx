import { useState } from "react";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  getListProductsQueryKey,
  useListCategories,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCLP } from "@/lib/currency";
import { Plus, Search, Edit, Trash2, ExternalLink, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";

const productSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "El precio es requerido"),
  comparePrice: z.coerce.number().optional().or(z.literal(0)),
  stock: z.coerce.number().min(0, "Stock mínimo 0"),
  categoryId: z.coerce.number().optional().or(z.literal(0)),
  imageUrl: z.string().optional(),
  aliexpressUrl: z.string().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  sku: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: products, isLoading } = useListProducts({ search: debouncedSearch || undefined });
  const { data: categories } = useListCategories();

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: 0, comparePrice: 0, stock: 10,
      categoryId: 0, imageUrl: "", aliexpressUrl: "", featured: false, active: true, sku: "",
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: "", description: "", price: 0, comparePrice: 0, stock: 10, categoryId: 0, imageUrl: "", aliexpressUrl: "", featured: false, active: true, sku: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (product: NonNullable<typeof products>[0]) => {
    setEditingId(product.id);
    form.reset({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      comparePrice: product.comparePrice ?? 0,
      stock: product.stock,
      categoryId: product.categoryId ?? 0,
      imageUrl: product.imageUrl ?? "",
      aliexpressUrl: product.aliexpressUrl ?? "",
      featured: product.featured,
      active: product.active,
      sku: product.sku ?? "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: ProductFormValues) => {
    const payload = {
      ...values,
      comparePrice: values.comparePrice === 0 ? undefined : values.comparePrice,
      categoryId: values.categoryId === 0 ? undefined : values.categoryId,
    };
    if (editingId) {
      updateProduct.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Producto actualizado correctamente" });
        },
        onError: () => toast({ variant: "destructive", title: "Error al actualizar el producto" }),
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Producto creado correctamente" });
        },
        onError: () => toast({ variant: "destructive", title: "Error al crear el producto" }),
      });
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: "Producto eliminado" });
        },
      });
    }
  };

  const getCategoryName = (id: number | null) => categories?.find((c) => c.id === id)?.name ?? "—";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Productos</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {products ? `${products.length} productos en catálogo` : "Cargando..."}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl"
                data-testid="input-product-search"
              />
            </form>
            <Button onClick={openCreate} className="shrink-0 gap-2 rounded-xl" data-testid="button-new-product">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="p-4 rounded-2xl bg-muted">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Sin productos</p>
                <p className="text-sm text-muted-foreground mt-1">Agrega tu primer producto al catálogo</p>
              </div>
              <Button onClick={openCreate} className="mt-2 gap-2">
                <Plus className="h-4 w-4" /> Agregar producto
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    <th className="text-left px-5 py-3.5">Producto</th>
                    <th className="text-left px-5 py-3.5">Categoría</th>
                    <th className="text-left px-5 py-3.5">Precio</th>
                    <th className="text-left px-5 py-3.5">Stock</th>
                    <th className="text-left px-5 py-3.5">Estado</th>
                    <th className="text-right px-5 py-3.5">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/20 transition-colors group" data-testid={`row-product-${product.id}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{product.name}</p>
                            {product.sku && (
                              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">
                        {getCategoryName(product.categoryId)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold">{formatCLP(product.price)}</div>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <div className="text-xs text-muted-foreground line-through">{formatCLP(product.comparePrice)}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                          product.stock <= 0
                            ? "bg-red-50 text-red-600"
                            : product.stock < 5
                            ? "bg-orange-50 text-orange-600"
                            : "bg-green-50 text-green-600"
                        }`}>
                          {product.stock <= 0 ? (
                            <><AlertTriangle className="h-3 w-3" /> Agotado</>
                          ) : product.stock < 5 ? (
                            <><AlertTriangle className="h-3 w-3" /> {product.stock} restantes</>
                          ) : (
                            <><CheckCircle className="h-3 w-3" /> {product.stock} en stock</>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                          product.active
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${product.active ? "bg-green-500" : "bg-gray-400"}`} />
                          {product.active ? "Activo" : "Inactivo"}
                          {product.featured && product.active && (
                            <span className="ml-1 bg-primary/20 text-primary px-1 rounded text-[10px] font-bold">★</span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {product.aliexpressUrl && (
                            <a
                              href={product.aliexpressUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-orange-500"
                              title="Ver en AliExpress"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                            onClick={() => openEdit(product)}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
                            onClick={() => handleDelete(product.id, product.name)}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingId ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
              {/* Name */}
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del producto</FormLabel>
                  <FormControl><Input placeholder="Ej: Audífonos Bluetooth Pro" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Price + Compare Price */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de venta (CLP)</FormLabel>
                    <FormControl><Input type="number" placeholder="29990" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="comparePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio anterior (opcional)</FormLabel>
                    <FormControl><Input type="number" placeholder="49990" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Stock + SKU */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl><Input type="number" placeholder="10" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (opcional)</FormLabel>
                    <FormControl><Input placeholder="AUD-001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Category */}
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={(v) => field.onChange(parseInt(v))} value={String(field.value ?? 0)}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Sin categoría</SelectItem>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Image URL */}
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de imagen principal</FormLabel>
                  <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* AliExpress URL */}
              <FormField control={form.control} name="aliexpressUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de AliExpress (dropshipping)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://aliexpress.com/item/..." {...field} className="border-orange-200 focus:border-orange-400" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Pega el enlace del producto en AliExpress para referencia de compra.</p>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Description */}
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="Describe el producto detalladamente..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Toggles */}
              <div className="flex gap-6 py-4 px-4 bg-muted/40 rounded-xl border border-border">
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem className="flex items-center gap-2.5 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="cursor-pointer">Producto activo</FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="featured" render={({ field }) => (
                  <FormItem className="flex items-center gap-2.5 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="cursor-pointer">Destacado en inicio</FormLabel>
                  </FormItem>
                )} />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="min-w-28"
                >
                  {createProduct.isPending || updateProduct.isPending ? "Guardando..." : editingId ? "Actualizar" : "Crear producto"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
