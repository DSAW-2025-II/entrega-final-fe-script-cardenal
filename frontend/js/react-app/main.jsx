import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Importar todos los CSS necesarios
import '../../css/react-global.css';
import '../../css/role-selection.css';
import '../../css/login.css';
import '../../css/register-rider.css';
import '../../css/register-vehicle.css';
import '../../css/profile.css';
import '../../css/profile-edit.css';
import '../../css/dashboard-rider.css';

// Ocultar pantalla de carga
setTimeout(() => {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
}, 500);

// Renderizar React
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);