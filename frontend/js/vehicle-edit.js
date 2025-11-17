// vehicle-edit.js - Manejo del formulario de edición de vehículo

// ========================================
// ELEMENTOS DEL DOM
// ========================================
const editVehicleForm = document.getElementById('editVehicleForm');
const makeInput = document.getElementById('make');
const modelInput = document.getElementById('model');
const licensePlateInput = document.getElementById('licensePlate');
const capacityInput = document.getElementById('capacity');
const soatInput = document.getElementById('soat');

// File inputs
const vehiclePhotoInput = document.getElementById('vehiclePhoto');
const soatPhotoInput = document.getElementById('soatPhoto');
const vehiclePhotoName = document.getElementById('vehiclePhotoName');
const soatPhotoName = document.getElementById('soatPhotoName');

// Botones de capacidad
const capacityButtons = document.querySelectorAll('.capacity-btn-edit');

// Botones de SOAT
const soatYesBtn = document.getElementById('soatYesBtn');
const soatNoBtn = document.getElementById('soatNoBtn');

// Mensajes
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// ========================================
// CARGAR DATOS EXISTENTES
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    loadVehicleData();
});

function loadVehicleData() {
    // Obtener datos del localStorage
    const vehicleData = JSON.parse(localStorage.getItem('vehicleData'));
    
    if (vehicleData) {
        // Llenar los campos con los datos existentes
        makeInput.value = vehicleData.make || '';
        modelInput.value = vehicleData.model || '';
        licensePlateInput.value = vehicleData.licensePlate || '';
        
        // Seleccionar la capacidad
        if (vehicleData.capacity) {
            capacityInput.value = vehicleData.capacity;
            capacityButtons.forEach(btn => {
                if (btn.dataset.capacity === vehicleData.capacity) {
                    btn.classList.add('active');
                }
            });
        }
        
        // Seleccionar SOAT
        if (vehicleData.soat) {
            soatInput.value = vehicleData.soat;
            if (vehicleData.soat === 'yes') {
                soatYesBtn.classList.add('active');
                soatNoBtn.classList.remove('active');
            } else {
                soatNoBtn.classList.add('active');
                soatYesBtn.classList.remove('active');
            }
        }
        
        // Mostrar nombres de archivos si existen
        if (vehicleData.vehiclePhotoName) {
            vehiclePhotoName.textContent = vehicleData.vehiclePhotoName;
            vehiclePhotoName.classList.add('has-file');
        }
        
        if (vehicleData.soatPhotoName) {
            soatPhotoName.textContent = vehicleData.soatPhotoName;
            soatPhotoName.classList.add('has-file');
        }
    }
}

// ========================================
// MANEJO DE BOTONES DE CAPACIDAD
// ========================================
capacityButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remover clase active de todos los botones
        capacityButtons.forEach(btn => btn.classList.remove('active'));
        
        // Agregar clase active al botón clickeado
        button.classList.add('active');
        
        // Actualizar el input hidden
        capacityInput.value = button.dataset.capacity;
    });
});

// ========================================
// MANEJO DE BOTONES DE SOAT
// ========================================
soatYesBtn.addEventListener('click', () => {
    soatYesBtn.classList.add('active');
    soatNoBtn.classList.remove('active');
    soatInput.value = 'yes';
});

soatNoBtn.addEventListener('click', () => {
    soatNoBtn.classList.add('active');
    soatYesBtn.classList.remove('active');
    soatInput.value = 'no';
});

// ========================================
// MANEJO DE FILE INPUTS
// ========================================
vehiclePhotoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        vehiclePhotoName.textContent = file.name;
        vehiclePhotoName.classList.add('has-file');
    } else {
        vehiclePhotoName.textContent = 'No file chosen';
        vehiclePhotoName.classList.remove('has-file');
    }
});

soatPhotoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        soatPhotoName.textContent = file.name;
        soatPhotoName.classList.add('has-file');
    } else {
        soatPhotoName.textContent = 'No file chosen';
        soatPhotoName.classList.remove('has-file');
    }
});

// Hacer clickeable los elementos file-name
vehiclePhotoName.addEventListener('click', () => {
    vehiclePhotoInput.click();
});

soatPhotoName.addEventListener('click', () => {
    soatPhotoInput.click();
});

// ========================================
// VALIDACIÓN DEL FORMULARIO
// ========================================
function validateForm() {
    const errors = [];
    
    // Validar marca
    if (!makeInput.value.trim()) {
        errors.push('Vehicle make is required');
    }
    
    // Validar modelo
    if (!modelInput.value.trim()) {
        errors.push('Vehicle model is required');
    }
    
    // Validar placa
    if (!licensePlateInput.value.trim()) {
        errors.push('License plate number is required');
    }
    
    // Validar capacidad
    if (!capacityInput.value) {
        errors.push('Please select vehicle capacity');
    }
    
    return errors;
}

// ========================================
// MANEJO DEL SUBMIT DEL FORMULARIO
// ========================================
editVehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Limpiar mensajes previos
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    
    // Validar formulario
    const errors = validateForm();
    
    if (errors.length > 0) {
        errorMessage.textContent = errors.join('. ');
        errorMessage.style.display = 'block';
        return;
    }
    
    // Recopilar datos del formulario
    const vehicleData = {
        make: makeInput.value.trim(),
        model: modelInput.value.trim(),
        licensePlate: licensePlateInput.value.trim(),
        capacity: capacityInput.value,
        soat: soatInput.value,
        vehiclePhotoName: vehiclePhotoInput.files[0]?.name || vehiclePhotoName.textContent,
        soatPhotoName: soatPhotoInput.files[0]?.name || soatPhotoName.textContent,
        lastUpdated: new Date().toISOString()
    };
    
    // Guardar en localStorage
    try {
        localStorage.setItem('vehicleData', JSON.stringify(vehicleData));
        
        // Mostrar mensaje de éxito
        successMessage.style.display = 'block';
        
        // Esperar 1.5 segundos y redirigir a vehicle-info
        setTimeout(() => {
            window.location.href = 'vehicle-info.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error saving vehicle data:', error);
        errorMessage.textContent = 'Error saving vehicle information. Please try again.';
        errorMessage.style.display = 'block';
    }
});

// ========================================
// MANEJO DE NAVEGACIÓN DEL SIDEBAR
// ========================================
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', function() {
        const text = this.textContent.trim();
        
        switch(text) {
            case 'Home':
                window.location.href = '../index.html';
                break;
            case 'Personal Info':
                window.location.href = 'profile-view.html';
                break;
            case 'Vehicle Info':
                window.location.href = 'vehicle-info.html';
                break;
            case 'Edit Vehicle Info':
                // Ya estamos aquí
                break;
        }
    });
});