import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsModalProvider, useSettingsModal } from "@/contexts/SettingsModalContext";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { Analytics } from "@vercel/analytics/react";
import { useNProgress } from "@/hooks/other/useNProgress";
import Home from "./pages/platform/home/Home";
import Account from "./pages/platform/account/Account";
import Usage from "./pages/platform/usage/Usage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import History from "./pages/platform/history/History";
import Details from "./pages/platform/history/Details";
import Prompts from "./pages/platform/admin/prompts/Prompts";
import PromptDetails from "./pages/platform/admin/prompts/PromptDetails";
import Requests from "./pages/platform/admin/requests/Requests";
import RequestDetails from "./pages/platform/admin/requests/RequestDetails";
import PrivateRoute from "./components/routes/PrivateRoute";
import AdminRoute from "./components/routes/AdminRoute";
import PublicRoute from "./components/routes/PublicRoute";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import Auth from "./pages/auth/Auth";
import Landing from "./pages/landing/Landing";

const queryClient = new QueryClient();

const NProgressHandler = () => {
  useNProgress();
  return null;
};

const AppContent = () => {
  const { isOpen, closeModal } = useSettingsModal();

  return (
    <BrowserRouter basename="/mvp1">
      <NProgressHandler />
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
          path="/platform/history/:id" 
          element={
            <PrivateRoute>
              <AuthenticatedLayout>
                <Details />
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
        <Route 
          path="/admin/requests" 
          element={
            <AdminRoute>
              <AuthenticatedLayout>
                <Requests />
              </AuthenticatedLayout>
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/requests/:id" 
          element={
            <AdminRoute>
              <AuthenticatedLayout>
                <RequestDetails />
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
