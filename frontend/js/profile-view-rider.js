// profile-view-rider.js

document.addEventListener('DOMContentLoaded', () => {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Verificar si el usuario está autenticado
    checkAuthentication();

    // Cargar datos del usuario
    loadUserProfile();

    // Event listeners
    editProfileBtn.addEventListener('click', () => {
        window.location.href = 'profile-edit-rider.html';
    });

    logoutBtn.addEventListener('click', () => {
        handleLogout();
    });

    // Función para verificar autenticación
    function checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        
        if (!isLoggedIn) {
            // Redirigir al login si no está autenticado
            window.location.href = 'login.html';
        }
    }

    // Función para cargar perfil del usuario
    async function loadUserProfile() {
        try {
            const authToken = sessionStorage.getItem('authToken');
            const userEmail = sessionStorage.getItem('userEmail');
            
            // 🔹 OPCIÓN 1: Intentar obtener perfil completo desde el backend
            let userData = null;
            
            try {
                const response = await fetch('https://wheels-final-project.onrender.com/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const profileData = await response.json();
                    
                    // Construir userData desde el backend
                    const user = profileData.data.user;
                    userData = {
                        firstName: user.nombre || 'User',
                        lastName: user.apellido || '',
                        email: user.correo || userEmail,
                        universityId: user.idUniversidad || 'Not provided',
                        phone: user.telefono || 'Not provided',
                        role: user.rol || 'rider'
                    };
                    
                    console.log('Profile loaded from backend:', userData);
                }
            } catch (error) {
                console.log('Backend profile endpoint not available, using sessionStorage');
            }
            
            // 🔹 OPCIÓN 2: Si no hay backend, usar sessionStorage
            if (!userData) {
                const userName = sessionStorage.getItem('userName');
                const userRole = sessionStorage.getItem('userRole');
                const universityId = sessionStorage.getItem('universityId');
                const userPhone = sessionStorage.getItem('userPhone');
                
                // Extraer nombre y apellido
                const nameParts = userName ? userName.split(' ') : ['', ''];
                const firstName = nameParts[0] || 'User';
                const lastName = nameParts.slice(1).join(' ') || '';

                userData = {
                    firstName: firstName,
                    lastName: lastName,
                    email: userEmail || 'No email',
                    universityId: universityId || 'Not provided',
                    phone: userPhone || 'Not provided',
                    role: userRole || 'rider'
                };
                
                console.log('Profile loaded from sessionStorage:', userData);
            }

            // Rellenar información personal
            document.getElementById('firstName').textContent = userData.firstName;
            document.getElementById('lastName').textContent = userData.lastName;
            document.getElementById('email').textContent = userData.email;
            document.getElementById('universityId').textContent = userData.universityId;
            document.getElementById('phone').textContent = userData.phone;
            document.getElementById('userName').textContent = userData.firstName;
            document.querySelector('.user-avatar').textContent = userData.firstName.charAt(0).toUpperCase();

            // Mostrar rol activo - Rider siempre activo
            const driverBadge = document.getElementById('driverBadge');
            const riderBadge = document.getElementById('riderBadge');
            
            riderBadge.classList.add('active');
            driverBadge.classList.remove('active');

            console.log('Rider profile displayed:', userData);
            
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    // Función para hacer logout
    function handleLogout() {
        // Confirmar logout
        if (confirm('Are you sure you want to log out?')) {
            // Limpiar datos de sesión
            sessionStorage.clear();
            
            // Opcional: Limpiar también localStorage si quieres
            // localStorage.removeItem('registrationData');
            // localStorage.removeItem('selectedRole');
            
            // Redirigir al login
            window.location.href = 'login.html';
            
            console.log('User logged out');
        }
    }

    console.log('Rider profile view loaded');
});