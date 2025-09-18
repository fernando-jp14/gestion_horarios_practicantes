// Referencias a los formularios
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Botones de cambio
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

// Mostrar registro
showRegister.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.remove("active");
  registerForm.classList.add("active");
});

// Mostrar login
showLogin.addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.classList.remove("active");
  loginForm.classList.add("active");
});

// ====== LOGIN ======
const loginFormElement = loginForm.querySelector("form");

loginFormElement.addEventListener("submit", (e) => {
  e.preventDefault();

  // Podrías validar datos aquí antes de redirigir
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;

  if (email.trim() !== "" && pass.trim() !== "") {
    // Redirigir a dashboard.html
    window.location.href = "dashboard.html";
  } else {
    alert("Por favor, completa todos los campos.");
  }
});