// register.js

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const errorMessage = document.getElementById("errorMessage");
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleRegister();
  });

  async function handleRegister() {
    const formData = {
        nombre: document.getElementById("firstName").value.trim(),
        apellido: document.getElementById("lastName").value.trim(),
        idUniversidad: document.getElementById("universityId").value.trim(),
        correo: document.getElementById("email").value.trim(),
        telefono: document.getElementById("phone").value.trim(),
        password: document.getElementById("password").value.trim(), // ✅ cambia a "password"
        rol: "pasajero",
    };


    hideError();

    if (!validateForm(formData)) return;

    const submitBtn = registerForm.querySelector(".btn-next");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Processing...";
    submitBtn.disabled = true;

    try {
      // 🔥 Enviar datos reales al backend
      const res = await fetch("https://wheels-final-project.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Respuesta del backend:", data);

      if (!data.success) {
        showError(data.message || "Error en el registro");
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }

      // ✅ Guarda el token y los datos del usuario real
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.setItem("userRole", data.data.user.rol); // 👈 Guardamos rol real
        localStorage.setItem("userEmail", data.data.user.correo);
        window.location.href = "../pages/shared/profile-view.html";
    
      } catch (err) {
      console.error(err);
      showError("Error al conectar con el servidor");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  // ✅ Validaciones de formulario
  function validateForm(data) {
    if (
      !data.nombre ||
      !data.apellido ||
      !data.idUniversidad ||
      !data.correo ||
      !data.telefono ||
      !data.password
    ) {
      showError("Please fill in all fields");
      return false;
    }

    if (!isValidEmail(data.correo)) {
      showError("Please enter a valid email");
      return false;
    }

    if (!/^\d+$/.test(data.idUniversidad)) {
      showError("University ID must contain only numbers");
      return false;
    }

    if (data.telefono.length < 10) {
      showError("Phone number must have 10 digits");
      return false;
    }

    if (data.password.length < 6) {
      showError("Password must be at least 6 characters");
      return false;
    }

    return true;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }

  function hideError() {
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
  }

  console.log("Register page loaded");
});