import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import Student from './pages/Student';
import Grader from './pages/Grader';
import Coach from './pages/Coach';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/student" element={
          <ProtectedRoute requiredRole="student">
            <Student />
          </ProtectedRoute>
        } />
        <Route path="/grader" element={
          <ProtectedRoute requiredRole="grader">
            <Grader />
          </ProtectedRoute>
        } />
        <Route path="/coach" element={
          <ProtectedRoute requiredRole="coach">
            <Coach />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;