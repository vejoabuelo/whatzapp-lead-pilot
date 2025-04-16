import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import { useAuth } from '@/providers/AuthProvider';
import WhatsAppAdmin from '@/pages/WhatsAppAdmin';

function App() {
  const { user, isLoading } = useAuth();

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return <div>Carregando...</div>; // Pode ser substituído por um spinner
    }
    return user ? <>{children}</> : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
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
        <Route path="/messages" element={
          <PrivateRoute>
            <Messages />
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
        <Route path="/admin/whatsapp" element={
          <PrivateRoute>
            <WhatsAppAdmin />
          </PrivateRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
