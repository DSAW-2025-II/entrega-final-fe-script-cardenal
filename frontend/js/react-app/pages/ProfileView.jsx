import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/profile.css';

const API_BASE_URL = 'https://wheels-final-project.onrender.com/api';

function ProfileView() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVehicle, setShowVehicle] = useState(false);

  useEffect(() => {
    checkAuthentication();
    loadUserProfile();
  }, []);

  const checkAuthentication = () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') || localStorage.getItem('token');
    
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  };

  const loadUserProfile = async () => {
    try {
      const authToken = localStorage.getItem('token') || sessionStorage.getItem('authToken');
      
      // Cargar perfil completo
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error loading profile');
      }

      const profileData = await response.json();
      const userData = profileData.data.user;

      setUser(userData);

      // Si es conductor, cargar vehículo
      if (userData.rol === 'conductor' || userData.rol === 'ambos') {
        await loadVehicleInfo(authToken);
      }

    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Error loading profile. Please login again.');
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleInfo = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/my-vehicle`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const vehicleData = await response.json();
        if (vehicleData && vehicleData.data && vehicleData.data.vehiculo) {
          setVehicle(vehicleData.data.vehiculo);
          setShowVehicle(true);
        }
      }
    } catch (error) {
      console.error('Error loading vehicle:', error);
    }
  };

  const handleBecomeDriver = async () => {
    const authToken = localStorage.getItem('token') || sessionStorage.getItem('authToken');
    
    try {
      // Verificar estado actual
      const statusResponse = await fetch(`${API_BASE_URL}/auth/check-driver-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const statusData = await statusResponse.json();

      if (statusData.success && statusData.data.tieneVehiculo) {
        alert('Ya tienes un vehículo registrado');
        window.location.reload();
      } else {
        // Redirigir a registro de vehículo
        navigate('/register/vehicle', { replace: true });
      }
    } catch (error) {
      console.error('Error:', error);
      navigate('/register/vehicle', { replace: true });
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      sessionStorage.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      navigate('/login', { replace: true });
    }
  };

  const handleGoToDashboard = () => {
    if (user?.rol === 'conductor' || user?.rol === 'driver') {
      navigate('/dashboard/driver', { replace: true });
    } else {
      navigate('/dashboard/rider', { replace: true });
    }
  };

  if (loading || !user) {
    return (
      <div className="profile-wrapper">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#676262ff' }}>
          
        </div>
      </div>
    );
  }

  const isDriver = user.rol === 'conductor' || user.rol === 'ambos';
  const isRider = user.rol === 'pasajero';

  return (
    <div className="profile-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-item" onClick={handleGoToDashboard}>Inicio</div>
        <div className="sidebar-item active">Información Personal</div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        {/* Top Bar with User */}
        <div className="top-bar">
          <div className="user-menu">
            <span>{user.nombre}</span>
            <div className="user-avatar">{user.nombre.charAt(0).toUpperCase()}</div>
          </div>
        </div>

        <div className="profile-card">
          <div className="logo-header">
            <h1 className="logo">UTravel <span className="car-icon"> 🚗</span></h1>
          </div>

          <h2 className="profile-title">Información Personal</h2>

          {/* Personal Information */}
          <div className="info-section">
            <div className="info-row">
              <div className="info-group">
                <label>Nombre</label>
                <div className="info-value">{user.nombre}</div>
              </div>

              <div className="info-group">
                <label>Apellido</label>
                <div className="info-value">{user.apellido}</div>
              </div>
            </div>

            <div className="info-group">
              <label>Correo Institucional</label>
              <div className="info-value">{user.correo}</div>
            </div>

            <div className="info-group">
              <label>ID Universitario</label>
              <div className="info-value">{user.idUniversidad}</div>
            </div>

            <div className="info-group">
              <label>Teléfono</label>
              <div className="info-value">{user.telefono}</div>
            </div>

            

            
          </div>

          {isRider && (
            <div className="driver-upgrade-section">
              <div className="info-message">
                <p> ¿Quieres ofrecer viajes como conductor?</p>
                <button className="btn-primary" onClick={handleBecomeDriver}>
                  Registrarme como Conductor
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-secondary" onClick={() => navigate('/profile/edit')}>
              Editar Perfil
            </button>
            {isDriver && vehicle && (
              <button 
                className="btn-vehicle" 
                onClick={() => setShowVehicle(!showVehicle)}
              >
                {showVehicle ? 'Hide Vehicle Info' : 'Vehicle Info'}
              </button>
            )}
            <button className="btn-danger" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;

