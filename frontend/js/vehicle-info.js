// vehicle-info.js
document.addEventListener('DOMContentLoaded', () => {
    const okBtn = document.getElementById('okBtn');
    const editVehicleBtn = document.getElementById('editVehicleBtn');
    
    // Verificar autenticación
    checkAuthentication();
    
    // Cargar datos del vehículo
    loadVehicleInfo();
    
    // Event listeners
    okBtn.addEventListener('click', () => {
        // Volver a Personal Info
        window.location.href = 'profile-view.html';
    });
    
    editVehicleBtn.addEventListener('click', () => {
        // Ir a editar vehículo
        window.location.href = 'vehicle-edit.html';
    });
    
    // Verificar autenticación
    function checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const userRole = localStorage.getItem('selectedRole');
        
        if (!isLoggedIn) {
            window.location.href = 'login.html';
            return;
        }
        
        // Solo conductores pueden ver esta página
        if (userRole !== 'driver') {
            window.location.href = 'profile-view.html';
        }
    }
    
    // Cargar información del vehículo
    function loadVehicleInfo() {
        // PRIORIDAD 1: Intentar cargar desde vehicleData (datos actualizados desde vehicle-edit)
        let vehicleData = JSON.parse(localStorage.getItem('vehicleData'));
        
        // PRIORIDAD 2: Si no existe, intentar cargar desde registrationData (datos del registro inicial)
        if (!vehicleData) {
            const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');
            vehicleData = registrationData.vehicle || null;
        }
        
        // PRIORIDAD 3: Si tampoco existe, usar datos por defecto
        const vehicle = {
            make: vehicleData?.make || 'TOYOTA',
            model: vehicleData?.model || 'PRADO 2026',
            licensePlate: vehicleData?.licensePlate || 'ABC123',
            capacity: vehicleData?.capacity || '5',
            soat: vehicleData?.soat || 'yes'
        };
        
        // Rellenar información
        document.getElementById('make').textContent = vehicle.make.toUpperCase();
        document.getElementById('model').textContent = vehicle.model.toUpperCase();
        document.getElementById('licensePlate').textContent = vehicle.licensePlate.toUpperCase();
        document.getElementById('capacity').textContent = vehicle.capacity;
        
        // Mostrar estado del SOAT
        const soatYes = document.getElementById('soatYes');
        const soatNo = document.getElementById('soatNo');
        
        if (vehicle.soat === 'yes') {
            soatYes.classList.add('active');
            soatNo.classList.remove('active');
        } else {
            soatNo.classList.add('active');
            soatYes.classList.remove('active');
        }
        
        // Actualizar top bar con datos del usuario
        const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');
        if (registrationData.firstName) {
            document.getElementById('userName').textContent = registrationData.firstName;
            document.querySelector('.user-avatar').textContent = registrationData.firstName.charAt(0).toUpperCase();
        }
        
        // Log para debugging
        console.log('Vehicle info loaded:', vehicle);
        if (localStorage.getItem('vehicleData')) {
            console.log('✅ Loaded from vehicleData (updated data)');
        } else {
            console.log('ℹ️ Loaded from registrationData (initial data)');
        }
    }
    
    console.log('Vehicle info page loaded');
});