import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Navbar/Footer */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* Auth Routes without Navbar/Footer */}
        <Route path="/login" element={<Login />} />
        
        {/* Hidden Admin Route */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Dashboards Routes */}
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/prof" element={<ProfessorDashboard />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
