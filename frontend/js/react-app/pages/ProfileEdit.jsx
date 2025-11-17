import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/profile-edit.css';

const API_BASE_URL = 'https://wheels-final-project.onrender.com/api';

function ProfileEdit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    universityId: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthentication();
    loadCurrentProfile();
  }, []);

  const checkAuthentication = () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') || localStorage.getItem('token');
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  };

  const loadCurrentProfile = async () => {
    try {
      const authToken = localStorage.getItem('token') || sessionStorage.getItem('authToken');

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
      const user = profileData.data.user;

      setFormData({
        firstName: user.nombre || '',
        lastName: user.apellido || '',
        email: user.correo || '',
        universityId: user.idUniversidad || '',
        phone: user.telefono || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Error loading profile. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { firstName, lastName, phone, currentPassword, newPassword, confirmPassword } = formData;

    // Validar campos obligatorios
    if (!firstName || !lastName || !phone) {
      setError('Please fill in all required fields');
      return;
    }

    // Validar cambio de contraseña si se intentó
    let shouldChangePassword = false;
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setError('Current password is required to change password');
        return;
      }

      if (!newPassword) {
        setError('New password is required');
        return;
      }

      if (!confirmPassword) {
        setError('Please confirm your new password');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return;
      }

      shouldChangePassword = true;
    }

    setLoading(true);

    try {
      const authToken = localStorage.getItem('token') || sessionStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Actualizar perfil (nombre, apellido, teléfono)
      await updateProfile(authToken, { 
        nombre: firstName, 
        apellido: lastName, 
        telefono: phone 
      });

      // Si se quiere cambiar contraseña, hacerlo por separado
      if (shouldChangePassword) {
        await changePassword(authToken, {
          passwordActual: currentPassword,
          passwordNuevo: newPassword,
          confirmarPassword: confirmPassword
        });
      }

      // Mostrar mensaje de éxito
      setSuccess('Info updated successfully!');

      // Redirigir a vista de perfil después de 1.5 segundos
      setTimeout(() => {
        navigate('/profile/view', { replace: true });
      }, 1500);

    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (authToken, profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(profileData)
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors && Array.isArray(result.errors)) {
        const errorMessages = result.errors.map(err => err.msg || err.message).join(', ');
        throw new Error(errorMessages || result.message || 'Error updating profile');
      }
      throw new Error(result.message || 'Error updating profile');
    }

    return result;
  };

  const changePassword = async (authToken, passwordData) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        passwordActual: passwordData.passwordActual,
        passwordNuevo: passwordData.passwordNuevo,
        confirmarPassword: passwordData.confirmarPassword
      })
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors && Array.isArray(result.errors)) {
        const errorMessages = result.errors.map(err => err.msg || err.message).join(', ');
        throw new Error(errorMessages || result.message || 'Error changing password');
      }
      throw new Error(result.message || 'Error changing password');
    }

    return result;
  };

  const handleCancel = () => {
    if (window.confirm('Discard changes and go back?')) {
      navigate('/profile/view', { replace: true });
    }
  };

  const handleGoToDashboard = () => {
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || 'pasajero';
    if (userRole === 'conductor' || userRole === 'driver') {
      navigate('/dashboard/driver', { replace: true });
    } else {
      navigate('/dashboard/rider', { replace: true });
    }
  };

  const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName') || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="profile-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-item" onClick={handleGoToDashboard}>Inicio</div>
        <div className="sidebar-item" onClick={() => navigate('/profile/view')}>Información Personal</div>
        <div className="sidebar-item active">Editar Perfil</div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="user-menu">
            <span>{userName}</span>
            <div className="user-avatar">{userInitial}</div>
          </div>
        </div>

        <div className="profile-card">
          <div className="logo-header">
            <h1 className="logo">UTravel <span className="car-icon">🚗</span></h1>
          </div>

          <h2 className="profile-title">Editar Perfil</h2>

          <form onSubmit={handleSubmit} className="edit-form">
            {/* Personal Information */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Nombre</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName"
                    className="input-field"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Apellido</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName"
                    className="input-field"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo Institucional</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  className="input-field"
                  value={formData.email}
                  readOnly
                  style={{ backgroundColor: '#ffffffff', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="universityId">ID Universitario</label>
                <input 
                  type="text" 
                  id="universityId" 
                  name="universityId"
                  className="input-field"
                  value={formData.universityId}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  className="input-field"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="currentPassword">Contraseña Actual</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  className="input-field"
                  placeholder="Ingresa contraseña actual"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className="input-field"
                  placeholder="Ingresa nueva contraseña"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="input-field"
                  placeholder="Confirma nueva contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    borderColor: formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? '#ff3b3b' : ''
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button type="button" className="btn-danger" onClick={handleCancel}>
                Cancelar
              </button>
            </div>
          </form>

          {/* Success/Error Messages */}
          {success && (
            <div className="success-box" style={{ display: 'block' }}>
              {success}
            </div>
          )}
          {error && (
            <div className="error-box" style={{ display: 'block' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileEdit;


