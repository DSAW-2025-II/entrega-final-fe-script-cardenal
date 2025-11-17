import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://wheels-final-project.onrender.com/api';

function TripModal({ trip, onClose, onSuccess }) {
  const [numCupos, setNumCupos] = useState('');
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO').format(price);
  };

  const totalPrice = numCupos ? trip.precio * parseInt(numCupos) : 0;

  // Obtener puntos de recogida disponibles
  // SOLO puntos intermedios (ruta), sin origen ni destino
  const availablePickupPoints = (() => {
    const points = [];

    // Solo agregar puntos intermedios
    if (Array.isArray(trip.ruta) && trip.ruta.length > 0) {
      points.push(...trip.ruta);
    } else if (typeof trip.ruta === 'string' && trip.ruta.trim() !== '') {
      const rutaArray = trip.ruta.split(',').map(p => p.trim()).filter(p => p !== '');
      points.push(...rutaArray);
    }

    return points;
  })();

  // Actualizar puntos de recogida cuando cambia el número de cupos
  useEffect(() => {
    if (numCupos) {
      const count = parseInt(numCupos);
      const newPickupPoints = Array(count).fill(null).map((_, index) => ({
        cupo: index + 1,
        puntoIndex: '',
        puntoNombre: ''
      }));
      setPickupPoints(newPickupPoints);
    } else {
      setPickupPoints([]);
    }
  }, [numCupos]);

  const handlePickupChange = (index, value) => {
    const newPickupPoints = [...pickupPoints];
    newPickupPoints[index].puntoIndex = value;
    newPickupPoints[index].puntoNombre = availablePickupPoints[value] || '';
    setPickupPoints(newPickupPoints);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!numCupos) {
      setError('Por favor selecciona la cantidad de cupos');
      return;
    }

    // Validar que todos los puntos de recogida estén seleccionados
    const hasEmptyPickup = pickupPoints.some(p => !p.puntoIndex && p.puntoIndex !== 0);
    if (hasEmptyPickup) {
      setError('Por favor selecciona todos los puntos de recogida');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/trips/${trip._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          numCupos: parseInt(numCupos),
          pickupPoints: pickupPoints.map(p => ({
            puntoNombre: p.puntoNombre
          }))
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('¡Reserva realizada exitosamente!');
        onSuccess();
      } else {
        setError(data.message || 'Error al realizar la reserva');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Seleccionar Viaje</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {/* Resumen del viaje */}
          <div className="trip-summary">
            <div className="summary-row">
              <span className="summary-label">Conductor:</span>
              <span className="summary-value">
                {trip.conductor?.nombre || ''} {trip.conductor?.apellido || ''}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Teléfono:</span>
              <span className="summary-value">{trip.conductor?.telefono || 'N/A'}</span>
            </div>
            {trip.vehiculo && (
              <>
                <div className="summary-row">
                  <span className="summary-label">Vehículo:</span>
                  <span className="summary-value">
                    {trip.vehiculo.marca} {trip.vehiculo.modelo}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Placa:</span>
                  <span className="summary-value">{trip.vehiculo.placa}</span>
                </div>
              </>
            )}
            <div className="summary-row">
              <span className="summary-label">Ruta:</span>
              <span className="summary-value">{trip.origen} → {trip.destino}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Hora de salida:</span>
              <span className="summary-value">{trip.hora}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Tarifa por cupo:</span>
              <span className="summary-value">${formatPrice(trip.precio)}</span>
            </div>
          </div>

          {/* Formulario de selección */}
          <form className="select-trip-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="numCupos">¿Cuántos cupos necesitas?</label>
              <select
                id="numCupos"
                className="input-field"
                value={numCupos}
                onChange={(e) => setNumCupos(e.target.value)}
                required
              >
                <option value="">Selecciona...</option>
                {Array.from({ length: Math.min(trip.asientosDisponibles, 4) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i + 1 === 1 ? 'cupo' : 'cupos'}
                  </option>
                ))}
              </select>
            </div>

            {/* Puntos de recogida */}
            {pickupPoints.length > 0 && (
              <div className="pickup-points-container">
                {pickupPoints.map((pickup, index) => (
                  <div key={index} className="pickup-point-item">
                    <label>Punto de recogida Cupo {pickup.cupo}:</label>
                    <select
                      className="input-field"
                      value={pickup.puntoIndex}
                      onChange={(e) => handlePickupChange(index, e.target.value)}
                      required
                    >
                      <option value="">Selecciona punto...</option>
                      {availablePickupPoints.map((punto, puntoIndex) => (
                        <option key={puntoIndex} value={puntoIndex}>
                          {punto}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Resumen de precio */}
            <div className="price-summary">
              <div className="price-row">
                <span>Cupos seleccionados:</span>
                <span>{numCupos || 0}</span>
              </div>
              <div className="price-row">
                <span>Tarifa por cupo:</span>
                <span>${formatPrice(trip.precio)}</span>
              </div>
              <div className="price-row total">
                <span>Total a pagar:</span>
                <span>${formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="error-box">{error}</div>
            )}

            {/* Botones */}
            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-confirm"
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TripModal;