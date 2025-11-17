// check-auth.js - Script para verificar autenticación en index.html

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya hay usuario autenticado
    const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
    
    if (token) {
        const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || 'pasajero';
        
        // Redirigir al dashboard correspondiente
        if (userRole === 'conductor' || userRole === 'driver') {
            window.location.href = 'pages/shared/dashboard.html#/dashboard/driver';
        } else {
            window.location.href = 'pages/shared/dashboard.html#/dashboard/rider';
        }
    }
    // Si no hay token, dejar que el usuario vea el index normalmente
});

