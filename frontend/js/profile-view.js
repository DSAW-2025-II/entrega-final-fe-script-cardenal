// profile-view.js

document.addEventListener('DOMContentLoaded', () => {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const vehicleInfoBtn = document.getElementById('vehicleInfoBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const vehicleSection = document.getElementById('vehicleSection');
    const becomeDriverBtn = document.getElementById('becomeDriverBtn');
    const driverUpgradeSection = document.getElementById('driverUpgradeSection');

    // Verificar si el usuario está autenticado
    checkAuthentication();

    // Cargar datos del usuario
    loadUserProfile();

    if(becomeDriverBtn){
        becomeDriverBtn.addEventListener('click', handleBecomeDriver);
    }

    // Event listeners
    editProfileBtn.addEventListener('click', () => {
        window.location.href = 'profile-edit.html';
    });

    vehicleInfoBtn.addEventListener('click', () => {
        // Toggle vehicle section visibility
        if (vehicleSection.style.display === 'none') {
            vehicleSection.style.display = 'block';
            vehicleInfoBtn.textContent = 'Hide Vehicle Info';
        } else {
            vehicleSection.style.display = 'none';
            vehicleInfoBtn.textContent = 'Vehicle Info';
        }
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

    async function loadUserProfile() {
    try {
        const authToken = sessionStorage.getItem('authToken');
        
        // ✅ Llamar al backend para obtener perfil completo
        const response = await fetch('https://wheels-final-project.onrender.com/api/auth/me', {
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

        // Rellenar información personal
        document.getElementById('firstName').textContent = user.nombre;
        document.getElementById('lastName').textContent = user.apellido;
        document.getElementById('email').textContent = user.correo;
        document.getElementById('universityId').textContent = user.idUniversidad;
        document.getElementById('phone').textContent = user.telefono;
        document.getElementById('userName').textContent = user.nombre;
        document.querySelector('.user-avatar').textContent = user.nombre.charAt(0).toUpperCase();

        // ✅ Manejar roles y mostrar botón de conductor
        const driverBadge = document.getElementById('driverBadge');
        const riderBadge = document.getElementById('riderBadge');

        if (user.rol === 'conductor' || user.rol === 'ambos') {
            driverBadge.classList.add('active');
            riderBadge.classList.remove('active');
            
            // Si es conductor, cargar vehículo
            await loadVehicleInfo();
            
            // Ocultar botón de upgrade
            if (driverUpgradeSection) {
                driverUpgradeSection.style.display = 'none';
            }
            
        } else if (user.rol === 'pasajero') {
            riderBadge.classList.add('active');
            driverBadge.classList.remove('active');
            vehicleSection.style.display = 'none';
            vehicleInfoBtn.style.display = 'none';
            
            // ✅ MOSTRAR BOTÓN PARA CONVERTIRSE EN CONDUCTOR
            if (driverUpgradeSection) {
                driverUpgradeSection.style.display = 'block';
            }
        }

        console.log('User profile loaded:', user);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Error loading profile. Please login again.');
        handleLogout();
    }
    
}
// Funcion : MANEJAR CONVERTIRSE EN CONDUCTOR
// ✅ NUEVA FUNCIÓN: Manejar conversión a conductor
async function handleBecomeDriver() {
    const authToken = sessionStorage.getItem('authToken');
    
    try {
        // Mostrar loading
        const btn = document.getElementById('becomeDriverBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Verificando...';
        btn.disabled = true;
        
        // Verificar estado actual
        const statusResponse = await fetch('https://wheels-final-project.onrender.com/api/auth/check-driver-status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const statusData = await statusResponse.json();

        if (statusData.success && statusData.data.tieneVehiculo) {
            // Ya tiene vehículo, solo actualizar vista
            alert('Ya tienes un vehículo registrado');
            location.reload();
        } else {
            // Redirigir a registro de vehículo
            window.location.href = 'register-vehicle.html';
        }
        
    } catch (error) {
        console.error('Error:', error);
        // Si falla la verificación, igual redirigir a registro
        window.location.href = 'register-vehicle.html';
    }
}
    // 🔹 Función para cargar información del vehículo desde el backend
async function loadVehicleInfo() {
    try {
        const authToken = sessionStorage.getItem('authToken');
        
        const response = await fetch('https://wheels-final-project.onrender.com/api/vehicles/my-vehicle', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const vehicleData = await response.json();

            // ✅ Aquí corregimos: acceder a data.vehiculo
            if (vehicleData && vehicleData.data && vehicleData.data.vehiculo) {
                const vehicle = vehicleData.data.vehiculo;

                // Rellenar datos del vehículo
                document.getElementById('licensePlate').textContent = vehicle.placa || 'N/A';
                document.getElementById('make').textContent = vehicle.marca || 'N/A';
                document.getElementById('model').textContent = vehicle.modelo || 'N/A';
                document.getElementById('capacity').textContent = vehicle.capacidad || 'N/A';

                // Si hay imágenes disponibles
                if (vehicle.fotoVehiculo) {
                    const vehicleImg = document.getElementById('vehiclePhoto');
                    if (vehicleImg) vehicleImg.src = vehicle.fotoVehiculo;
                }
                if (vehicle.fotoSOAT) {
                    const soatImg = document.getElementById('soatPhoto');
                    if (soatImg) soatImg.src = vehicle.fotoSOAT;
                }

                // Mostrar sección del vehículo
                vehicleSection.style.display = 'block';
                vehicleInfoBtn.style.display = 'block';

                console.log('✅ Vehicle info loaded:', vehicle);
            } else {
                console.log('⚠️ No vehicle registered yet');
                showNoVehicleMessage();
            }
        } else if (response.status === 404) {
            console.log('🚫 No vehicle found');
            showNoVehicleMessage();
        } else {
            throw new Error('Error loading vehicle info');
        }
        
    } catch (error) {
        console.error('❌ Error loading vehicle:', error);
        showNoVehicleMessage();
    }
}


    // 🔹 Mostrar mensaje cuando no hay vehículo
    function showNoVehicleMessage() {
        vehicleSection.style.display = 'none';
        vehicleInfoBtn.style.display = 'none';
        
        // Opcional: mostrar mensaje al usuario
        console.log('No vehicle information available');
        
        // Puedes agregar un mensaje en la UI si quieres
        // const message = document.createElement('div');
        // message.className = 'info-message';
        // message.textContent = 'No vehicle registered. Please add your vehicle information.';
        // document.querySelector('.action-buttons').before(message);
    }

    // Función para hacer logout
    function handleLogout() {
        // Confirmar logout
        if (confirm('Are you sure you want to log out?')) {
            // Limpiar datos de sesión
            sessionStorage.clear();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');

            // Redirigir al login
            window.location.href = 'login.html';

            console.log('User logged out');
        }
    }

    console.log('Profile view loaded');
});