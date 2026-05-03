import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  
  return children;
};

const HomeRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  switch(user.role) {
    case 'customer': return <Navigate to="/customer" />;
    case 'owner': return <Navigate to="/owner" />;
    case 'staff': return <Navigate to="/staff" />;
    case 'admin': return <Navigate to="/admin" />;
    default: return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/*" element={
              <>
                <Navbar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<HomeRoute />} />
                    <Route path="/customer" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <CustomerDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/owner" element={
                      <ProtectedRoute allowedRoles={['owner']}>
                        <OwnerDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/staff" element={
                      <ProtectedRoute allowedRoles={['staff']}>
                        <StaffDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </main>
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
