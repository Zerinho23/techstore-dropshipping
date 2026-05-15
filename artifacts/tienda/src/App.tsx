import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/use-admin-auth";
import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Confirmation from "@/pages/Confirmation";

import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminOrders from "@/pages/admin/Orders";
import AdminOrderDetail from "@/pages/admin/OrderDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAdminAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <Skeleton className="h-12 w-12 rounded-xl mx-auto bg-white/10" />
          <Skeleton className="h-4 w-32 bg-white/10" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    setLocation("/admin/login");
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Storefront Routes */}
      <Route path="/" component={Home} />
      <Route path="/productos" component={Products} />
      <Route path="/productos/:id" component={ProductDetail} />
      <Route path="/carrito" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/confirmacion/:orderId" component={Confirmation} />

      {/* Admin Login */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Protected Admin Routes */}
      <Route path="/admin">
        {() => <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/productos">
        {() => <ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/pedidos">
        {() => <ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/pedidos/:id">
        {(params) => <ProtectedAdminRoute><AdminOrderDetail params={params} /></ProtectedAdminRoute>}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
