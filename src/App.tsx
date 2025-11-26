import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsModalProvider, useSettingsModal } from "@/contexts/SettingsModalContext";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { Analytics } from "@vercel/analytics/react";
import Home from "./pages/platform/Home";
import Account from "./pages/platform/account/Account";
import Usage from "./pages/platform/usage/Usage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import History from "./pages/platform/history/History";
import RequestDetails from "./pages/platform/history/RequestDetails";
import Prompts from "./pages/platform/admin/prompts/Prompts";
import PromptDetails from "./pages/platform/admin/prompts/PromptDetails";
import PrivateRoute from "./components/routes/PrivateRoute";
import AdminRoute from "./components/routes/AdminRoute";
import PublicRoute from "./components/routes/PublicRoute";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import Auth from "./pages/auth/Auth";
import Landing from "./pages/landing/Landing";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isOpen, closeModal } = useSettingsModal();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/auth" 
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } 
        />
        <Route 
          path="/platform" 
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <Home />
              </AuthenticatedLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/platform/account" 
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <Account />
              </AuthenticatedLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/platform/usage" 
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <Usage />
              </AuthenticatedLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/platform/history" 
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <History />
              </AuthenticatedLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/platform/history/requests/:id" 
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <RequestDetails />
              </AuthenticatedLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/prompts" 
          element={
            <AdminRoute>
              <AuthenticatedLayout>
                <Prompts />
              </AuthenticatedLayout>
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/prompts/:id" 
          element={
            <AdminRoute>
              <AuthenticatedLayout>
                <PromptDetails />
              </AuthenticatedLayout>
            </AdminRoute>
          } 
        />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SettingsModal isOpen={isOpen} onClose={closeModal} />
      <Analytics />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SettingsModalProvider>
        <TooltipProvider>
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </SettingsModalProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
