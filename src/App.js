import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage  from './pages/ContactsPage';
import CampaignsPage from './pages/CampaignsPage';
import TemplatesPage from './pages/TemplatesPage';
import MessagesPage  from './pages/MessagesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage  from './pages/SettingsPage';
import AdminPage     from './pages/AdminPage';

// Protected route wrapper
const Protected = ({ children, adminOnly=false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:32,marginBottom:8}}>📱</div>
        <p style={{color:'#64748b'}}>Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace/>;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace/>;
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace/> : <LoginPage/>}/>
      <Route path="/" element={<Protected><DashboardPage/></Protected>}/>
      <Route path="/contacts"  element={<Protected><ContactsPage/></Protected>}/>
      <Route path="/campaigns" element={<Protected><CampaignsPage/></Protected>}/>
      <Route path="/templates" element={<Protected><TemplatesPage/></Protected>}/>
      <Route path="/messages"  element={<Protected><MessagesPage/></Protected>}/>
      <Route path="/analytics" element={<Protected><AnalyticsPage/></Protected>}/>
      <Route path="/settings"  element={<Protected><SettingsPage/></Protected>}/>
      <Route path="/admin"     element={<Protected adminOnly><AdminPage/></Protected>}/>
      <Route path="*"          element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius:10, fontSize:13, fontWeight:500 },
            success: { style: { background:'#f0fdf4', color:'#166534', border:'1px solid #bbf7d0' } },
            error:   { style: { background:'#fef2f2', color:'#991b1b', border:'1px solid #fecaca' } },
          }}
        />
        <AppRoutes/>
      </AuthProvider>
    </BrowserRouter>
  );
}
