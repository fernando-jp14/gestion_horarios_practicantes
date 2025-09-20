const API_BASE = "http://127.0.0.1:8000";
let horarios = [];
let practicantes = [];

// Elementos del DOM
const modal = document.getElementById("horarioModal");
const form = document.getElementById("horarioForm");
const addBtn = document.getElementById("addHorarioBtn");
const cancelBtn = document.getElementById("cancelBtn");
const closeBtn = document.querySelector(".close");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const horariosContainer = document.getElementById("horariosContainer");
const practicanteSelect = document.getElementById("practicante");

// Mapeo de IDs de días a nombres
const diasSemana = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", function() {
  loadData();
  setupEventListeners();
});

// Obtener token de autenticación desde localStorage
function getAuthToken() {
  return localStorage.getItem("token");
}

// Configurar event listeners
function setupEventListeners() {
  addBtn.addEventListener("click", () => openModal());
  cancelBtn.addEventListener("click", () => closeModal());
  closeBtn.addEventListener("click", () => closeModal());
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    saveHorario();
  });
  
  // Cerrar modal al hacer clic fuera
  window.addEventListener("click", function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// Cargar todos los datos
async function loadData() {
  showLoading();
  try {
    await Promise.all([
      loadHorarios(),
      loadPracticantes()
    ]);
    hideMessages();
    renderHorarios();
  } catch (error) {
    showError("No se pudieron cargar los datos: " + error.message);
  }
}

// Cargar horarios (con token)
async function loadHorarios() {
  const token = getAuthToken();
  const headers = token ? { "Authorization": "Token " + token } : {};
  const response = await fetch(`${API_BASE}/api/horarios-recuperacion/`, { headers });
  if (response.ok) {
    horarios = await response.json();
  } else {
    throw new Error("Error al cargar los horarios");
  }
}

// Cargar practicantes para el select (con token)
async function loadPracticantes() {
  const token = getAuthToken();
  const headers = token ? { "Authorization": "Token " + token } : {};
  const response = await fetch(`${API_BASE}/api/practicantes/`, { headers });
  if (response.ok) {
    practicantes = await response.json();
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

// Renderizar horarios
function renderHorarios() {
  horariosContainer.innerHTML = "";
  
  if (horarios.length === 0) {
    horariosContainer.innerHTML = `
      <div class="no-horarios">No se encontraron horarios de recuperación</div>
    `;
    return;
  }
  
  horarios.forEach(horario => {
    const card = document.createElement("div");
    card.className = "horario-card";
    
    card.innerHTML = `
      <div class="horario-header">
        <div class="horario-title">${horario.nombre_practicante}</div>
        <div class="horario-actions">
          <button class="btn-edit" onclick="editHorario(${horario.id})">Editar</button>
          <button class="btn-delete" onclick="deleteHorario(${horario.id})">Eliminar</button>
        </div>
      </div>
      <div class="horario-content">
        <div class="dias-section">
          <div class="section-title falta">Días de Falta</div>
          <div class="dias-list">
            ${renderDiasList(horario.dias_falta_detalle, 'falta')}
          </div>
        </div>
        <div class="dias-section">
          <div class="section-title recuperacion">Días de Recuperación</div>
          <div class="dias-list">
            ${renderDiasList(horario.dias_recuperacion_detalle, 'recuperacion')}
          </div>
        </div>
      </div>
    `;
    
    horariosContainer.appendChild(card);
  });
}

// Renderizar lista de días
function renderDiasList(dias, tipo) {
  if (dias.length === 0) {
    return `<span style="color: #a0aec0; font-style: italic;">No hay días registrados</span>`;
  }
  
  return dias.map(dia => {
    const badgeClass = tipo === 'falta' ? 'badge-falta' : 'badge-recuperacion';
    return `<span class="dia-badge ${badgeClass}">${dia.nombre}</span>`;
  }).join("");
}

// Abrir modal para añadir/editar
function openModal(horario = null) {
  const modalTitle = document.getElementById("modalTitle");
  
  if (horario) {
    modalTitle.textContent = "Editar Horario de Recuperación";
    document.getElementById("horarioId").value = horario.id;
    document.getElementById("practicante").value = horario.id_practicante;
    
    // Seleccionar días de falta
    document.querySelectorAll('input[name="dias_falta"]').forEach(checkbox => {
      checkbox.checked = horario.dias_falta_detalle.some(dia => dia.id === parseInt(checkbox.value));
    });
    
    // Seleccionar días de recuperación
    document.querySelectorAll('input[name="dias_recuperacion"]').forEach(checkbox => {
      checkbox.checked = horario.dias_recuperacion_detalle.some(dia => dia.id === parseInt(checkbox.value));
    });
  } else {
    modalTitle.textContent = "Añadir Horario de Recuperación";
    form.reset();
    document.getElementById("horarioId").value = "";
  }
  
  modal.style.display = "block";
}

// Cerrar modal
function closeModal() {
  modal.style.display = "none";
  form.reset();
}

// Guardar horario (crear o actualizar) con token
async function saveHorario() {
  const id = document.getElementById("horarioId").value;
  // Obtener días de falta seleccionados
  const diasFalta = Array.from(document.querySelectorAll('input[name="dias_falta"]:checked'))
    .map(checkbox => parseInt(checkbox.value));
  // Obtener días de recuperación seleccionados
  const diasRecuperacion = Array.from(document.querySelectorAll('input[name="dias_recuperacion"]:checked'))
    .map(checkbox => parseInt(checkbox.value));
  const horarioData = {
    practicante: parseInt(document.getElementById("practicante").value),
    dias_falta: diasFalta,
    dias_recuperacion: diasRecuperacion
  };
  try {
    let response;
    let url;
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { "Authorization": "Token " + token } : {})
    };
    if (id) {
      // Actualizar horario existente
      url = `${API_BASE}/api/horarios-recuperacion/${id}/`;
      response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(horarioData)
      });
    } else {
      // Crear nuevo horario
      url = `${API_BASE}/api/horarios-recuperacion/`;
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(horarioData)
      });
    }
    if (response.ok) {
      closeModal();
      loadData(); // Recargar todos los datos
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al guardar el horario");
    }
  } catch (error) {
    showError("Error: " + error.message);
  }
}

// Editar horario (con token)
async function editHorario(id) {
  try {
    const token = getAuthToken();
    const headers = token ? { "Authorization": "Token " + token } : {};
    const response = await fetch(`${API_BASE}/api/horarios-recuperacion/${id}/`, { headers });
    if (response.ok) {
      const horario = await response.json();
      openModal(horario);
    } else {
      throw new Error("No se pudo cargar el horario para editar");
    }
  } catch (error) {
    showError("Error: " + error.message);
  }
}

// Eliminar horario (con token)
async function deleteHorario(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este horario?")) {
    return;
  }
  try {
    const token = getAuthToken();
    const headers = token ? { "Authorization": "Token " + token } : {};
    const response = await fetch(`${API_BASE}/api/horarios-recuperacion/${id}/`, {
      method: 'DELETE',
      headers
    });
    if (response.ok) {
      loadData(); // Recargar todos los datos
    } else {
      throw new Error("No se pudo eliminar el horario");
    }
  } catch (error) {
    showError("Error: " + error.message);
  }
}

// Mostrar mensaje de carga
function showLoading() {
  loadingMessage.style.display = "block";
  errorMessage.style.display = "none";
  horariosContainer.innerHTML = "";
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