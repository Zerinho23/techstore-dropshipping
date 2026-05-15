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
import {
  Plus, Search, Edit, Trash2, ExternalLink, Package,
  AlertTriangle, CheckCircle, Star, Eye, EyeOff, X,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name:          z.string().min(2, "El nombre es requerido"),
  description:   z.string().optional(),
  price:         z.coerce.number().min(1, "El precio es requerido"),
  comparePrice:  z.coerce.number().optional().or(z.literal(0)),
  stock:         z.coerce.number().min(0, "Stock mínimo 0"),
  categoryId:    z.coerce.number().optional().or(z.literal(0)),
  imageUrl:      z.string().optional(),
  aliexpressUrl: z.string().optional(),
  featured:      z.boolean().default(false),
  active:        z.boolean().default(true),
  sku:           z.string().optional(),
});
type ProductFormValues = z.infer<typeof productSchema>;

const EMPTY: ProductFormValues = {
  name: "", description: "", price: 0, comparePrice: 0, stock: 10,
  categoryId: 0, imageUrl: "", aliexpressUrl: "", featured: false, active: true, sku: "",
};

type StockStatus = "ok" | "low" | "out";
function stockStatus(s: number): StockStatus {
  if (s <= 0) return "out";
  if (s < 5) return "low";
  return "ok";
}

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const { data: products, isLoading } = useListProducts({ search: debouncedSearch || undefined });
  const { data: categories } = useListCategories();

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY,
  });

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setDebouncedSearch(search); };
  const clearSearch = () => { setSearch(""); setDebouncedSearch(""); };

  const openCreate = () => { setEditingId(null); form.reset(EMPTY); setIsDialogOpen(true); };
  const openEdit = (p: NonNullable<typeof products>[0]) => {
    setEditingId(p.id);
    form.reset({
      name: p.name, description: p.description ?? "", price: p.price,
      comparePrice: p.comparePrice ?? 0, stock: p.stock,
      categoryId: p.categoryId ?? 0, imageUrl: p.imageUrl ?? "",
      aliexpressUrl: p.aliexpressUrl ?? "", featured: p.featured,
      active: p.active, sku: p.sku ?? "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: ProductFormValues) => {
    const payload = {
      ...values,
      comparePrice: values.comparePrice === 0 ? undefined : values.comparePrice,
      categoryId:   values.categoryId   === 0 ? undefined : values.categoryId,
    };
    if (editingId) {
      updateProduct.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Producto actualizado" });
        },
        onError: () => toast({ variant: "destructive", title: "Error al actualizar" }),
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Producto creado correctamente" });
        },
        onError: () => toast({ variant: "destructive", title: "Error al crear producto" }),
      });
    }
  };

  const handleDelete = (id: number, name: string) => setDeleteConfirm({ id, name });
  const confirmDelete = () => {
    if (!deleteConfirm) return;
    deleteProduct.mutate({ id: deleteConfirm.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ title: "Producto eliminado" });
        setDeleteConfirm(null);
      },
    });
  };

  const quickToggleActive = (p: NonNullable<typeof products>[0]) => {
    updateProduct.mutate({ id: p.id, data: { active: !p.active } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ title: p.active ? "Producto ocultado" : "Producto publicado" });
      },
    });
  };

  const getCategoryName = (id: number | null) =>
    categories?.find((c) => c.id === id)?.name ?? "—";

  const imagePreview = form.watch("imageUrl");
  const discount = (() => {
    const p = form.watch("price");
    const cp = form.watch("comparePrice");
    if (cp && cp > p) return Math.round((1 - p / cp) * 100);
    return 0;
  })();

  const stockOk   = products?.filter((p) => p.stock > 5).length ?? 0;
  const stockLow  = products?.filter((p) => p.stock > 0 && p.stock <= 5).length ?? 0;
  const stockOut  = products?.filter((p) => p.stock <= 0).length ?? 0;
  const featured  = products?.filter((p) => p.featured).length ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gestiona el catálogo de tu tienda
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2 rounded-xl shadow-sm" data-testid="button-new-product">
            <Plus className="h-4 w-4" /> Nuevo producto
          </Button>
        </div>

        {/* Mini stats */}
        {products && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total",       value: products.length, color: "text-slate-700",   bg: "bg-white",        dot: "bg-slate-300" },
              { label: "En stock",    value: stockOk,         color: "text-emerald-600", bg: "bg-emerald-50",   dot: "bg-emerald-400" },
              { label: "Stock bajo",  value: stockLow,        color: "text-amber-600",   bg: "bg-amber-50",     dot: "bg-amber-400" },
              { label: "Destacados",  value: featured,        color: "text-primary",     bg: "bg-primary/5",    dot: "bg-primary" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-200/70 px-4 py-3 flex items-center gap-3`}>
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-9 rounded-xl bg-white border-slate-200"
              data-testid="input-product-search"
            />
            {search && (
              <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button type="submit" variant="outline" className="rounded-xl border-slate-200">Buscar</Button>
        </form>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="p-5 rounded-2xl bg-slate-100">
                <Package className="h-9 w-9 text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Sin productos</p>
                <p className="text-sm text-slate-500 mt-1">
                  {debouncedSearch ? `No hay resultados para "${debouncedSearch}"` : "Agrega tu primer producto al catálogo"}
                </p>
              </div>
              {!debouncedSearch && (
                <Button onClick={openCreate} className="mt-2 gap-2 rounded-xl">
                  <Plus className="h-4 w-4" /> Agregar producto
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                    <th className="text-left px-5 py-3.5">Producto</th>
                    <th className="text-left px-5 py-3.5 hidden md:table-cell">Categoría</th>
                    <th className="text-left px-5 py-3.5">Precio</th>
                    <th className="text-left px-5 py-3.5">Stock</th>
                    <th className="text-left px-5 py-3.5">Estado</th>
                    <th className="px-5 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const ss = stockStatus(product.stock);
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors group"
                        data-testid={`row-product-${product.id}`}
                      >
                        {/* Product */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {product.imageUrl
                                ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                : <div className="h-full w-full flex items-center justify-center"><Package className="h-4 w-4 text-slate-300" /></div>
                              }
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-slate-800 line-clamp-1">{product.name}</p>
                                {product.featured && (
                                  <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                                )}
                              </div>
                              {product.sku && (
                                <p className="text-[11px] text-slate-400 font-mono">{product.sku}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            {getCategoryName(product.categoryId)}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-800">{formatCLP(product.price)}</div>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <div className="text-[11px] text-slate-400 line-through">{formatCLP(product.comparePrice)}</div>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-3.5">
                          <span className={cn(
                            "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                            ss === "out" ? "bg-red-50 text-red-600"
                            : ss === "low" ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                          )}>
                            {ss === "out"
                              ? <><AlertTriangle className="h-3 w-3" /> Agotado</>
                              : ss === "low"
                              ? <><AlertTriangle className="h-3 w-3" /> {product.stock} restantes</>
                              : <><CheckCircle className="h-3 w-3" /> {product.stock}</>
                            }
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => quickToggleActive(product)}
                            className={cn(
                              "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all hover:opacity-80",
                              product.active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-500 border-slate-200"
                            )}
                            title={product.active ? "Click para ocultar" : "Click para publicar"}
                          >
                            {product.active
                              ? <><Eye className="h-3 w-3" /> Publicado</>
                              : <><EyeOff className="h-3 w-3" /> Oculto</>
                            }
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {product.aliexpressUrl && (
                              <a
                                href={product.aliexpressUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-500 transition-colors"
                                title="Ver en AliExpress"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <button
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                              onClick={() => openEdit(product)}
                              data-testid={`button-edit-${product.id}`}
                              title="Editar"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              onClick={() => handleDelete(product.id, product.name)}
                              data-testid={`button-delete-${product.id}`}
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE / EDIT DIALOG ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingId ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-1">
              {/* Image preview + URL */}
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-muted border border-border overflow-hidden shrink-0">
                  {imagePreview
                    ? <img src={imagePreview} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    : <div className="w-full h-full flex items-center justify-center"><Package className="h-7 w-7 text-muted-foreground opacity-30" /></div>
                  }
                </div>
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>URL de imagen</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} className="rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Name */}
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del producto <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Ej: Audífonos Bluetooth Pro" {...field} className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Price + Compare + Stock */}
              <div className="grid grid-cols-3 gap-3">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input type="number" placeholder="29990" {...field} className="rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="comparePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Precio anterior
                      {discount > 0 && <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">-{discount}%</span>}
                    </FormLabel>
                    <FormControl><Input type="number" placeholder="49990" {...field} className="rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input type="number" placeholder="10" {...field} className="rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Category + SKU */}
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={String(field.value ?? 0)}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Sin categoría" /></SelectTrigger>
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
                <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl><Input placeholder="AUD-001" {...field} className="rounded-xl font-mono" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* AliExpress URL */}
              <FormField control={form.control} name="aliexpressUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    URL de AliExpress
                    <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-1.5 py-0.5 rounded-full">Dropshipping</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://aliexpress.com/item/..." {...field} className="rounded-xl border-orange-200 focus-visible:ring-orange-300" />
                  </FormControl>
                  <p className="text-[11px] text-muted-foreground">Enlace del proveedor para cumplir pedidos</p>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Description */}
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl><Textarea rows={3} placeholder="Describe el producto..." {...field} className="rounded-xl resize-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Toggles */}
              <div className="flex gap-6 py-3 px-4 bg-muted/40 rounded-xl border border-border">
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem className="flex items-center gap-2.5 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="cursor-pointer font-medium">
                      <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-emerald-500" /> Publicado en tienda</span>
                    </FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="featured" render={({ field }) => (
                  <FormItem className="flex items-center gap-2.5 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="cursor-pointer font-medium">
                      <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-400" /> Destacado en inicio</span>
                    </FormLabel>
                  </FormItem>
                )} />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="min-w-32 rounded-xl"
                >
                  {createProduct.isPending || updateProduct.isPending
                    ? "Guardando..."
                    : editingId ? "Actualizar" : "Crear producto"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM ── */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar producto?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-sm text-red-700">
                Estás a punto de eliminar <span className="font-bold">"{deleteConfirm?.name}"</span>.
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl">
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteProduct.isPending}
                className="rounded-xl"
              >
                {deleteProduct.isPending ? "Eliminando..." : "Sí, eliminar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
