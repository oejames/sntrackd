import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SketchDetail from './pages/SketchDetail';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import './styles/main.css';

// wrapper component to use useLocation so the 72px padding doesnt show up if location is sketch page
const AppContent = () => {
  const location = useLocation();
  const isSketchPage = location.pathname.includes('/sketch/');

  return (
    <div className={`min-h-screen bg-[#14181c] ${!isSketchPage ? 'pt-[72px]' : ''}`}>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sketch/:id" element={<SketchDetail />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;