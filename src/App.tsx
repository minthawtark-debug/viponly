import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Members from "./pages/Members";
import VIP from "./pages/VIP";
import AccessValidation from "./pages/AccessValidation";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MemberList from "./pages/admin/MemberList";
import MemberCreate from "./pages/admin/MemberCreate";
import MemberEdit from "./pages/admin/MemberEdit";
import AccessLinks from "./pages/admin/AccessLinks";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/members" element={<Members />} />
            <Route path="/vip" element={<VIP />} />
            <Route path="/access" element={<AccessValidation />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="members" element={<MemberList />} />
              <Route path="members/new" element={<MemberCreate />} />
              <Route path="members/:id/edit" element={<MemberEdit />} />
              <Route path="access-links" element={<AccessLinks />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
