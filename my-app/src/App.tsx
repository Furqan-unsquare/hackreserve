import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import ClientProfile from './pages/dashboard/ClientProfile';
import AddFile from './pages/dashboard/AddFile';
import BillingProcess from './pages/dashboard/BillingProcess';
import AdminProfile from './pages/dashboard/AdminProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/billing" replace />} />
          <Route path="client-profile" element={<ClientProfile />} />
          <Route path="add-file/:clientId" element={<AddFile />} />
          <Route path="billing" element={<BillingProcess />} />
          <Route path="admin-profile" element={<AdminProfile />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
