const API_BASE = "http://127.0.0.1:8000/register/";

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const messageDiv = document.getElementById("message");

    try {
      const response = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        messageDiv.className = "success";
        messageDiv.textContent = "¡Registro exitoso! Redirigiendo...";

        // Redirigir después de 2 segundos al login
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        messageDiv.className = "error";
        messageDiv.textContent = data.username?.[0] || "Error en el registro";
      }
    } catch (error) {
      messageDiv.className = "error";
      messageDiv.textContent = "Error de conexión";
    }
  });

// Verificar si ya está logueado
if (localStorage.getItem("token")) {
  window.location.href = "http://127.0.0.1:8000/api/horarios_template/";
}
