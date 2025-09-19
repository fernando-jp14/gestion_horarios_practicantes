const API_BASE = "http://127.0.0.1:8000";

// Verificar si está logueado
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/";
}

// Elementos del DOM
const profileDropdown = document.getElementById("profileDropdown");
const userDropdownToggle = document.getElementById("welcomeUser");

// Cargar perfil al iniciar
async function loadProfile() {
  const profileContent = document.getElementById("profileContent");
  const welcomeUser = document.getElementById("welcomeUser");

  try {
    const response = await fetch(`${API_BASE}/profile/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const user = data.user;

      // Actualizar bienvenida
      welcomeUser.textContent = `${user.username} • Admin`;

      // Mostrar información del perfil
      profileContent.innerHTML = `
        <div class="profile-info">
          <div class="info-item">
            <span class="info-label">ID de Usuario:</span>
            <span class="info-value">${user.id}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Nombre de Usuario:</span>
            <span class="info-value">${user.username}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">${user.email || "No especificado"}</span>
          </div>
        </div>
      `;
    } else if (response.status === 401) {
      // Token inválido, redirigir al login
      localStorage.clear();
      window.location.href = "/";
    } else {
      throw new Error("Error al cargar perfil");
    }
  } catch (error) {
    profileContent.innerHTML = `
      <div class="error">
        Error al cargar la información del perfil
      </div>
    `;
  }
}

// Función de logout
async function logout() {
  try {
    await fetch(`${API_BASE}/logout/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("Error al hacer logout en el servidor");
  } finally {
    // Limpiar localStorage y redirigir
    localStorage.clear();
    window.location.href = "/";
  }
}

// Alternar la visualización del menú desplegable
function toggleProfileDropdown() {
  profileDropdown.classList.toggle("active");
}

// Cerrar el menú desplegable al hacer clic fuera de él
document.addEventListener("click", function(event) {
  const isClickInsideDropdown = profileDropdown.contains(event.target);
  const isClickOnToggle = userDropdownToggle.contains(event.target);
  
  if (!isClickInsideDropdown && !isClickOnToggle && profileDropdown.classList.contains("active")) {
    profileDropdown.classList.remove("active");
  }
});

// Event listeners
document.getElementById("logoutBtn").addEventListener("click", logout);
userDropdownToggle.addEventListener("click", toggleProfileDropdown);


// --- Lógica para exportar Excel de horarios de recuperación ---
// Busca el botón y agrega el event listener para descargar el Excel autenticado
document.addEventListener('DOMContentLoaded', function() {
  const exportBtn = document.getElementById('exportarExcelBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      // Recupera el token de autenticación desde localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No hay token de autenticación. Inicia sesión primero.');
        return;
      }
      // Realiza la petición fetch al endpoint protegido
      fetch(`${API_BASE}/api/horarios-recuperacion/exportar-excel/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      .then(response => {
        // Si la respuesta no es exitosa, lanza error
        if (!response.ok) throw new Error('Error al descargar el archivo');
        return response.blob();
      })
      .then(blob => {
        // Crea un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'horarios_recuperacion.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        // Muestra el error en un alert
        alert(error);
      });
    });
  }
});

// Cargar perfil al iniciar
loadProfile();