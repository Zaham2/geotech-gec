import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Projects from '@/pages/Projects/Projects';
import Calculations from '@/pages/Calculations/Calculations';
import Chat from '@/pages/Chat/Chat';
import Reports from '@/pages/Reports/Reports';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import UserManagement from '@/pages/Admin/UserManagement';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import AdminRoute from '@/components/ProtectedRoute/AdminRoute';

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/calculations" element={<Calculations />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <UserManagement />
                      </AdminRoute>
                    }
                  />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Box>
  );
}

export default App; 