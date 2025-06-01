import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PerfilGraficas from './components/PerfilGraficas';
import DocumentosUploader from './components/DocumentosUploader';
import AdminPanel from './components/AdminPanel';

// Crear el contexto de autenticación
export const AuthContext = createContext(null);

const App = () => {
  const [user, setUser] = useState(null);

  // Login solo con wallet
  const login = async (walletAddress) => {
    if (!walletAddress) throw new Error('Wallet no conectada');
    setUser({ walletAddress });
    localStorage.setItem('user', JSON.stringify({ walletAddress }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Verificar si hay una sesión guardada al cargar la app
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Función para verificar si el usuario es administrador
  const isAdmin = (walletAddress) => {
    // Aquí puedes agregar la lógica para verificar si la wallet es de un administrador
    // Por ahora, usaremos una lista hardcodeada de direcciones de administradores
    const adminWallets = [
      '0x123...', // Reemplaza con tu dirección de wallet
    ];
    return adminWallets.includes(walletAddress);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/perfil-graficas" 
            element={user ? <PerfilGraficas /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/documentos" 
            element={user ? <DocumentosUploader /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={
              user && isAdmin(user.walletAddress) 
                ? <AdminPanel /> 
                : <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App; 