// profile-edit-rider.js

document.addEventListener('DOMContentLoaded', () => {
    const editProfileForm = document.getElementById('editProfileForm');
    const driverBtn = document.getElementById('driverBtn');
    const riderBtn = document.getElementById('riderBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    let selectedRole = 'rider'; // Fijo en rider

    // Verificar autenticación
    checkAuthentication();

    // Cargar datos actuales del usuario
    loadCurrentProfile();

    // Los botones de rol son solo visuales, no cambian nada
    // Rider siempre está activo
    driverBtn.addEventListener('click', () => {
        // No hacer nada, rider no puede cambiar a driver desde aquí
        console.log('Role change disabled for rider');
    });

    riderBtn.addEventListener('click', () => {
        // Ya está en rider
        console.log('Already a rider');
    });

    // Event listener para el formulario
    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSaveProfile();
    });

    // Event listener para logout
    logoutBtn.addEventListener('click', () => {
        handleLogout();
    });

    // Función para verificar autenticación
    function checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            window.location.href = 'login.html';
        }
    }

    // Función para cargar perfil actual
    function loadCurrentProfile() {
        // Obtener datos guardados
        const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');
        const userEmail = sessionStorage.getItem('userEmail');

        // Rellenar formulario con datos actuales
        document.getElementById('firstName').value = registrationData.firstName || 'Hugo';
        document.getElementById('lastName').value = registrationData.lastName || 'Ocallega';
        document.getElementById('email').value = userEmail || registrationData.email || 'hugo@gmail.com';
        document.getElementById('universityId').value = registrationData.universityId || '0000123456';
        document.getElementById('phone').value = registrationData.phone || '+57 3124785471';
        
        // Actualizar nombre en top bar
        const firstName = registrationData.firstName || 'Hugo';
        document.getElementById('userName').textContent = firstName;
        document.querySelector('.user-avatar').textContent = firstName.charAt(0).toUpperCase();

        // Establecer rol - siempre rider
        selectedRole = 'rider';
        riderBtn.classList.add('active');
        driverBtn.classList.remove('active');

        console.log('Rider profile loaded for editing');
    }

    // Función para guardar cambios del perfil
    async function handleSaveProfile() {
        // Obtener valores del formulario
        const updatedData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            universityId: document.getElementById('universityId').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('password').value.trim(),
            role: selectedRole // Siempre 'rider'
        };

        // Validar campos obligatorios
        if (!updatedData.firstName || !updatedData.lastName || !updatedData.phone) {
            showError('Please fill in all required fields');
            return;
        }

        // Mostrar loading
        const submitBtn = editProfileForm.querySelector('.btn-save');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        try {
            // Simular guardado (cuando conectes con backend, reemplaza esto)
            await saveProfileChanges(updatedData);

            // Actualizar datos en localStorage
            const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');
            const mergedData = { ...registrationData, ...updatedData };
            localStorage.setItem('registrationData', JSON.stringify(mergedData));
            
            // Actualizar sessionStorage
            sessionStorage.setItem('userEmail', updatedData.email);
            sessionStorage.setItem('userRole', 'rider');

            // Mostrar mensaje de éxito
            showSuccess('Profile updated successfully!');

            // Redirigir a vista de perfil después de 1.5 segundos
            setTimeout(() => {
                window.location.href = 'profile-view-rider.html';
            }, 1500);

        } catch (error) {
            showError(error.message || 'Failed to update profile');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Función para guardar en backend (simulada)
    async function saveProfileChanges(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // TODO: Reemplazar con llamada real al API
                /*
                const response = await fetch('http://localhost:3000/api/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                return result;
                */

                console.log('Rider profile updated:', data);
                resolve({ success: true });
            }, 1000);
        });
    }

    // Función para hacer logout
    function handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            sessionStorage.clear();
            window.location.href = 'login.html';
            console.log('User logged out');
        }
    }

    // Mostrar mensaje de éxito
    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';

        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }

    // Mostrar mensaje de error
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';

        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    // Limpiar mensajes al escribir
    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
        });
    });

    console.log('Rider profile edit page loaded');
});