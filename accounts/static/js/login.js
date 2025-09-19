const API_BASE = "http://127.0.0.1:8000/login/";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorDiv = document.getElementById("error");

  try {
    const response = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirigir al dashboard
      window.location.href = "/dashboard/";
    } else {
      errorDiv.textContent = "Credenciales inválidas";
    }
  } catch (error) {
    errorDiv.textContent = "Error de conexión";
  }
});

// Verificar si ya está logueado
if (localStorage.getItem("token")) {
  window.location.href = "/dashboard/";
}
