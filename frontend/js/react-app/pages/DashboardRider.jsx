import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FiltersSection from '../components/FiltersSection';
import TripCard from '../components/TripCard';
import TripModal from '../components/TripModal';

const API_BASE_URL = 'https://wheels-final-project.onrender.com/api';

function DashboardRider() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    origen: '',
    cupos: '',
    estado: 'activo'
  });

  // Cargar información del usuario y verificar auth
  useEffect(() => {
    const isAuthenticated = checkAuth();
    if (isAuthenticated) {
      loadUserInfo();
      loadTrips();
    }
  }, []);

  // Verificar autenticación
  const checkAuth = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
    console.log('🔐 Verificando autenticación...', { 
      hasLocalToken: !!localStorage.getItem('token'),
      hasSessionToken: !!sessionStorage.getItem('authToken'),
      token: token ? 'presente' : 'ausente'
    });
    
    if (!token) {
      console.log('❌ No hay token, redirigiendo al login');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 100);
      return false;
    }
    
    console.log('✅ Token encontrado, usuario autenticado');
    return true;
  };

  // Cargar información del usuario desde el backend
  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

      // Obtener datos actualizados del usuario desde el backend
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user) {
          const user = data.data.user;

          // Actualizar localStorage con los datos más recientes
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);

          setUserInfo({
            name: `${user.nombre} ${user.apellido}`,
            role: user.rol || 'usuario',
            conductorRegistrado: user.conductorRegistrado || false
          });

          console.log('✅ Usuario cargado desde backend:', {
            nombre: `${user.nombre} ${user.apellido}`,
            conductorRegistrado: user.conductorRegistrado
          });
          return;
        }
      }

      // Si falla la petición, usar datos del localStorage como fallback
      console.warn('⚠️ No se pudo cargar desde backend, usando localStorage');
      const userName = sessionStorage.getItem('userName') || localStorage.getItem('userName') || 'Usuario';
      const userDataString = localStorage.getItem('user');
      const userData = userDataString ? JSON.parse(userDataString) : null;

      setUserInfo({
        name: userName,
        role: userData?.rol || 'usuario',
        conductorRegistrado: userData?.conductorRegistrado || false
      });
    } catch (error) {
      console.error('Error al cargar usuario:', error);

      // Fallback a localStorage si hay error
      const userName = sessionStorage.getItem('userName') || localStorage.getItem('userName') || 'Usuario';
      const userDataString = localStorage.getItem('user');
      const userData = userDataString ? JSON.parse(userDataString) : null;

      setUserInfo({
        name: userName,
        role: userData?.rol || 'usuario',
        conductorRegistrado: userData?.conductorRegistrado || false
      });
    }
  };

  // Cargar viajes
  const loadTrips = async (newFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
      const params = new URLSearchParams();
      
      const activeFilters = newFilters || filters;
      
      if (activeFilters.origen) params.append('origen', activeFilters.origen);
      if (activeFilters.cupos) params.append('cupos', activeFilters.cupos);
      if (activeFilters.estado) params.append('estado', activeFilters.estado);
      
      const url = `${API_BASE_URL}/trips${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTrips(data.data.trips || []);
      } else {
        setError(data.message || 'Error al cargar viajes');
        setTrips([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión. Intenta de nuevo.');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
    loadTrips(searchFilters);
  };

  // Seleccionar viaje
  const handleSelectTrip = (trip) => {
    if (trip.asientosDisponibles === 0 || trip.estado === 'lleno') {
      alert('Este viaje está lleno');
      return;
    }
    setSelectedTrip(trip);
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTrip(null);
  };

  // Manejar reserva exitosa
  const handleReservationSuccess = () => {
    setShowModal(false);
    setSelectedTrip(null);
    loadTrips(); // Recargar viajes
    loadMyBookings(); // Recargar mis reservas
  };

  // Cargar mis reservas
  const loadMyBookings = async () => {
    try {
      setLoadingBookings(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMyBookings(data.data.bookings || []);
      } else {
        console.error('Error al cargar reservas:', data.message);
        setMyBookings([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setMyBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Cancelar una reserva
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Reserva cancelada exitosamente');
        loadMyBookings(); // Recargar reservas
        loadTrips(); // Recargar viajes para actualizar cupos disponibles
      } else {
        alert(data.message || 'Error al cancelar reserva');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al cancelar reserva');
    }
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO').format(price);
  };

  // Cerrar sesión
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('token');
      sessionStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  // Ir al perfil
  const handleGoToProfile = () => {
    navigate('/profile/view');
  };

  // Convertirse en conductor
  const handleBecomeDriver = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');

      // Verificar si el usuario ya tiene un vehículo registrado
      const response = await fetch(`${API_BASE_URL}/vehicles/my-vehicle`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Si ya tiene vehículo registrado, redirigir al dashboard de conductor
        // El backend retorna 'vehiculo' no 'vehicle'
        if (data.success && data.data.vehiculo) {
          console.log('✅ Usuario ya tiene vehículo registrado, redirigiendo a dashboard de conductor');

          // Actualizar el rol en el storage
          const userDataString = localStorage.getItem('user');
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            userData.rol = 'conductor';
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('userRole', 'conductor');
            sessionStorage.setItem('userRole', 'conductor');
          }

          // Redirigir al dashboard de conductor
          navigate('/dashboard/driver', { replace: true });
          return;
        }
      }

      // Si no tiene vehículo, redirigir a registro de vehículo
      console.log('ℹ️ Usuario sin vehículo, redirigiendo a registro');
      navigate('/register/vehicle', { replace: true });

    } catch (error) {
      console.error('Error al verificar vehículo:', error);
      // En caso de error, redirigir a registro de vehículo por seguridad
      navigate('/register/vehicle', { replace: true });
    }
  };

  // Asegurar que el scroll inicie desde arriba cuando se carga el componente
  useEffect(() => {
    // Timeout para asegurar que el DOM esté completamente renderizado
    const scrollToTop = () => {
      // Forzar scroll en todos los elementos posibles
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Asegurar que no haya transformaciones o posicionamientos que afecten el scroll
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
    };
    
    // Scroll inmediato
    scrollToTop();
    
    // Scroll después de un pequeño delay para asegurar que se aplique
    setTimeout(scrollToTop, 0);
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 100);
    
    // Restaurar scroll-behavior después
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = '';
      document.body.style.scrollBehavior = '';
    }, 200);
  }, []);

  return (
    <div className="dashboard-rider">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-header">
            <h1 className="logo-title">UTravel <span className="car-icon">🚗</span></h1>
          </div>
          <div className="user-info">
            <span className="user-name" onClick={handleGoToProfile} style={{ cursor: 'pointer' }}>
              {userInfo?.name || 'Usuario'}
            </span>
            <button className="btn-conductor" onClick={handleBecomeDriver}>
              Convertirse en Conductor
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Filtros */}
        <FiltersSection onSearch={handleSearch} />

        {/* Sección de Viajes */}
        <section className="trips-section">
          <h2 className="section-title">Viajes Disponibles</h2>
          
          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando viajes...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-state">
              <p>{error}</p>
              <button className="btn-retry" onClick={() => loadTrips()}>
                Reintentar
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && trips.length === 0 && (
            <div className="empty-state">
              <p>No hay viajes disponibles</p>
            </div>
          )}

          {/* Trips Grid */}
          {!loading && !error && trips.length > 0 && (
            <div className="trips-container">
              {trips.map(trip => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  onSelect={() => handleSelectTrip(trip)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Sección de Mis Reservas */}
        <section className="trips-section" style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="section-title">Mis Reservas</h2>
            <button
              className="btn-search"
              onClick={() => {
                setShowBookings(!showBookings);
                if (!showBookings && myBookings.length === 0) {
                  loadMyBookings();
                }
              }}
              style={{ padding: '10px 20px' }}
            >
              {showBookings ? 'Ocultar' : 'Mostrar'} Reservas
            </button>
          </div>

          {showBookings && (
            <>
              {loadingBookings ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Cargando reservas...</p>
                </div>
              ) : myBookings.length === 0 ? (
                <div className="empty-state">
                  <p>No tienes reservas aún</p>
                </div>
              ) : (
                <div className="trips-container">
                  {myBookings.map((booking) => (
                    <div key={booking._id} className="trip-card" style={{ position: 'relative', paddingTop: '40px' }}>
                      <span className={`status-badge ${
                        booking.estado === 'confirmada' ? 'available' :
                        booking.estado === 'pendiente' ? 'warning' :
                        booking.estado === 'cancelada' ? 'full' : 'available'
                      }`} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        {booking.estado.toUpperCase()}
                      </span>

                      <div className="trip-details">
                        <div className="detail-row">
                          <span className="detail-label">Viaje:</span>
                          <span className="detail-value">
                            {booking.viaje?.origen} → {booking.viaje?.destino}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Conductor:</span>
                          <span className="detail-value">
                            {booking.viaje?.conductor?.nombre} {booking.viaje?.conductor?.apellido}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Teléfono conductor:</span>
                          <span className="detail-value">{booking.viaje?.conductor?.telefono}</span>
                        </div>
                        {booking.viaje?.vehiculo && (
                          <>
                            <div className="detail-row">
                              <span className="detail-label">Vehículo:</span>
                              <span className="detail-value">
                                {booking.viaje.vehiculo.marca} {booking.viaje.vehiculo.modelo}
                              </span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Placa:</span>
                              <span className="detail-value">{booking.viaje.vehiculo.placa}</span>
                            </div>
                          </>
                        )}
                        <div className="detail-row">
                          <span className="detail-label">Hora de salida:</span>
                          <span className="detail-value">{booking.viaje?.hora}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Cupos reservados:</span>
                          <span className="detail-value">{booking.cuposReservados}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Punto de recogida:</span>
                          <span className="detail-value">{booking.puntoRecogida}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Total pagado:</span>
                          <span className="detail-value">${formatPrice(booking.precioTotal)}</span>
                        </div>

                        {/* Botón de cancelar solo si está pendiente o confirmada */}
                        {(booking.estado === 'pendiente' || booking.estado === 'confirmada') && (
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancelBooking(booking._id)}
                            style={{ marginTop: '10px', width: '100%', background: '#ff3b3b' }}
                          >
                            Cancelar Reserva
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Modal de Selección */}
      {showModal && selectedTrip && (
        <TripModal
          trip={selectedTrip}
          onClose={handleCloseModal}
          onSuccess={handleReservationSuccess}
        />
      )}
    </div>
  );
}

export default DashboardRider;