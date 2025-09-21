// Configuración de la API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Estado global
const appState = {
    horarios: [],
    horariosOriginales: [],
    practicantes: [],
    editingHorario: null,
    token: localStorage.getItem('token') || '',
    user: null
};

// Elementos del DOM
const elements = {
    loadingHorarios: document.getElementById('loadingHorarios'),
    horariosGrid: document.getElementById('horariosGrid'),
    noHorarios: document.getElementById('noHorarios'),
    notificaciones: document.getElementById('notificaciones'),
    
    // Filtros
    filtroDiaFalta: document.getElementById('filtroDiaFalta'),
    filtroDiaRecuperacion: document.getElementById('filtroDiaRecuperacion'),
    btnLimpiarFiltros: document.getElementById('btnLimpiarFiltros'),
    
    // Modal horario
    modalHorario: document.getElementById('modalHorario'),
    modalTitle: document.getElementById('modalTitle'),
    formHorario: document.getElementById('formHorario'),
    selectPracticante: document.getElementById('selectPracticante'),
    
    // Modal confirmación
    modalConfirmar: document.getElementById('modalConfirmar'),
    horarioEliminar: document.getElementById('horarioEliminar'),
    
    // Botones
    btnNuevoHorario: document.getElementById('btnNuevoHorario'),
    btnExportar: document.getElementById('btnExportar'),
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
    elements.btnNuevoHorario.addEventListener('click', abrirModalNuevoHorario);
    elements.btnExportar.addEventListener('click', exportarExcel);
    
    // Filtros
    elements.filtroDiaFalta.addEventListener('change', aplicarFiltros);
    elements.filtroDiaRecuperacion.addEventListener('change', aplicarFiltros);
    elements.btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
    
    // Modal horario
    elements.formHorario.addEventListener('submit', guardarHorario);
    elements.btnCancelar.addEventListener('click', cerrarModalHorario);
    
    // Modal confirmación
    elements.btnConfirmarEliminar.addEventListener('click', confirmarEliminarHorario);
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
    
    try {
        // Si el endpoint es /profile/ o /logout/, usar raíz, no API_BASE_URL
        let url;
        if (endpoint.startsWith('/profile/') || endpoint.startsWith('/logout/')) {
            url = `http://127.0.0.1:8000${endpoint}`;
        } else {
            url = `${API_BASE_URL}${endpoint}`;
        }

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
async function cargarHorarios() {
    try {
        elements.loadingHorarios.style.display = 'flex';
        elements.horariosGrid.style.display = 'none';
        elements.noHorarios.style.display = 'none';
        
        const horarios = await makeAPIRequest('/horarios-recuperacion/');
        appState.horarios = horarios;
        appState.horariosOriginales = [...horarios];
        
        renderizarHorarios();
        
    } catch (error) {
        mostrarNotificacion('Error al cargar los horarios: ' + error.message, 'error');
        console.error('Error cargando horarios:', error);
    } finally {
        elements.loadingHorarios.style.display = 'none';
    }
}

async function cargarPracticantes() {
    try {
        const practicantes = await makeAPIRequest('/practicantes/');
        appState.practicantes = practicantes;
        
        // Llenar select de practicantes
        elements.selectPracticante.innerHTML = '<option value="">-- Seleccionar Practicante --</option>';
        practicantes.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.nombre} ${p.apellido}`;
            elements.selectPracticante.appendChild(option);
        });
        
    } catch (error) {
        mostrarNotificacion('Error al cargar practicantes: ' + error.message, 'error');
        console.error('Error cargando practicantes:', error);
    }
}

async function cargarDatos() {
    await Promise.all([cargarHorarios(), cargarPracticantes()]);
}

// Funciones de renderizado
function renderizarHorarios() {
    const horariosContainer = elements.horariosGrid;
    
    if (appState.horarios.length === 0) {
        horariosContainer.style.display = 'none';
        elements.noHorarios.style.display = 'block';
        return;
    }
    
    horariosContainer.style.display = 'grid';
    elements.noHorarios.style.display = 'none';
    
    horariosContainer.innerHTML = appState.horarios.map(horario => `
        <div class="horario-card">
            <div class="horario-header">
                <h3 class="horario-practicante">${horario.nombre_practicante}</h3>
                <div class="horario-actions">
                    <button class="btn btn-small btn-secondary" onclick="editarHorario(${horario.id})" title="Editar">
                        ✏️
                    </button>
                    <button class="btn btn-small btn-danger" onclick="eliminarHorario(${horario.id}, '${horario.nombre_practicante}')" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="horario-info">
                <div class="info-section falta">
                    <div class="info-title">📅 Días de Falta</div>
                    <div class="dias-list">
                        ${horario.dias_falta_detalle.map(dia => 
                            `<span class="dia-tag falta">${dia.nombre}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="info-section recuperacion">
                    <div class="info-title">🔄 Días de Recuperación</div>
                    <div class="dias-list">
                        ${horario.dias_recuperacion_detalle.map(dia => 
                            `<span class="dia-tag recuperacion">${dia.nombre}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Funciones de filtros
function aplicarFiltros() {
    const filtroFalta = elements.filtroDiaFalta.value;
    const filtroRecuperacion = elements.filtroDiaRecuperacion.value;
    
    appState.horarios = appState.horariosOriginales.filter(horario => {
        let cumpleFiltroFalta = true;
        let cumpleFiltroRecuperacion = true;
        
        if (filtroFalta) {
            cumpleFiltroFalta = horario.dias_falta_detalle.some(dia => dia.id.toString() === filtroFalta);
        }
        
        if (filtroRecuperacion) {
            cumpleFiltroRecuperacion = horario.dias_recuperacion_detalle.some(dia => dia.id.toString() === filtroRecuperacion);
        }
        
        return cumpleFiltroFalta && cumpleFiltroRecuperacion;
    });
    
    renderizarHorarios();
}

function limpiarFiltros() {
    elements.filtroDiaFalta.value = '';
    elements.filtroDiaRecuperacion.value = '';
    appState.horarios = [...appState.horariosOriginales];
    renderizarHorarios();
}

// Funciones del modal
async function abrirModalNuevoHorario() {
    appState.editingHorario = null;
    elements.modalTitle.textContent = 'Crear Nuevo Horario';
    elements.selectPracticante.value = '';
    limpiarCheckboxes();
    elements.modalHorario.style.display = 'block';
}

async function editarHorario(id) {
    try {
        const horario = await makeAPIRequest(`/horarios-recuperacion/${id}/`);
        appState.editingHorario = horario;
        
        elements.modalTitle.textContent = 'Editar Horario';
        elements.selectPracticante.value = horario.id_practicante;
        
        limpiarCheckboxes();
        
        // Marcar días de falta
        horario.dias_falta_detalle.forEach(dia => {
            const checkbox = document.querySelector(`#diasFalta input[value="${dia.id}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Marcar días de recuperación
        horario.dias_recuperacion_detalle.forEach(dia => {
            const checkbox = document.querySelector(`#diasRecuperacion input[value="${dia.id}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        elements.modalHorario.style.display = 'block';
        
    } catch (error) {
        mostrarNotificacion('Error al cargar horario: ' + error.message, 'error');
    }
}

function limpiarCheckboxes() {
    document.querySelectorAll('#diasFalta input, #diasRecuperacion input').forEach(cb => {
        cb.checked = false;
    });
}

function cerrarModalHorario() {
    elements.modalHorario.style.display = 'none';
    appState.editingHorario = null;
}

async function guardarHorario(e) {
    e.preventDefault();
    
    const practicante = elements.selectPracticante.value;
    if (!practicante) {
        mostrarNotificacion('Debe seleccionar un practicante', 'error');
        return;
    }
    
    const diasFalta = Array.from(document.querySelectorAll('#diasFalta input:checked')).map(cb => parseInt(cb.value));
    const diasRecuperacion = Array.from(document.querySelectorAll('#diasRecuperacion input:checked')).map(cb => parseInt(cb.value));
    
    if (diasFalta.length === 0) {
        mostrarNotificacion('Debe seleccionar al menos un día de falta', 'error');
        return;
    }
    
    if (diasRecuperacion.length === 0) {
        mostrarNotificacion('Debe seleccionar al menos un día de recuperación', 'error');
        return;
    }
    
    const data = {
        practicante: parseInt(practicante),
        dias_falta: diasFalta,
        dias_recuperacion: diasRecuperacion
    };
    
    try {
        elements.btnGuardar.disabled = true;
        elements.btnGuardar.textContent = 'Guardando...';
        
        if (appState.editingHorario) {
            await makeAPIRequest(`/horarios-recuperacion/${appState.editingHorario.id}/`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            mostrarNotificacion('Horario actualizado correctamente', 'success');
        } else {
            await makeAPIRequest('/horarios-recuperacion/', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            mostrarNotificacion('Horario creado correctamente', 'success');
        }
        
        cerrarModalHorario();
        await cargarHorarios();
        
    } catch (error) {
        mostrarNotificacion('Error al guardar el horario: ' + error.message, 'error');
    } finally {
        elements.btnGuardar.disabled = false;
        elements.btnGuardar.textContent = 'Guardar';
    }
}

// Funciones de eliminación
function eliminarHorario(id, nombre) {
    appState.horarioAEliminar = id;
    elements.horarioEliminar.textContent = nombre;
    elements.modalConfirmar.style.display = 'block';
}

function cerrarModalConfirmar() {
    elements.modalConfirmar.style.display = 'none';
    appState.horarioAEliminar = null;
}

async function confirmarEliminarHorario() {
    if (!appState.horarioAEliminar) return;
    
    try {
        elements.btnConfirmarEliminar.disabled = true;
        elements.btnConfirmarEliminar.textContent = 'Eliminando...';
        
        await makeAPIRequest(`/horarios-recuperacion/${appState.horarioAEliminar}/`, {
            method: 'DELETE'
        });
        
        mostrarNotificacion('Horario eliminado correctamente', 'success');
        cerrarModalConfirmar();
        await cargarHorarios();
        
    } catch (error) {
        mostrarNotificacion('Error al eliminar el horario: ' + error.message, 'error');
    } finally {
        elements.btnConfirmarEliminar.disabled = false;
        elements.btnConfirmarEliminar.textContent = 'Eliminar';
    }
}

// Función de exportar
async function exportarExcel() {
    try {
        elements.btnExportar.disabled = true;
        elements.btnExportar.innerHTML = '<span>⏳</span> Exportando...';
        
        const response = await fetch(`${API_BASE_URL}/horarios-recuperacion/exportar-excel/`, {
            headers: {
                'Authorization': `Token ${appState.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al exportar');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'horarios-recuperacion.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        mostrarNotificacion('Archivo exportado correctamente', 'success');
        
    } catch (error) {
        mostrarNotificacion('Error al exportar: ' + error.message, 'error');
    } finally {
        elements.btnExportar.disabled = false;
        elements.btnExportar.innerHTML = '<span>📤</span> Exportar Excel';
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