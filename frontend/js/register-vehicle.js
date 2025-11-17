// register-vehicle.js

document.addEventListener('DOMContentLoaded', () => {
    const vehicleForm = document.getElementById('vehicleForm');
    const capacityButtons = document.querySelectorAll('.capacity-btn');
    const capacityInput = document.getElementById('capacity');
    const vehiclePhotoInput = document.getElementById('vehiclePhoto');
    const vehiclePhotoName = document.getElementById('vehiclePhotoName');
    const soatPhotoInput = document.getElementById('soatPhoto');
    const soatPhotoName = document.getElementById('soatPhotoName');
    const errorMessage = document.getElementById('errorMessage');

    capacityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            capacityButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            capacityInput.value = btn.dataset.capacity;
            console.log('Capacity selected:', btn.dataset.capacity);
        });
    });

    vehiclePhotoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            vehiclePhotoName.textContent = e.target.files[0].name;
            vehiclePhotoName.classList.add('has-file');
        } else {
            vehiclePhotoName.textContent = 'No file chosen';
            vehiclePhotoName.classList.remove('has-file');
        }
    });

    vehiclePhotoName.addEventListener('click', () => {
        vehiclePhotoInput.click();
    });

    soatPhotoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            soatPhotoName.textContent = e.target.files[0].name;
            soatPhotoName.classList.add('has-file');
        } else {
            soatPhotoName.textContent = 'No hay archivo seleccionado';
            soatPhotoName.classList.remove('has-file');
        }
    });

    soatPhotoName.addEventListener('click', () => {
        soatPhotoInput.click();
    });

    vehicleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleVehicleSubmit();
    });

    async function handleVehicleSubmit() {
        const vehicleData = {
            licensePlate: document.getElementById('licensePlate').value.trim().toUpperCase(),
            make: document.getElementById('make').value,
            model: document.getElementById('model').value,
            capacity: parseInt(capacityInput.value),
            vehiclePhoto: vehiclePhotoInput.files[0],
            soatPhoto: soatPhotoInput.files[0]
        };

        hideError();

        if (!validateVehicleForm(vehicleData)) {
            return;
        }

        const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');

        const completeData = {
            ...registrationData,
            vehicle: {
                licensePlate: vehicleData.licensePlate,
                make: vehicleData.make,
                model: vehicleData.model,
                capacity: vehicleData.capacity
            }
        };

        console.log('Complete registration data:', completeData);

        const submitBtn = vehicleForm.querySelector('.btn-next');
        const originalText = submitBtn.innerHTML;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        try {
            await registerDriver(completeData, vehicleData.vehiclePhoto, vehicleData.soatPhoto);

            // Actualizar datos de sesión
            sessionStorage.setItem('userEmail', registrationData.email);
            sessionStorage.setItem('isLoggedIn', 'true');
            
            // El rol ya fue actualizado en registerDriver, usar el que está en localStorage
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole') || 'conductor';
            sessionStorage.setItem('userRole', userRole);

            localStorage.removeItem('registrationData');

            // Redirigir al dashboard de conductor en React
            setTimeout(() => {
                window.location.href = 'dashboard.html#/dashboard/driver';
            }, 500);

        } catch (error) {
            showError(error.message || 'Registration failed. Please try again.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    function validateVehicleForm(data) {
        if (!data.licensePlate || data.licensePlate.length < 5) {
            showError('Please enter a valid license plate');
            return false;
        }
        if (!data.make) {
            showError('Please select a vehicle make');
            return false;
        }
        if (!data.model) {
            showError('Please select a vehicle model');
            return false;
        }
        return true;
    }

    // 🔹 AJUSTADO SOLO AQUÍ 🔹
    async function registerDriver(data, vehiclePhoto, soatPhoto) {
        const formData = new FormData();
        formData.append('placa', data.vehicle.licensePlate);
        formData.append('marca', data.vehicle.make);
        formData.append('modelo', data.vehicle.model);
        formData.append('capacidad', data.vehicle.capacity);
        if (vehiclePhoto) formData.append('fotoVehiculo', vehiclePhoto);
        if (soatPhoto) formData.append('fotoSOAT', soatPhoto);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Usuario no autenticado');

            const response = await fetch('https://wheels-final-project.onrender.com/api/vehicles', {
                    method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });


            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Error al registrar vehículo');

            console.log('✅ Vehículo registrado exitosamente:', result);

            // Obtener el usuario actualizado del backend para actualizar conductorRegistrado
            try {
                const userResponse = await fetch('https://wheels-final-project.onrender.com/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    if (userData.success && userData.data.user) {
                        const updatedUser = userData.data.user;

                        // Actualizar el objeto user completo en localStorage
                        localStorage.setItem('user', JSON.stringify(updatedUser));

                        // Actualizar también los campos individuales
                        localStorage.setItem('userRole', updatedUser.rol);
                        sessionStorage.setItem('userRole', updatedUser.rol);

                        console.log('✅ Usuario actualizado:', {
                            rol: updatedUser.rol,
                            conductorRegistrado: updatedUser.conductorRegistrado
                        });
                    }
                }
            } catch (err) {
                console.warn('No se pudo actualizar el usuario:', err);

                // Si falla, actualizar manualmente el objeto user en localStorage
                const userString = localStorage.getItem('user');
                if (userString) {
                    const user = JSON.parse(userString);
                    user.conductorRegistrado = true;
                    localStorage.setItem('user', JSON.stringify(user));
                }
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error al registrar vehículo:', error);
            throw error;
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            hideError();
        }, 5000);
    }

    function hideError() {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }

    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
        input.addEventListener('input', hideError);
        input.addEventListener('change', hideError);
    });

    console.log('Vehicle registration page loaded');
    console.log('User data from step 1:', localStorage.getItem('registrationData'));
});