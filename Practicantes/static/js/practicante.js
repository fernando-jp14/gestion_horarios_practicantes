const API_BASE = "http://127.0.0.1:8000";
let practicantes = [];

// Elementos del DOM
const modal = document.getElementById("practicanteModal");
const form = document.getElementById("practicanteForm");
const tableBody = document.getElementById("practicantesTableBody");
const addBtn = document.getElementById("addPracticanteBtn");
const cancelBtn = document.getElementById("cancelBtn");
const closeBtn = document.querySelector(".close");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const searchInput = document.getElementById("searchInput");

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", function() {
  loadPracticantes();
  setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
  addBtn.addEventListener("click", () => openModal());
  cancelBtn.addEventListener("click", () => closeModal());
  closeBtn.addEventListener("click", () => closeModal());
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    savePracticante();
  });
  
  searchInput.addEventListener("input", function() {
    filterPracticantes(this.value);
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

// Cargar todos los practicantes (incluye el token en el header Authorization)
async function loadPracticantes() {
  showLoading();
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/practicantes/`, {
      headers: {
        // Si tienes un token, lo agregas al header Authorization
        ...(token ? { "Authorization": "Token " + token } : {})
      }
    });
    if (response.ok) {
      practicantes = await response.json();
      renderPracticantes(practicantes);
      hideMessages();
    } else {
      throw new Error("Error al cargar los practicantes");
    }
  } catch (error) {
    showError("No se pudieron cargar los practicantes: " + error.message);
  }
}

// Renderizar practicantes en la tabla
function renderPracticantes(data) {
  tableBody.innerHTML = "";
  
  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; color: #a0aec0;">
          No se encontraron practicantes
        </td>
      </tr>
    `;
    return;
  }
  
  data.forEach(practicante => {
    const row = document.createElement("tr");
    
    row.innerHTML = `
      <td>${practicante.id}</td>
      <td>${practicante.nombre}</td>
      <td>${practicante.apellido}</td>
      <td>${practicante.semestre}</td>
      <td>${practicante.sexo === 'M' ? 'Masculino' : 'Femenino'}</td>
      <td><span class="status-badge status-${practicante.estado}">${practicante.estado}</span></td>
      <td>${practicante.name_especialidad || 'Especialidad ' + practicante.especialidad}</td>
      <td>${practicante.equipo || 'Ninguno'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="editPracticante(${practicante.id})">Editar</button>
          <button class="btn-delete" onclick="deletePracticante(${practicante.id})">Eliminar</button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Filtrar practicantes
function filterPracticantes(searchTerm) {
  if (!searchTerm) {
    renderPracticantes(practicantes);
    return;
  }
  
  const filtered = practicantes.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name_especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  renderPracticantes(filtered);
}

// Abrir modal para añadir/editar
function openModal(practicante = null) {
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("practicanteForm");
  
  if (practicante) {
    modalTitle.textContent = "Editar Practicante";
    document.getElementById("practicanteId").value = practicante.id;
    document.getElementById("nombre").value = practicante.nombre;
    document.getElementById("apellido").value = practicante.apellido;
    document.getElementById("semestre").value = practicante.semestre;
    document.getElementById("sexo").value = practicante.sexo;
    document.getElementById("estado").value = practicante.estado;
    document.getElementById("especialidad").value = practicante.especialidad;
  } else {
    modalTitle.textContent = "Añadir Practicante";
    form.reset();
    document.getElementById("practicanteId").value = "";
  }
  
  modal.style.display = "block";
}

// Cerrar modal
function closeModal() {
  modal.style.display = "none";
  form.reset();
}

// Guardar practicante (crear o actualizar)
// Incluye el token en el header Authorization
async function savePracticante() {
  const id = document.getElementById("practicanteId").value;
  const practicanteData = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    semestre: document.getElementById("semestre").value,
    sexo: document.getElementById("sexo").value,
    estado: document.getElementById("estado").value,
    especialidad: document.getElementById("especialidad").value,
    equipo: null
  };
  try {
    const token = getAuthToken();
    let response;
    const headers = {
      'Content-Type': 'application/json',
      // Agrega el token si existe
      ...(token ? { "Authorization": "Token " + token } : {})
    };
    if (id) {
      // Actualizar practicante existente
      response = await fetch(`${API_BASE}/api/practicantes/${id}/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(practicanteData)
      });
    } else {
      // Crear nuevo practicante
      response = await fetch(`${API_BASE}/api/practicantes/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(practicanteData)
      });
    }
    if (response.ok) {
      closeModal();
      loadPracticantes(); // Recargar la lista
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al guardar el practicante");
    }
  } catch (error) {
    showError("Error: " + error.message);
  }
}

// Editar practicante
// Incluye el token en el header Authorization
async function editPracticante(id) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/practicantes/${id}/`, {
      headers: {
        ...(token ? { "Authorization": "Token " + token } : {})
      }
    });
    if (response.ok) {
      const practicante = await response.json();
      openModal(practicante);
    } else {
      throw new Error("No se pudo cargar el practicante para editar");
    }
  } catch (error) {
    showError("Error: " + error.message);
  }
}

// Eliminar practicante
// Incluye el token en el header Authorization
async function deletePracticante(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este practicante?")) {
    return;
  }
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/practicantes/${id}/`, {
      method: 'DELETE',
      headers: {
        ...(token ? { "Authorization": "Token " + token } : {})
      }
    });
    if (response.ok) {
      loadPracticantes(); // Recargar la lista
    } else {
      throw new Error("No se pudo eliminar el practicante");
    }
  } catch (error) {
    showError("Error: " + error.message);
  }
}

// Mostrar mensaje de carga
function showLoading() {
  loadingMessage.style.display = "block";
  errorMessage.style.display = "none";
  tableBody.innerHTML = "";
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