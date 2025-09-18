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