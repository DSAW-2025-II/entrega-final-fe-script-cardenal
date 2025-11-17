// login-driver.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const errorMessage = document.getElementById('errorMessage');

    loadRememberedEmail();

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    async function handleLogin() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberMeCheckbox.checked;

        hideError();

        if (!email || !password) {
            showError('Por favor, completa todos los campos');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Por favor, ingresa un correo válido');
            return;
        }

        if (password.length < 6) {
            showError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        const submitBtn = loginForm.querySelector('.btn-login');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Iniciando sesión...';
        submitBtn.disabled = true;

        try {
            const response = await loginUser(email, password);

            if (response.success) {
                console.log('✅ Login exitoso:', response);

                const user = response.data.user;
                const token = response.data.token;

                // 🔹 Verificamos que el rol sea conductor
                const userRole = user.rol.toLowerCase();
                if (userRole !== 'conductor') {
                    throw new Error('Acceso denegado. Este inicio de sesión es solo para conductores.');
                }

                // 🔹 Guardar datos de sesión
                sessionStorage.setItem('authToken', token);
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userEmail', user.correo);
                sessionStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
                sessionStorage.setItem('userRole', user.rol);
                sessionStorage.setItem('userPhone', user.telefono || '');
                sessionStorage.setItem('userId', user._id);

                localStorage.setItem('token', token);
                localStorage.setItem('userRole', user.rol);

                // 🔹 Redirigir al dashboard del conductor
                redirectToDriverDashboard();

            } else {
                throw new Error(response.message || 'Credenciales inválidas');
            }

        } catch (error) {
            console.error('❌ Error en login:', error);
            showError(error.message || 'Error al iniciar sesión. Intenta de nuevo.');
        } finally {
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    function redirectToDriverDashboard() {
        console.log('🚗 Redirigiendo al dashboard de conductor...');
        window.location.href = 'profile-view.html'; // Ajusta si está en otra carpeta
    }

    async function loginUser(email, password) {
        try {
            const response = await fetch('https://wheels-final-project.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: email, password }) // 👈 backend usa "correo"
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('⚠️ Error conectando con el backend:', error);
            throw new Error('No se pudo conectar con el servidor.');
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(hideError, 5000);
    }

    function hideError() {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }

    function loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
    }

    emailInput.addEventListener('input', hideError);
    passwordInput.addEventListener('input', hideError);

    console.log('🚀 Página de login de conductor cargada');
});