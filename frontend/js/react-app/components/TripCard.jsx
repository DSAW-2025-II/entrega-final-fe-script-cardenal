import React from 'react';

function TripCard({ trip, onSelect }) {
  const isBlocked = trip.asientosDisponibles === 0 || trip.estado === 'lleno';
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO').format(price);
  };

  const formatRoute = (ruta, origen, destino) => {
    const points = [origen]; // Siempre incluir origen

    // Agregar puntos intermedios si existen
    if (Array.isArray(ruta) && ruta.length > 0) {
      points.push(...ruta);
    } else if (typeof ruta === 'string' && ruta.trim() !== '') {
      const rutaArray = ruta.split(',').map(p => p.trim()).filter(p => p !== '');
      points.push(...rutaArray);
    }

    points.push(destino); // Siempre incluir destino
    return points.join(' → ');
  };

  const formatRouteDetailed = (ruta, origen, destino) => {
    const points = [origen]; // Siempre incluir origen

    // Agregar puntos intermedios si existen
    if (Array.isArray(ruta) && ruta.length > 0) {
      points.push(...ruta);
    } else if (typeof ruta === 'string' && ruta.trim() !== '') {
      const rutaArray = ruta.split(',').map(p => p.trim()).filter(p => p !== '');
      points.push(...rutaArray);
    }

    points.push(destino); // Siempre incluir destino
    return points.map((punto, index) => `${index + 1}. ${punto}`).join('\n');
  };

  return (
    <div className={`trip-card ${isBlocked ? 'blocked' : ''}`}>
      <span className={`status-badge ${isBlocked ? 'full' : 'available'}`}>
        {isBlocked ? 'LLENO' : 'DISPONIBLE'}
      </span>
      
      <div className="driver-info">
        {trip.conductor?.foto ? (
          <img
            src={trip.conductor.foto}
            alt="Foto conductor"
            className="driver-photo"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="driver-photo-placeholder">
            {(trip.conductor?.nombre || 'C').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="driver-details">
          <h3>
            {trip.conductor?.nombre || 'Conductor'} {trip.conductor?.apellido || ''}
          </h3>
          <p>Tel: {trip.conductor?.telefono || 'N/A'}</p>
        </div>
      </div>
      
      <div className="trip-details">
        <div className="detail-row">
          <span className="detail-label">Punto inicio:</span>
          <span className="detail-value">{trip.origen}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Punto final:</span>
          <span className="detail-value">{trip.destino}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Ruta completa:</span>
          <span className="detail-value">{formatRoute(trip.ruta, trip.origen, trip.destino)}</span>
        </div>
        <div className="route-display">
          {(() => {
            // Solo mostrar puntos intermedios en el box
            const points = [];
            if (Array.isArray(trip.ruta) && trip.ruta.length > 0) {
              points.push(...trip.ruta);
            } else if (typeof trip.ruta === 'string' && trip.ruta.trim() !== '') {
              const rutaArray = trip.ruta.split(',').map(p => p.trim()).filter(p => p !== '');
              points.push(...rutaArray);
            }

            if (points.length === 0) {
              return <div>Sin puntos intermedios</div>;
            }

            return points.map((punto, idx) => (
              <div key={idx}>{idx + 1}. {punto}</div>
            ));
          })()}
        </div>
        {trip.vehiculo && (
          <>
            <div className="detail-row">
              <span className="detail-label">Vehículo:</span>
              <span className="detail-value">
                {trip.vehiculo.marca} {trip.vehiculo.modelo}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Placa:</span>
              <span className="detail-value">{trip.vehiculo.placa}</span>
            </div>
          </>
        )}
        <div className="detail-row">
          <span className="detail-label">Cupos disponibles:</span>
          <span className="detail-value">{trip.asientosDisponibles}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Hora de salida:</span>
          <span className="detail-value">{trip.hora}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Tarifa por pasajero:</span>
          <span className="detail-value">${formatPrice(trip.precio)}</span>
        </div>
      </div>
      
      <div className="trip-actions">
        <button
          className="btn-action btn-select"
          onClick={onSelect}
          disabled={isBlocked}
        >
          Seleccionar Viaje
        </button>
      </div>
    </div>
  );
}

export default TripCard;