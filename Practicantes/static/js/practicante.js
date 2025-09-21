// Configuración de la API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Estado global
const appState = {
    practicantes: [],
    practicantesOriginales: [],
    especialidades: [],
    equipos: [],
    editingPracticante: null,
    token: localStorage.getItem('token') || '',
    user: null
};

// Elementos del DOM
const elements = {
    loadingPracticantes: document.getElementById('loadingPracticantes'),
    tablaPracticantes: document.getElementById('tablaPracticantes'),
    tablaPracticantesBody: document.getElementById('tablaPracticantesBody'),
    noPracticantes: document.getElementById('noPracticantes'),
    notificaciones: document.getElementById('notificaciones'),
    
    // Filtros
    buscarPracticante: document.getElementById('buscarPracticante'),
    filtroSemestre: document.getElementById('filtroSemestre'),
    filtroEstado: document.getElementById('filtroEstado'),
    filtroEspecialidad: document.getElementById('filtroEspecialidad'),
    filtroEquipo: document.getElementById('filtroEquipo'),
    btnLimpiarFiltros: document.getElementById('btnLimpiarFiltros'),
    
    // Modal practicante
    modalPracticante: document.getElementById('modalPracticante'),
    modalTitle: document.getElementById('modalTitle'),
    formPracticante: document.getElementById('formPracticante'),
    nombre: document.getElementById('nombre'),
    apellido: document.getElementById('apellido'),
    semestre: document.getElementById('semestre'),
    sexo: document.getElementById('sexo'),
    estado: document.getElementById('estado'),
    especialidad: document.getElementById('especialidad'),
    
    // Modal confirmación
    modalConfirmar: document.getElementById('modalConfirmar'),
    practicanteEliminar: document.getElementById('practicanteEliminar'),
    
    // Botones
    btnNuevoPracticante: document.getElementById('btnNuevoPracticante'),
    btnGuardar: document.getElementById('btnGuardar'),
    btnCancelar: document.getElementById('btnCancelar'),
    btnConfirmarEliminar: document.getElementById('btnConfirmarEliminar'),
    btnCancelarEliminar: document.getElementById('btnCancelarEliminar')
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventListeners();
    cargarPerfilUsuario();
    cargarDatos();
});

function inicializarEventListeners() {
    // Usuario
    const userBtn = document.getElementById('userBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    userBtn.addEventListener('click', () => {
        userDropdown.classList.toggle('show');
    });
    
    logoutBtn.addEventListener('click', cerrarSesion);
    
    document.addEventListener('click', (e) => {
        if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });
    
    // Botones principales
    elements.btnNuevoPracticante.addEventListener('click', abrirModalNuevoPracticante);
    
    // Filtros
    elements.buscarPracticante.addEventListener('input', aplicarFiltros);
    elements.filtroSemestre.addEventListener('change', aplicarFiltros);
    elements.filtroEstado.addEventListener('change', aplicarFiltros);
    elements.filtroEspecialidad.addEventListener('change', aplicarFiltros);
    elements.filtroEquipo.addEventListener('change', aplicarFiltros);
    elements.btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
    
    // Modal practicante
    elements.formPracticante.addEventListener('submit', guardarPracticante);
    elements.btnCancelar.addEventListener('click', cerrarModalPracticante);
    
    // Modal confirmación
    elements.btnConfirmarEliminar.addEventListener('click', confirmarEliminarPracticante);
    elements.btnCancelarEliminar.addEventListener('click', cerrarModalConfirmar);
    
    // Cerrar modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Funciones de API
async function makeAPIRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${appState.token}`
        }
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    // Si el endpoint es /profile/ o /logout/, no usar API_BASE_URL
    let url;
    if (endpoint === '/profile/' || endpoint === '/logout/') {
        url = `http://127.0.0.1:8000${endpoint}`;
    } else {
        url = `${API_BASE_URL}${endpoint}`;
    }

    try {
        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return await response.text();
    } catch (error) {
        console.error('Error en API request:', error);
        throw error;
    }
}

// Funciones de usuario
async function cargarPerfilUsuario() {
    try {
        const profile = await makeAPIRequest('/profile/');
        appState.user = profile.user;
        
        document.getElementById('userName').textContent = profile.user.username;
        document.getElementById('userDisplayName').textContent = profile.user.username;
        document.getElementById('userEmail').textContent = profile.user.email;
    } catch (error) {
        console.error('Error cargando perfil:', error);
        document.getElementById('userName').textContent = 'Error';
    }
}

async function cerrarSesion() {
    try {
        await makeAPIRequest('/logout/', { method: 'POST' });
    } catch (error) {
        console.error('Error cerrando sesión:', error);
    } finally {
        localStorage.removeItem('token');
        window.location.href = 'http://127.0.0.1:8000/';
    }
}

// Funciones de datos
async function cargarPracticantes() {
    try {
        elements.loadingPracticantes.style.display = 'flex';
        elements.tablaPracticantes.style.display = 'none';
        elements.noPracticantes.style.display = 'none';
        
        const practicantes = await makeAPIRequest('/practicantes/');
        appState.practicantes = practicantes;
        appState.practicantesOriginales = [...practicantes];
        
        renderizarTabla();
        
    } catch (error) {
        mostrarNotificacion('Error al cargar los practicantes: ' + error.message, 'error');
        console.error('Error cargando practicantes:', error);
    } finally {
        elements.loadingPracticantes.style.display = 'none';
    }
}

async function cargarEspecialidades() {
    try {
        const especialidades = await makeAPIRequest('/especialidades/');
        appState.especialidades = especialidades;
        
        // Llenar select de especialidades en filtro
        elements.filtroEspecialidad.innerHTML = '<option value="">Todas</option>';
        especialidades.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.id;
            option.textContent = esp.nombre;
            elements.filtroEspecialidad.appendChild(option);
        });
        
        // Llenar select de especialidades en modal
        elements.especialidad.innerHTML = '<option value="">Seleccionar</option>';
        especialidades.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.id;
            option.textContent = esp.nombre;
            elements.especialidad.appendChild(option);
        });
        
    } catch (error) {
        mostrarNotificacion('Error al cargar especialidades: ' + error.message, 'error');
        console.error('Error cargando especialidades:', error);
    }
}

async function cargarEquipos() {
    try {
        const equipos = await makeAPIRequest('/equipos/');
        appState.equipos = equipos;
        
        // Llenar select de equipos en filtro
        elements.filtroEquipo.innerHTML = '<option value="">Todos</option><option value="sin_equipo">Sin equipo</option>';
        equipos.forEach(eq => {
            const option = document.createElement('option');
            option.value = eq.id;
            option.textContent = eq.nombre;
            elements.filtroEquipo.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error cargando equipos:', error);
    }
}

async function cargarDatos() {
    await Promise.all([cargarPracticantes(), cargarEspecialidades(), cargarEquipos()]);
}

// Funciones de renderizado
function renderizarTabla() {
    const tbody = elements.tablaPracticantesBody;
    
    if (appState.practicantes.length === 0) {
        elements.tablaPracticantes.style.display = 'none';
        elements.noPracticantes.style.display = 'block';
        return;
    }
    
    elements.tablaPracticantes.style.display = 'table';
    elements.noPracticantes.style.display = 'none';
    
    tbody.innerHTML = appState.practicantes.map(practicante => `
        <tr>
            <td>${practicante.id}</td>
            <td>${practicante.nombre}</td>
            <td>${practicante.apellido}</td>
            <td>${practicante.semestre}</td>
            <td>${practicante.sexo === 'M' ? 'Masculino' : 'Femenino'}</td>
            <td>
                <span class="estado-tag ${practicante.estado}">
                    ${practicante.estado}
                </span>
            </td>
            <td>${practicante.name_especialidad}</td>
            <td>
                <span class="equipo-tag ${practicante.nombre_equipo ? '' : 'ninguno'}">
                    ${practicante.nombre_equipo || 'Ninguno'}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-small btn-secondary" onclick="editarPracticante(${practicante.id})" title="Editar">
                        Editar
                    </button>
                    <button class="btn btn-small btn-danger" onclick="eliminarPracticante(${practicante.id}, '${practicante.nombre} ${practicante.apellido}')" title="Eliminar">
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Funciones de filtros
function aplicarFiltros() {
    const busqueda = elements.buscarPracticante.value.toLowerCase().trim();
    const filtroSemestre = elements.filtroSemestre.value;
    const filtroEstado = elements.filtroEstado.value;
    const filtroEspecialidad = elements.filtroEspecialidad.value;
    const filtroEquipo = elements.filtroEquipo.value;
    
    appState.practicantes = appState.practicantesOriginales.filter(practicante => {
        // Filtro de búsqueda por nombre y apellido
        const coincideBusqueda = !busqueda || 
            practicante.nombre.toLowerCase().includes(busqueda) ||
            practicante.apellido.toLowerCase().includes(busqueda);
        
        // Filtro por semestre
        const coincideSemestre = !filtroSemestre || practicante.semestre === filtroSemestre;
        
        // Filtro por estado
        const coincideEstado = !filtroEstado || practicante.estado === filtroEstado;
        
        // Filtro por especialidad
        const coincideEspecialidad = !filtroEspecialidad || practicante.especialidad.toString() === filtroEspecialidad;
        
        // Filtro por equipo
        let coincideEquipo = true;
        if (filtroEquipo) {
            if (filtroEquipo === 'sin_equipo') {
                coincideEquipo = !practicante.equipo;
            } else {
                coincideEquipo = practicante.equipo && practicante.equipo.toString() === filtroEquipo;
            }
        }
        
        return coincideBusqueda && coincideSemestre && coincideEstado && coincideEspecialidad && coincideEquipo;
    });
    
    renderizarTabla();
}

function limpiarFiltros() {
    elements.buscarPracticante.value = '';
    elements.filtroSemestre.value = '';
    elements.filtroEstado.value = '';
    elements.filtroEspecialidad.value = '';
    elements.filtroEquipo.value = '';
    appState.practicantes = [...appState.practicantesOriginales];
    renderizarTabla();
}

// Funciones del modal
function abrirModalNuevoPracticante() {
    appState.editingPracticante = null;
    elements.modalTitle.textContent = 'Añadir Nuevo Practicante';
    
    // Limpiar formulario
    elements.nombre.value = '';
    elements.apellido.value = '';
    elements.semestre.value = '';
    elements.sexo.value = '';
    elements.estado.value = '';
    elements.especialidad.value = '';
    
    elements.modalPracticante.style.display = 'block';
}

async function editarPracticante(id) {
    try {
        const practicante = await makeAPIRequest(`/practicantes/${id}/`);
        appState.editingPracticante = practicante;
        
        elements.modalTitle.textContent = 'Editar Practicante';
        elements.nombre.value = practicante.nombre;
        elements.apellido.value = practicante.apellido;
        elements.semestre.value = practicante.semestre;
        elements.sexo.value = practicante.sexo;
        elements.estado.value = practicante.estado;
        elements.especialidad.value = practicante.especialidad;
        
        elements.modalPracticante.style.display = 'block';
        
    } catch (error) {
        mostrarNotificacion('Error al cargar practicante: ' + error.message, 'error');
    }
}

function cerrarModalPracticante() {
    elements.modalPracticante.style.display = 'none';
    appState.editingPracticante = null;
}

async function guardarPracticante(e) {
    e.preventDefault();
    
    const data = {
        nombre: elements.nombre.value.trim(),
        apellido: elements.apellido.value.trim(),
        semestre: elements.semestre.value,
        sexo: elements.sexo.value,
        estado: elements.estado.value,
        especialidad: parseInt(elements.especialidad.value)
    };
    
    // Validaciones
    if (!data.nombre || !data.apellido || !data.semestre || !data.sexo || !data.estado || !data.especialidad) {
        mostrarNotificacion('Todos los campos son obligatorios', 'error');
        return;
    }
    
    try {
        elements.btnGuardar.disabled = true;
        elements.btnGuardar.textContent = 'Guardando...';
        
        if (appState.editingPracticante) {
            await makeAPIRequest(`/practicantes/${appState.editingPracticante.id}/`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            mostrarNotificacion('Practicante actualizado correctamente', 'success');
        } else {
            await makeAPIRequest('/practicantes/', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            mostrarNotificacion('Practicante creado correctamente', 'success');
        }
        
        cerrarModalPracticante();
        await cargarPracticantes();
        
    } catch (error) {
        mostrarNotificacion('Error al guardar el practicante: ' + error.message, 'error');
    } finally {
        elements.btnGuardar.disabled = false;
        elements.btnGuardar.textContent = 'Guardar';
    }
}

// Funciones de eliminación
function eliminarPracticante(id, nombre) {
    appState.practicanteAEliminar = id;
    elements.practicanteEliminar.textContent = nombre;
    elements.modalConfirmar.style.display = 'block';
}

function cerrarModalConfirmar() {
    elements.modalConfirmar.style.display = 'none';
    appState.practicanteAEliminar = null;
}

async function confirmarEliminarPracticante() {
    if (!appState.practicanteAEliminar) return;
    
    try {
        elements.btnConfirmarEliminar.disabled = true;
        elements.btnConfirmarEliminar.textContent = 'Eliminando...';
        
        await makeAPIRequest(`/practicantes/${appState.practicanteAEliminar}/`, {
            method: 'DELETE'
        });
        
        mostrarNotificacion('Practicante eliminado correctamente', 'success');
        cerrarModalConfirmar();
        await cargarPracticantes();
        
    } catch (error) {
        mostrarNotificacion('Error al eliminar el practicante: ' + error.message, 'error');
    } finally {
        elements.btnConfirmarEliminar.disabled = false;
        elements.btnConfirmarEliminar.textContent = 'Eliminar';
    }
}

// Funciones de utilidad
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    
    const iconos = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notificacion.innerHTML = `
        <span>${iconos[tipo] || iconos.info}</span>
        <span>${mensaje}</span>
    `;
    
    elements.notificaciones.appendChild(notificacion);
    
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.remove();
        }
    }, 5000);
    
    notificacion.addEventListener('click', () => {
        notificacion.remove();
    });
}

function verificarToken() {
    if (!appState.token) {
        mostrarNotificacion('Token de autenticación no encontrado. Por favor, inicia sesión.', 'error');
        return false;
    }
    return true;
}

// Verificar token al inicio
if (!verificarToken()) {
    console.warn('Token no válido o no encontrado');
}