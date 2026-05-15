import { useState } from "react";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, getListProductsQueryKey, useListCategories } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCLP } from "@/lib/currency";
import { Plus, Search, Edit, Trash2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const productSchema = z.object({
  name: z.string().min(2, "Requerido"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Requerido"),
  comparePrice: z.coerce.number().optional().or(z.literal(0)),
  stock: z.coerce.number().min(0),
  categoryId: z.coerce.number().optional().or(z.literal(0)),
  imageUrl: z.string().optional(),
  aliexpressUrl: z.string().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  sku: z.string().optional()
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
      categoryId: 0, imageUrl: "", aliexpressUrl: "", featured: false, active: true, sku: ""
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({
      name: "", description: "", price: 0, comparePrice: 0, stock: 10,
      categoryId: undefined, imageUrl: "", aliexpressUrl: "", featured: false, active: true, sku: ""
    });
    setIsDialogOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      comparePrice: product.comparePrice || 0,
      stock: product.stock,
      categoryId: product.categoryId || undefined,
      imageUrl: product.imageUrl || "",
      aliexpressUrl: product.aliexpressUrl || "",
      featured: product.featured,
      active: product.active,
      sku: product.sku || ""
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
          toast({ title: "Producto actualizado" });
        }
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Producto creado" });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: "Producto eliminado" });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Productos</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu catálogo.</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
            <Input 
              placeholder="Buscar..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-8"
            />
          </form>
          <Button onClick={openCreate} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded overflow-hidden shrink-0 border border-border">
                        {product.imageUrl && <img src={product.imageUrl} className="h-full w-full object-cover" />}
                      </div>
                      <span className="line-clamp-1">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{product.sku || '-'}</TableCell>
                  <TableCell>{formatCLP(product.price)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.active ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {product.aliexpressUrl && (
                        <Button variant="ghost" size="icon" title="Ver en AliExpress" asChild>
                          <a href={product.aliexpressUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay productos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Precio (CLP)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="comparePrice" render={({ field }) => (
                  <FormItem><FormLabel>Precio anterior (Opcional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem><FormLabel>SKU (Opcional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Ninguna</SelectItem>
                      {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormLabel>URL Imagen Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="aliexpressUrl" render={({ field }) => (
                <FormItem><FormLabel>URL AliExpress (Para dropshipping)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="flex gap-6 py-2 border-t border-border mt-4">
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel>Producto Activo</FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="featured" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel>Destacado en Home</FormLabel>
                  </FormItem>
                )} />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
