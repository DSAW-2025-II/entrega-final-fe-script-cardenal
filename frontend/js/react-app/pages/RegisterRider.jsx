import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/register-rider.css';

const API_BASE_URL = 'https://wheels-final-project.onrender.com/api';

function RegisterRider() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    universityId: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedRole = 'rider'; // Fijo en rider

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@unisabana\.edu\.co$/;
    return emailRegex.test(email);
  };

  const validateForm = (data) => {
    // Validar campos vacíos
    if (!data.firstName || !data.lastName || !data.universityId || 
        !data.email || !data.phone || !data.password) {
      setError('Por favor, completa todos los campos');
      return false;
    }

    // Validar email
    if (!isValidEmail(data.email)) {
      setError('Por favor, ingresa un correo @unisabana.edu.co válido');
      return false;
    }

    // Validar ID universitario (solo números)
    if (!/^\d+$/.test(data.universityId)) {
      setError('El ID universitario debe contener solo números');
      return false;
    }

    // Validar teléfono (formato básico)
    if (data.phone.length < 10) {
      setError('Por favor, ingresa un número de teléfono válido');
      return false;
    }

    // Validar contraseña
    if (data.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm(formData)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.firstName,
          apellido: formData.lastName,
          idUniversidad: formData.universityId,
          correo: formData.email,
          password: formData.password,
          telefono: formData.phone,
          rol: 'pasajero'
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al registrar el usuario');
      }

      // Guardar datos en sessionStorage
      const user = result.data.user;
      const token = result.data.token;

      sessionStorage.setItem('userEmail', user.correo);
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
      sessionStorage.setItem('userRole', user.rol);
      
      if (user.idUniversidad) {
        sessionStorage.setItem('universityId', user.idUniversidad);
      }
      if (user.telefono) {
        sessionStorage.setItem('userPhone', user.telefono);
      }

      // También guardar en localStorage para que React lo pueda leer
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.rol);
      localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);

      // Redirigir al dashboard de React para pasajeros
      setTimeout(() => {
        navigate('/dashboard/rider', { replace: true });
      }, 500);

    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Error al registrar. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  return (
    <div className="register-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-item" onClick={() => navigate('/login')}>Iniciar Sesión</div>
        <div className="sidebar-item active">Registro</div>
      </div>

      <div className="register-content">
        <div className="register-card">
          <div className="logo-header">
            <h1 className="logo">UTravel <span className="car-icon">🚗</span></h1>
          </div>

          <h2 className="register-title">Regístrate en UTravel</h2>

          

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Nombre</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  placeholder="Juan "
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
                  placeholder="Rodriguez"
                  className="input-field"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="universityId">ID Universitario</label>
              <input 
                type="text" 
                id="universityId" 
                name="universityId" 
                placeholder="123456"
                className="input-field"
                value={formData.universityId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Corporativo</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="juanrodri@unisabana.edu.co"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                placeholder="+57 3001234567"
                className="input-field"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="••••••••"
                className="input-field"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <button type="submit" className="btn-next" disabled={loading}>
              {loading ? 'Processing...' : 'OK '}
            </button>

            <p className="signin-text">
              ¿Ya tienes una cuenta? 
              <a href="#" className="signin-link" onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}>Iniciar sesión</a>
            </p>
          </form>

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

export default RegisterRider;


