import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/role-selection.css';

const API_BASE_URL = 'https://wheels-final-project.onrender.com/api';

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si ya hay usuario autenticado
    const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
    
    if (token) {
      const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || 'pasajero';
      
      // Redirigir al dashboard correspondiente
      if (userRole === 'conductor' || userRole === 'driver') {
        navigate('/dashboard/driver', { replace: true });
      } else {
        navigate('/dashboard/rider', { replace: true });
      }
    }
  }, [navigate]);

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="home-page-wrapper">
      <div className="container">
        <div className="logo-section">
          <h1 className="logo">
            UTravel <span className="car-emoji">🚗</span>
          </h1>
          <p className="tagline">Rapido y Seguro</p>
        </div>

        <div className="role-selection">
          <h2 className="title">Bienvenido a UTravel</h2>
          <p className="subtitle">Comparte viajes de forma segura en tu universidad</p>
          
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleRegister}>
              Registrarse
            </button>
            <button className="btn-secondary" onClick={handleLogin}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

