// register-rider.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Rider registration page loaded');

    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    
    let selectedRole = 'rider'; // Fijo en rider

    // Event listener para el formulario
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegister();
    });

    // Función principal para manejar el registro
    async function handleRegister() {
        // Obtener valores del formulario
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            universityId: document.getElementById('universityId').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('password').value.trim(),
            role: selectedRole
        };

        // Limpiar error previo
        hideError();

        // Validaciones
        if (!validateForm(formData)) {
            return;
        }

        console.log('Starting rider registration...', formData);

        // Mostrar loading
        const submitBtn = registerForm.querySelector('.btn-next');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        try {
            // Registrar en el backend
            const result = await registerRider(formData);
            
            // 🔹 IMPORTANTE: Guardar en sessionStorage (no localStorage)
            const user = result.data.user;
            const token = result.data.token;

            sessionStorage.setItem('userEmail', user.correo);
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
            sessionStorage.setItem('userRole', user.rol);
            
            // Guardar datos adicionales
            if (user.idUniversidad) {
                sessionStorage.setItem('universityId', user.idUniversidad);
            }
            if (user.telefono) {
                sessionStorage.setItem('userPhone', user.telefono);
            }

            console.log('✅ Registration successful. Session data saved:', {
                email: user.correo,
                name: `${user.nombre} ${user.apellido}`,
                role: user.rol,
                universityId: user.idUniversidad,
                phone: user.telefono
            });

            // También guardar en localStorage para que React lo pueda leer
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('userRole', user.rol);
            localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
            
            // Redirigir al dashboard de React para pasajeros
            setTimeout(() => {
                window.location.href = 'dashboard.html#/dashboard/rider';
            }, 500);

        } catch (error) {
            console.error('❌ Registration error:', error);
            showError(error.message || 'Registration failed. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Validar formulario
    function validateForm(data) {
        // Validar campos vacíos
        if (!data.firstName || !data.lastName || !data.universityId || 
            !data.email || !data.phone || !data.password) {
            showError('Please fill in all fields');
            return false;
        }

        // Validar email
        if (!isValidEmail(data.email)) {
            showError('Please enter a valid email address');
            return false;
        }

        // Validar ID universitario (solo números)
        if (!/^\d+$/.test(data.universityId)) {
            showError('University ID must contain only numbers');
            return false;
        }

        // Validar teléfono (formato básico)
        if (data.phone.length < 10) {
            showError('Please enter a valid phone number');
            return false;
        }

        // Validar contraseña
        if (data.password.length < 6) {
            showError('Password must be at least 6 characters');
            return false;
        }

        return true;
    }

    // Validar formato de email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Registrar usuario rider (API real)
    async function registerRider(data) {
        try {
            const response = await fetch('https://wheels-final-project.onrender.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: data.firstName,
                    apellido: data.lastName,
                    idUniversidad: data.universityId,
                    correo: data.email,
                    password: data.password,
                    telefono: data.phone,
                    rol: 'pasajero'
                })
            });

            const result = await response.json();
            console.log('Server response:', result);

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error al registrar el usuario');
            }

            return result;
        } catch (error) {
            console.error('Error registering rider:', error);
            throw error;
        }
    }

    // Mostrar mensaje de error
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        setTimeout(() => {
            hideError();
        }, 5000);
    }

    // Ocultar mensaje de error
    function hideError() {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }

    // Limpiar errores al escribir
    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
        input.addEventListener('input', hideError);
    });
});