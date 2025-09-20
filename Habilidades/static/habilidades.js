const API_BASE = "http://127.0.0.1:8000";
let nivelesHabilidad = [];
let practicantesConHabilidades = [];

// Elementos del DOM
const modal = document.getElementById("habilidadModal");
const form = document.getElementById("habilidadForm");
const addBtn = document.getElementById("addHabilidadBtn");
const cancelBtn = document.getElementById("cancelBtn");
const closeBtn = document.querySelector(".close");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const practicantesView = document.getElementById("practicantesView");
const habilidadesView = document.getElementById("habilidadesView");
const toggleButtons = document.querySelectorAll(".toggle-btn");
const practicantesContainer = document.querySelector(".practicantes-container");
const habilidadesTableBody = document.getElementById("habilidadesTableBody");
const practicanteSelect = document.getElementById("practicante");

// --- Inicializar la aplicación y lógica de perfil ---
document.addEventListener("DOMContentLoaded", function() {
  loadData();
  setupEventListeners();
  // Lógica de perfil de usuario (igual que dashboard.js)
  setupProfileMenu();
  loadProfile();
});

// --- Lógica de menú desplegable de perfil y logout (igual que dashboard.js) ---
function setupProfileMenu() {
  const profileDropdown = document.getElementById("profileDropdown");
  const userDropdownToggle = document.getElementById("welcomeUser");
  const logoutBtn = document.getElementById("logoutBtn");

  // Alternar la visualización del menú desplegable
  if (userDropdownToggle && profileDropdown) {
    userDropdownToggle.addEventListener("click", function() {
      profileDropdown.classList.toggle("active");
    });
  }

  // Cerrar el menú desplegable al hacer clic fuera de él
  document.addEventListener("click", function(event) {
    if (!profileDropdown || !userDropdownToggle) return;
    const isClickInsideDropdown = profileDropdown.contains(event.target);
    const isClickOnToggle = userDropdownToggle.contains(event.target);
    if (!isClickInsideDropdown && !isClickOnToggle && profileDropdown.classList.contains("active")) {
      profileDropdown.classList.remove("active");
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

// Función de logout igual que dashboard.js
async function logout() {
  try {
    await fetch(`${API_BASE}/logout/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${getAuthToken()}`,
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

// Configurar event listeners
function setupEventListeners() {
  addBtn.addEventListener("click", () => openModal());
  cancelBtn.addEventListener("click", () => closeModal());
  closeBtn.addEventListener("click", () => closeModal());
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    saveHabilidad();
  });
  
  // Cambiar vista
  toggleButtons.forEach(button => {
    button.addEventListener("click", function() {
      toggleButtons.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      
      const view = this.getAttribute("data-view");
      document.querySelectorAll(".view-content").forEach(v => v.classList.remove("active"));
      document.getElementById(`${view}View`).classList.add("active");
      
      if (view === "habilidades") {
        renderHabilidadesTable();
      }
    });
  });
  
  // Cerrar modal al hacer clic fuera
  window.addEventListener("click", function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
}


// Función auxiliar para obtener el token guardado en localStorage
function getAuthToken() {
  // Recupera el token guardado tras el login
  return localStorage.getItem("token");
}

// Cargar todos los datos
async function loadData() {
  showLoading();
  try {
    await Promise.all([
      loadNivelesHabilidad(),
      loadPracticantesConHabilidades(),
      loadPracticantes()
    ]);
    hideMessages();
    renderPracticantesView();
  } catch (error) {
    showError("No se pudieron cargar los datos: " + error.message);
  }
}

// Cargar niveles de habilidad (incluye el token en el header Authorization)
async function loadNivelesHabilidad() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/niveles-habilidad/`, {
    headers: {
      ...(token ? { "Authorization": "Token " + token } : {})
    }
  });
  if (response.ok) {
    nivelesHabilidad = await response.json();
  } else {
    throw new Error("Error al cargar los niveles de habilidad");
  }
}

// Cargar practicantes con habilidades (incluye el token en el header Authorization)
async function loadPracticantesConHabilidades() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/practicantes_puntaje/`, {
    headers: {
      ...(token ? { "Authorization": "Token " + token } : {})
    }
  });
  if (response.ok) {
    practicantesConHabilidades = await response.json();
  } else {
    throw new Error("Error al cargar los practicantes con habilidades");
  }
}

// Cargar practicantes para el select (incluye el token en el header Authorization)
async function loadPracticantes() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/practicantes/`, {
    headers: {
      ...(token ? { "Authorization": "Token " + token } : {})
    }
  });
  if (response.ok) {
    const practicantes = await response.json();
    // Limpiar y llenar el select
    practicanteSelect.innerHTML = '<option value="">Seleccionar practicante</option>';
    practicantes.forEach(p => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = `${p.nombre} ${p.apellido}`;
      practicanteSelect.appendChild(option);
    });
  } else {
    throw new Error("Error al cargar los practicantes");
  }
}

// Renderizar vista por practicantes
function renderPracticantesView() {
  practicantesContainer.innerHTML = "";
  
  if (practicantesConHabilidades.length === 0) {
    practicantesContainer.innerHTML = `
      <div class="no-skills">No se encontraron practicantes con habilidades</div>
    `;
    return;
  }
  
  practicantesConHabilidades.forEach(practicante => {
    const card = document.createElement("div");
    card.className = "practicante-card";
    
    card.innerHTML = `
      <div class="practicante-header">
        <div class="practicante-name">${practicante.nombre}</div>
      </div>
      <div class="practicante-skills">
        ${renderSkillsList(practicante.niveles_habilidad)}
      </div>
    `;
    
    practicantesContainer.appendChild(card);
  });
}

// Renderizar lista de habilidades
function renderSkillsList(habilidades) {
  if (habilidades.length === 0) {
    return `<div class="no-skills">No tiene habilidades registradas</div>`;
  }
  
  return habilidades.map(habilidad => {
    const scoreClass = getScoreClass(habilidad.puntaje);
    return `
      <div class="skill-item">
        <div class="skill-name">${habilidad.nombre_habilidad}</div>
        <div class="skill-score">
          <span class="score-value">${habilidad.puntaje}/10</span>
          <span class="score-badge ${scoreClass}">${getScoreText(habilidad.puntaje)}</span>
        </div>
      </div>
    `;
  }).join("");
}

// Renderizar tabla de habilidades
function renderHabilidadesTable() {
  habilidadesTableBody.innerHTML = "";
  
  if (nivelesHabilidad.length === 0) {
    habilidadesTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #a0aec0;">
          No se encontraron habilidades registradas
        </td>
      </tr>
    `;
    return;
  }
  
  nivelesHabilidad.forEach(habilidad => {
    const row = document.createElement("tr");
    
    row.innerHTML = `
      <td>${habilidad.id}</td>
      <td>${habilidad.nombre_practicante}</td>
      <td>${habilidad.nombre_habilidad}</td>
      <td>
        <span class="score-value">${habilidad.puntaje}/10</span>
        <span class="score-badge ${getScoreClass(habilidad.puntaje)}">
          ${getScoreText(habilidad.puntaje)}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="editHabilidad(${habilidad.id})">Editar</button>
          <button class="btn-delete" onclick="deleteHabilidad(${habilidad.id})">Eliminar</button>
        </div>
      </td>
    `;
    
    habilidadesTableBody.appendChild(row);
  });
}

// Obtener clase CSS según el puntaje
function getScoreClass(puntaje) {
  if (puntaje >= 8) return "score-high";
  if (puntaje >= 5) return "score-medium";
  return "score-low";
}

// Obtener texto según el puntaje
function getScoreText(puntaje) {
  if (puntaje >= 8) return "Alto";
  if (puntaje >= 5) return "Medio";
  return "Bajo";
}

// Abrir modal para añadir/editar
function openModal(habilidad = null) {
  const modalTitle = document.getElementById("modalTitle");
  
  if (habilidad) {
    modalTitle.textContent = "Editar Habilidad";
    document.getElementById("habilidadId").value = habilidad.id;
    document.getElementById("practicante").value = habilidad.id_practicante;
    document.getElementById("habilidad").value = getHabilidadIdByName(habilidad.nombre_habilidad);
    document.getElementById("puntaje").value = habilidad.puntaje;
  } else {
    modalTitle.textContent = "Añadir Habilidad";
    form.reset();
    document.getElementById("habilidadId").value = "";
  }
  
  modal.style.display = "block";
}

// Cerrar modal
function closeModal() {
  modal.style.display = "none";
  form.reset();
}

// Obtener ID de habilidad por nombre (simulado)
function getHabilidadIdByName(nombre) {
  const habilidadesMap = {
    "JavaScript": 1,
    "React": 2,
    "Figma": 3,
    "Python": 4,
    "Django": 5,
    "Docker": 6,
    "MySQL": 7,
    "PHP": 8,
    "Laravel": 9,
  };
  
  return habilidadesMap[nombre] || "";
}

// Guardar habilidad (crear o actualizar) con token de autenticación
async function saveHabilidad() {
  const id = document.getElementById("habilidadId").value;
  const habilidadData = {
    practicante: document.getElementById("practicante").value,
    habilidad: document.getElementById("habilidad").value,
    puntaje: document.getElementById("puntaje").value
  };
  try {
    const token = getAuthToken();
    let response;
    let url;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { "Authorization": "Token " + token } : {})
    };
    if (id) {
      // Actualizar habilidad existente
      url = `${API_BASE}/api/niveles-habilidad/${id}/`;
      response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(habilidadData)
      });
    } else {
      // Crear nueva habilidad
      url = `${API_BASE}/api/niveles-habilidad/`;
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(habilidadData)
      });
    }
    if (response.ok) {
      closeModal();
      loadData(); // Recargar todos los datos
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al guardar la habilidad");
    }
  } catch (error) {
    showError("Error: " + error.message);
  }
}

// Editar habilidad (incluye el token en el header Authorization)
async function editHabilidad(id) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/niveles-habilidad/${id}/`, {
      headers: {
        ...(token ? { "Authorization": "Token " + token } : {})
      }
    });
    if (response.ok) {
      const habilidad = await response.json();
      openModal(habilidad);
    } else {
      throw new Error("No se pudo cargar la habilidad para editar");
    }
  } catch (error) {
    showError("Error: " + error.message);
  }
}

// Eliminar habilidad (incluye el token en el header Authorization)
async function deleteHabilidad(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar esta habilidad?")) {
    return;
  }
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/niveles-habilidad/${id}/`, {
      method: 'DELETE',
      headers: {
        ...(token ? { "Authorization": "Token " + token } : {})
      }
    });
    if (response.ok) {
      loadData(); // Recargar todos los datos
    } else {
      throw new Error("No se pudo eliminar la habilidad");
    }
  } catch (error) {
    showError("Error: " + error.message);
  }
}

// Mostrar mensaje de carga
function showLoading() {
  loadingMessage.style.display = "block";
  errorMessage.style.display = "none";
  practicantesContainer.innerHTML = "";
  habilidadesTableBody.innerHTML = "";
}

// Mostrar mensaje de error
function showError(message) {
  loadingMessage.style.display = "none";
  errorMessage.style.display = "block";
  errorMessage.textContent = message;
}

// Ocultar mensajes
function hideMessages() {
  loadingMessage.style.display = "none";
  errorMessage.style.display = "none";
}


// Cargar perfil al iniciar (igual que dashboard.js)
async function loadProfile() {
  const profileContent = document.getElementById("profileContent");
  const welcomeUser = document.getElementById("welcomeUser");
  try {
    const token = getAuthToken();
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
      if (welcomeUser) welcomeUser.textContent = `${user.username} • Admin`;
      // Mostrar información del perfil
      if (profileContent) {
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
      }
    } else if (response.status === 401) {
      // Token inválido, redirigir al login
      localStorage.clear();
      window.location.href = "/";
    } else {
      throw new Error("Error al cargar perfil");
    }
  } catch (error) {
    if (profileContent) {
      profileContent.innerHTML = `
        <div class="error">
          Error al cargar la información del perfil
        </div>
      `;
    }
  }
}