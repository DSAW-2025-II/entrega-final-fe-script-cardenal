// login.js

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya hay usuario autenticado
    checkIfAlreadyLoggedIn();
    
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const errorMessage = document.getElementById('errorMessage');

    // Cargar email guardado si existe
    loadRememberedEmail();

    // Event listener para el formulario
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    // Función principal para manejar el login
    async function handleLogin() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberMeCheckbox.checked;

        // Limpiar mensaje de error previo
        hideError();

        // Validaciones básicas
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        // Guardar email si "Remember me" está marcado
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        // Mostrar loading en el botón
        const submitBtn = loginForm.querySelector('.btn-login');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        try {
            // 🔹 Llamar al backend real
            const response = await loginUser(email, password);

            if (response.success) {
                console.log('Login successful!', response);

                // ✅ Extraer datos reales de la respuesta
                const user = response.data.user;
                const token = response.data.token;

                // Guardar datos de sesión
                sessionStorage.setItem('userEmail', user.correo);
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('authToken', token);
                sessionStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
                sessionStorage.setItem('userRole', user.rol);
                
                // También guardar en localStorage para que React lo pueda leer
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('userRole', user.rol);
                localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);

                // Redirigir según rol
                redirectToDashboard(user.rol);
            } else {
                throw new Error(response.message || 'Invalid credentials');
            }

        } catch (error) {
            console.error('Login error:', error);
            showError(error.message || 'Invalid credentials. Please try again.');
            
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // 🔹 Función actualizada para usar tu API real
    async function loginUser(email, password) {
        try {
            const response = await fetch('https://wheels-final-project.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: email, password }) // 👈 el backend espera "correo"
            });

            const data = await response.json();
            return data; // el backend ya retorna { success, message, data: { user, token } }

        } catch (error) {
            console.error('Error connecting to backend:', error);
            throw new Error('Server error. Please try again later.');
        }
    }

    // Validar formato de email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Mostrar mensaje de error
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => hideError(), 5000);
    }

    // Ocultar mensaje de error
    function hideError() {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }

    // Verificar si ya hay usuario autenticado
    function checkIfAlreadyLoggedIn() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
        if (token) {
            const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || 'pasajero';
            // Redirigir al dashboard correspondiente
            if (userRole === 'conductor' || userRole === 'driver') {
                window.location.href = 'dashboard.html#/dashboard/driver';
            } else {
                window.location.href = 'dashboard.html#/dashboard/rider';
            }
        }
    }

    // Cargar email recordado del localStorage
    function loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
    }

    // Redirigir al dashboard según el rol
    function redirectToDashboard(role) {
    console.log(`Redirecting to dashboard for role: ${role}`);

    if (role === 'driver' || role === 'conductor') {
        // Redirige al dashboard de conductor en React
        window.location.href = 'dashboard.html#/dashboard/driver';
    } else if (role === 'rider' || role === 'pasajero') {
        // Redirige al dashboard de pasajero en React
        window.location.href = 'dashboard.html#/dashboard/rider';
    } else {
        // Si el rol no coincide, redirige al dashboard de pasajero por defecto
        window.location.href = 'dashboard.html#/dashboard/rider';
    }
}


    // Limpiar mensajes de error al escribir en los inputs
    emailInput.addEventListener('input', hideError);
    passwordInput.addEventListener('input', hideError);

    // Prevenir submit con Enter en campos individuales (opcional)
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput.focus();
        }
    });

    console.log('Login page loaded');
    console.log('Selected role from previous page:', localStorage.getItem('selectedRole'));
});