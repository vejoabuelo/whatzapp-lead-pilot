
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Pricing from '@/pages/Pricing';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Prospection from '@/pages/Prospection';
import Messages from '@/pages/Messages';
import Campaigns from '@/pages/Campaigns';
import NewCampaign from '@/pages/NewCampaign';
import Reports from '@/pages/Reports';
import Team from '@/pages/Team';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import WhatsAppAdmin from '@/pages/WhatsAppAdmin';
import AdminDashboard from '@/pages/AdminDashboard';
import PrivateRoute from '@/components/PrivateRoute';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import SuperAdminInstances from '@/pages/SuperAdminInstances';
import SuperAdminUsers from '@/pages/SuperAdminUsers';
import SuperAdminMonitoring from '@/pages/SuperAdminMonitoring';
import { useAuth } from "./providers/AuthProvider";
import { LogOut } from "lucide-react";
import MessageLibrary from "@/pages/MessageLibrary";

function App() {
  const { signOut } = useAuth();

  const handleEmergencySignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout de emergência:", error);
    }
  };

  return (
    <div className="App">
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/onboarding" element={
          <PrivateRoute>
            <Onboarding />
          </PrivateRoute>
        } />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/prospection" element={
          <PrivateRoute>
            <Prospection />
          </PrivateRoute>
        } />
        <Route path="/whatsapp-connections" element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        } />
        <Route path="/messages/library" element={
          <PrivateRoute>
            <MessageLibrary />
          </PrivateRoute>
        } />
        <Route path="/campaigns" element={
          <PrivateRoute>
            <Campaigns />
          </PrivateRoute>
        } />
        <Route path="/campaigns/new" element={
          <PrivateRoute>
            <NewCampaign />
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        } />
        <Route path="/team" element={
          <PrivateRoute>
            <Team />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/whatsapp" element={
          <PrivateRoute>
            <WhatsAppAdmin />
          </PrivateRoute>
        } />
        
        {/* Super Admin Routes */}
        <Route path="/superadmin" element={
          <PrivateRoute requireSuperAdmin>
            <SuperAdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/superadmin/instances" element={
          <PrivateRoute requireSuperAdmin>
            <SuperAdminInstances />
          </PrivateRoute>
        } />
        <Route path="/superadmin/users" element={
          <PrivateRoute requireSuperAdmin>
            <SuperAdminUsers />
          </PrivateRoute>
        } />
        <Route path="/superadmin/monitoring" element={
          <PrivateRoute requireSuperAdmin>
            <SuperAdminMonitoring />
          </PrivateRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Botão de logout de emergência - sempre visível */}
      <div className="logout-button-area">
        <button 
          className="emergency-logout"
          onClick={handleEmergencySignOut}
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  );
}

export default App;
