// profile-edit.js

document.addEventListener('DOMContentLoaded', () => {
    const editProfileForm = document.getElementById('editProfileForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Verificar autenticación
    checkAuthentication();

    // Cargar datos actuales del usuario
    loadCurrentProfile();

    // Event listener para el formulario
    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSaveProfile();
    });

    // Event listener para cancelar (volver atrás)
    logoutBtn.addEventListener('click', () => {
        handleCancel();
    });

    // Función para verificar autenticación
    function checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            window.location.href = 'login.html';
        }
    }

    // Función para cargar perfil actual desde el backend
    async function loadCurrentProfile() {
        try {
            const authToken = localStorage.getItem('token') || sessionStorage.getItem('authToken');

            // Llamar al backend para obtener perfil completo
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

            // Rellenar formulario con datos del usuario
            document.getElementById('firstName').value = user.nombre || '';
            document.getElementById('lastName').value = user.apellido || '';
            document.getElementById('email').value = user.correo || '';
            document.getElementById('universityId').value = user.idUniversidad || '';
            document.getElementById('phone').value = user.telefono || '';

            // Actualizar nombre en top bar
            document.getElementById('userName').textContent = user.nombre;
            document.querySelector('.user-avatar').textContent = user.nombre.charAt(0).toUpperCase();

            console.log('Profile loaded for editing:', user);

        } catch (error) {
            console.error('Error loading profile:', error);
            showError('Error loading profile. Please try again.');
        }
    }


    // Función para guardar cambios del perfil
    async function handleSaveProfile() {
        // Obtener valores del formulario
        const currentPassword = document.getElementById('currentPassword').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        const nombre = document.getElementById('firstName').value.trim();
        const apellido = document.getElementById('lastName').value.trim();
        const telefono = document.getElementById('phone').value.trim();

        // Validar campos obligatorios
        if (!nombre || !apellido || !telefono) {
            showError('Please fill in all required fields');
            return;
        }

        // Validar cambio de contraseña si se intentó
        let shouldChangePassword = false;
        if (newPassword || confirmPassword || currentPassword) {
            // Si se llena algún campo de contraseña, todos son requeridos
            if (!currentPassword) {
                showError('Current password is required to change password');
                return;
            }

            if (!newPassword) {
                showError('New password is required');
                return;
            }

            if (!confirmPassword) {
                showError('Please confirm your new password');
                return;
            }

            // Verificar que las contraseñas coincidan
            if (newPassword !== confirmPassword) {
                showError('New passwords do not match');
                return;
            }

            // Validar longitud de la nueva contraseña
            if (newPassword.length < 6) {
                showError('New password must be at least 6 characters long');
                return;
            }

            shouldChangePassword = true;
        }

        // Mostrar loading
        const submitBtn = editProfileForm.querySelector('.btn-save');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        try {
            const authToken = localStorage.getItem('token') || sessionStorage.getItem('authToken');
            
            if (!authToken) {
                throw new Error('No authentication token found. Please login again.');
            }

            // Actualizar perfil (nombre, apellido, teléfono)
            await updateProfile(authToken, { nombre, apellido, telefono });

            // Si se quiere cambiar contraseña, hacerlo por separado
            if (shouldChangePassword) {
                await changePassword(authToken, {
                    passwordActual: currentPassword,
                    passwordNuevo: newPassword,
                    confirmarPassword: confirmPassword
                });
            }

            // Mostrar mensaje de éxito
            showSuccess('Profile updated successfully!');

            // Redirigir a vista de perfil después de 1.5 segundos
            setTimeout(() => {
                window.location.href = 'profile-view.html';
            }, 1500);

        } catch (error) {
            console.error('Error updating profile:', error);
            showError(error.message || 'Failed to update profile');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Función para actualizar perfil (nombre, apellido, teléfono)
    async function updateProfile(authToken, profileData) {
        const response = await fetch('https://wheels-final-project.onrender.com/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(profileData)
        });

        const result = await response.json();

        if (!response.ok) {
            // Manejar errores de validación del backend
            if (result.errors && Array.isArray(result.errors)) {
                const errorMessages = result.errors.map(err => err.msg || err.message).join(', ');
                throw new Error(errorMessages || result.message || 'Error updating profile');
            }
            throw new Error(result.message || 'Error updating profile');
        }

        return result;
    }

    // Función para cambiar contraseña
    async function changePassword(authToken, passwordData) {
        const response = await fetch('https://wheels-final-project.onrender.com/api/auth/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                passwordActual: passwordData.passwordActual,
                passwordNuevo: passwordData.passwordNuevo,
                confirmarPassword: passwordData.confirmarPassword
            })
        });

        const result = await response.json();

        if (!response.ok) {
            // Manejar errores de validación del backend
            if (result.errors && Array.isArray(result.errors)) {
                const errorMessages = result.errors.map(err => err.msg || err.message).join(', ');
                throw new Error(errorMessages || result.message || 'Error changing password');
            }
            throw new Error(result.message || 'Error changing password');
        }

        return result;
    }

    // Función para cancelar y volver a profile view
    function handleCancel() {
        if (confirm('Discard changes and go back?')) {
            window.location.href = 'profile-view.html';
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

    // Validación en tiempo real para campos de contraseña
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    confirmPasswordInput.addEventListener('input', () => {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword && newPassword !== confirmPassword) {
            confirmPasswordInput.style.borderColor = '#ff3b3b';
        } else {
            confirmPasswordInput.style.borderColor = '';
        }
    });

    console.log('Profile edit page loaded');
});