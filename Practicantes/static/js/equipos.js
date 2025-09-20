// Configuración de la API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Estado global de la aplicación
const appState = {
    equipos: [],
    practicantes: [],
    token: localStorage.getItem('token') || '',
    editingEquipo: null
};

// Elementos del DOM
const elements = {
    loadingEquipos: document.getElementById('loadingEquipos'),
    equiposGrid: document.getElementById('equiposGrid'),
    noEquipos: document.getElementById('noEquipos'),
    notificaciones: document.getElementById('notificaciones'),
    
    // Modal equipo
    modalEquipo: document.getElementById('modalEquipo'),
    modalTitle: document.getElementById('modalTitle'),
    formEquipo: document.getElementById('formEquipo'),
    nombreEquipo: document.getElementById('nombreEquipo'),
    practicantesDisponibles: document.getElementById('practicantesDisponibles'),
    practicantesSeleccionados: document.getElementById('practicantesSeleccionados'),
    
    // Modal confirmación
    modalConfirmar: document.getElementById('modalConfirmar'),
    equipoEliminar: document.getElementById('equipoEliminar'),
    
    // Modal progreso
    modalProgreso: document.getElementById('modalProgreso'),
    progresoTexto: document.getElementById('progresoTexto'),
    
    // Botones
    btnGenerarEquipos: document.getElementById('btnGenerarEquipos'),
    btnNuevoEquipo: document.getElementById('btnNuevoEquipo'),
    btnGuardar: document.getElementById('btnGuardar'),
    btnCancelar: document.getElementById('btnCancelar'),
    btnConfirmarEliminar: document.getElementById('btnConfirmarEliminar'),
    btnCancelarEliminar: document.getElementById('btnCancelarEliminar')
};

// Practicantes seleccionados para el formulario
let practicantesSeleccionados = [];

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventListeners();
    cargarDatos();
});

function inicializarEventListeners() {
    // Botones principales
    elements.btnGenerarEquipos.addEventListener('click', generarEquiposAutomaticos);
    elements.btnNuevoEquipo.addEventListener('click', abrirModalNuevoEquipo);
    
    // Modal equipo
    elements.formEquipo.addEventListener('submit', guardarEquipo);
    elements.btnCancelar.addEventListener('click', cerrarModalEquipo);
    
    // Modal confirmación
    elements.btnConfirmarEliminar.addEventListener('click', confirmarEliminarEquipo);
    elements.btnCancelarEliminar.addEventListener('click', cerrarModalConfirmar);
    
    // Cerrar modales al hacer clic en la X o fuera del modal
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
        const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
        
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

async function cargarEquipos() {
    try {
        elements.loadingEquipos.style.display = 'flex';
        elements.equiposGrid.style.display = 'none';
        elements.noEquipos.style.display = 'none';
        
        const equipos = await makeAPIRequest('/equipos/');
        appState.equipos = equipos;
        
        renderizarEquipos();
        
    } catch (error) {
        mostrarNotificacion('Error al cargar los equipos: ' + error.message, 'error');
        console.error('Error cargando equipos:', error);
    } finally {
        elements.loadingEquipos.style.display = 'none';
    }
}

async function cargarPracticantes() {
    try {
        const practicantes = await makeAPIRequest('/practicantes/');
        appState.practicantes = practicantes;
    } catch (error) {
        mostrarNotificacion('Error al cargar practicantes: ' + error.message, 'error');
        console.error('Error cargando practicantes:', error);
    }
}

async function cargarPracticantesLibres() {
    try {
        const practicantesLibres = await makeAPIRequest('/practicantes/?estado=libre');
        return practicantesLibres;
    } catch (error) {
        console.error('Error cargando practicantes libres:', error);
        throw error;
    }
}

async function cargarDatos() {
    await Promise.all([cargarEquipos(), cargarPracticantes()]);
}

// Renderizado
function renderizarEquipos() {
    const equiposContainer = elements.equiposGrid;
    
    if (appState.equipos.length === 0) {
        equiposContainer.style.display = 'none';
        elements.noEquipos.style.display = 'block';
        return;
    }
    
    equiposContainer.style.display = 'grid';
    elements.noEquipos.style.display = 'none';
    
    equiposContainer.innerHTML = appState.equipos.map(equipo => {
        const stats = calcularEstadisticasEquipo(equipo);
        
        return `
            <div class="equipo-card">
                <div class="equipo-header">
                    <h3 class="equipo-nombre">${equipo.nombre}</h3>
                    <div class="equipo-actions">
                        <button class="btn btn-small btn-secondary" onclick="editarEquipo(${equipo.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="btn btn-small btn-danger" onclick="eliminarEquipo(${equipo.id}, '${equipo.nombre}')" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="equipo-stats">
                    <div class="stat">
                        <div class="stat-value">${equipo.practicantes.length}</div>
                        <div class="stat-label">Total</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${stats.backend}</div>
                        <div class="stat-label">Backend</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${stats.frontend}</div>
                        <div class="stat-label">Frontend</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${stats.scrum}</div>
                        <div class="stat-label">Scrum</div>
                    </div>
                </div>
                
                <ul class="practicantes-list">
                    ${equipo.practicantes.map(p => `
                        <li class="practicante-item">
                            <div class="practicante-info">
                                <div class="nombre">${p.nombre} ${p.apellido}</div>
                                <div class="especialidad ${p.name_especialidad.toLowerCase()}">${p.name_especialidad}</div>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }).join('');
}

function calcularEstadisticasEquipo(equipo) {
    return equipo.practicantes.reduce((stats, practicante) => {
        const especialidad = practicante.name_especialidad.toLowerCase();
        if (especialidad.includes('backend')) stats.backend++;
        else if (especialidad.includes('frontend')) stats.frontend++;
        else if (especialidad.includes('scrum')) stats.scrum++;
        return stats;
    }, { backend: 0, frontend: 0, scrum: 0 });
}

function renderizarPracticantesDisponibles(practicantes) {
    const container = elements.practicantesDisponibles;
    
    if (practicantes.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay practicantes disponibles</p>';
        return;
    }
    
    container.innerHTML = practicantes.map(p => `
        <div class="practicante-card" data-id="${p.id}" onclick="togglePracticante(${p.id})">
            <div class="nombre">${p.nombre} ${p.apellido}</div>
            <div class="especialidad ${p.name_especialidad.toLowerCase()}">${p.name_especialidad}</div>
        </div>
    `).join('');
}

function renderizarPracticantesSeleccionados() {
    const container = elements.practicantesSeleccionados;
    
    if (practicantesSeleccionados.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay practicantes seleccionados</p>';
        return;
    }
    
    container.innerHTML = practicantesSeleccionados.map(p => `
        <div class="selected-practicante">
            <span>${p.nombre} ${p.apellido}</span>
            <span class="remove" onclick="removerPracticante(${p.id})">×</span>
        </div>
    `).join('');
}

// Funciones de manejo de practicantes en el modal
function togglePracticante(id) {
    const practicante = appState.practicantes.find(p => p.id === id);
    if (!practicante) return;
    
    const index = practicantesSeleccionados.findIndex(p => p.id === id);
    
    if (index === -1) {
        // Verificar límites antes de agregar
        if (practicantesSeleccionados.length >= 5) {
            mostrarNotificacion('Un equipo no puede tener más de 5 practicantes', 'warning');
            return;
        }
        
        const stats = calcularEstadisticasPracticantesSeleccionados();
        const especialidad = practicante.name_especialidad.toLowerCase();
        
        if (especialidad.includes('backend') && stats.backend >= 2) {
            mostrarNotificacion('Un equipo no puede tener más de 2 especialistas en Backend', 'warning');
            return;
        }
        
        if (especialidad.includes('frontend') && stats.frontend >= 2) {
            mostrarNotificacion('Un equipo no puede tener más de 2 especialistas en Frontend', 'warning');
            return;
        }
        
        if (especialidad.includes('scrum') && stats.scrum >= 1) {
            mostrarNotificacion('Un equipo no puede tener más de 1 Scrum Master', 'warning');
            return;
        }
        
        practicantesSeleccionados.push(practicante);
    } else {
        practicantesSeleccionados.splice(index, 1);
    }
    
    actualizarVisualizacionPracticantes();
}

function removerPracticante(id) {
    const index = practicantesSeleccionados.findIndex(p => p.id === id);
    if (index !== -1) {
        practicantesSeleccionados.splice(index, 1);
        actualizarVisualizacionPracticantes();
    }
}

function actualizarVisualizacionPracticantes() {
    // Actualizar cards de disponibles
    document.querySelectorAll('.practicante-card').forEach(card => {
        const id = parseInt(card.dataset.id);
        const isSelected = practicantesSeleccionados.some(p => p.id === id);
        card.classList.toggle('selected', isSelected);
    });
    
    // Actualizar lista de seleccionados
    renderizarPracticantesSeleccionados();
}

function calcularEstadisticasPracticantesSeleccionados() {
    return practicantesSeleccionados.reduce((stats, practicante) => {
        const especialidad = practicante.name_especialidad.toLowerCase();
        if (especialidad.includes('backend')) stats.backend++;
        else if (especialidad.includes('frontend')) stats.frontend++;
        else if (especialidad.includes('scrum')) stats.scrum++;
        return stats;
    }, { backend: 0, frontend: 0, scrum: 0 });
}

// Funciones del modal de equipo
async function abrirModalNuevoEquipo() {
    appState.editingEquipo = null;
    elements.modalTitle.textContent = 'Crear Nuevo Equipo';
    elements.nombreEquipo.value = '';
    practicantesSeleccionados = [];
    
    try {
        const practicantesLibres = await cargarPracticantesLibres();
        renderizarPracticantesDisponibles(practicantesLibres);
        renderizarPracticantesSeleccionados();
        elements.modalEquipo.style.display = 'block';
    } catch (error) {
        mostrarNotificacion('Error al cargar practicantes disponibles', 'error');
    }
}

async function editarEquipo(id) {
    const equipo = appState.equipos.find(e => e.id === id);
    if (!equipo) return;
    
    appState.editingEquipo = equipo;
    elements.modalTitle.textContent = 'Editar Equipo';
    elements.nombreEquipo.value = equipo.nombre;
    practicantesSeleccionados = [...equipo.practicantes];
    
    try {
        // Cargar practicantes libres + los que ya están en el equipo
        const practicantesLibres = await cargarPracticantesLibres();
        const todosPracticantes = [...practicantesLibres, ...equipo.practicantes];
        
        // Eliminar duplicados basándose en el ID
        const practicantesUnicos = todosPracticantes.filter((p, index, arr) => 
            arr.findIndex(item => item.id === p.id) === index
        );
        
        renderizarPracticantesDisponibles(practicantesUnicos);
        renderizarPracticantesSeleccionados();
        actualizarVisualizacionPracticantes();
        elements.modalEquipo.style.display = 'block';
    } catch (error) {
        mostrarNotificacion('Error al cargar datos del equipo', 'error');
    }
}

function cerrarModalEquipo() {
    elements.modalEquipo.style.display = 'none';
    practicantesSeleccionados = [];
    appState.editingEquipo = null;
}

async function guardarEquipo(e) {
    e.preventDefault();
    
    const nombre = elements.nombreEquipo.value.trim();
    if (!nombre) {
        mostrarNotificacion('El nombre del equipo es obligatorio', 'error');
        return;
    }
    
    if (practicantesSeleccionados.length === 0) {
        mostrarNotificacion('Debe seleccionar al menos un practicante', 'error');
        return;
    }
    
    const practicantesIds = practicantesSeleccionados.map(p => p.id);
    const data = {
        nombre: nombre,
        practicantes_ids: practicantesIds
    };
    
    try {
        elements.btnGuardar.disabled = true;
        elements.btnGuardar.textContent = 'Guardando...';
        
        if (appState.editingEquipo) {
            // Actualizar equipo existente
            await makeAPIRequest(`/equipos/${appState.editingEquipo.id}/`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            mostrarNotificacion('Equipo actualizado correctamente', 'success');
        } else {
            // Crear nuevo equipo
            await makeAPIRequest('/equipos/', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            mostrarNotificacion('Equipo creado correctamente', 'success');
        }
        
        cerrarModalEquipo();
        await cargarDatos(); // Recargar equipos y practicantes
        
    } catch (error) {
        mostrarNotificacion('Error al guardar el equipo: ' + error.message, 'error');
    } finally {
        elements.btnGuardar.disabled = false;
        elements.btnGuardar.textContent = 'Guardar';
    }
}

// Funciones de eliminación
function eliminarEquipo(id, nombre) {
    appState.equipoAEliminar = id;
    elements.equipoEliminar.textContent = nombre;
    elements.modalConfirmar.style.display = 'block';
}

function cerrarModalConfirmar() {
    elements.modalConfirmar.style.display = 'none';
    appState.equipoAEliminar = null;
}

async function confirmarEliminarEquipo() {
    if (!appState.equipoAEliminar) return;
    
    try {
        elements.btnConfirmarEliminar.disabled = true;
        elements.btnConfirmarEliminar.textContent = 'Eliminando...';
        
        await makeAPIRequest(`/equipos/${appState.equipoAEliminar}/`, {
            method: 'DELETE'
        });
        
        mostrarNotificacion('Equipo eliminado correctamente', 'success');
        cerrarModalConfirmar();
        await cargarDatos();
        
    } catch (error) {
        mostrarNotificacion('Error al eliminar el equipo: ' + error.message, 'error');
    } finally {
        elements.btnConfirmarEliminar.disabled = false;
        elements.btnConfirmarEliminar.textContent = 'Eliminar';
    }
}

// Generación automática de equipos
async function generarEquiposAutomaticos() {
    try {
        // Mostrar modal de progreso
        elements.modalProgreso.style.display = 'block';
        elements.progresoTexto.textContent = 'Analizando practicantes disponibles...';
        
        // Deshabilitar botón durante el proceso
        elements.btnGenerarEquipos.disabled = true;
        
        // Obtener practicantes libres
        const practicantesLibres = await cargarPracticantesLibres();
        
        if (practicantesLibres.length < 2) { // CAMBIO: Cambió de 3 a 2 el mínimo requerido
            mostrarNotificacion('Se necesitan al menos 2 practicantes libres para generar equipos', 'warning');
            elements.modalProgreso.style.display = 'none';
            return;
        }
        
        elements.progresoTexto.textContent = 'Organizando equipos óptimos...';
        
        // Agrupar practicantes por especialidad (CAMBIO: Excluir Scrum Master de la generación automática)
        const backend = practicantesLibres.filter(p => p.name_especialidad.toLowerCase().includes('backend'));
        const frontend = practicantesLibres.filter(p => p.name_especialidad.toLowerCase().includes('frontend'));
        // const scrum = practicantesLibres.filter(p => p.name_especialidad.toLowerCase().includes('scrum')); // Ya no se usa
        
        // Generar equipos balanceados (CAMBIO: Solo con Backend y Frontend)
        const equiposGenerados = generarEquiposBalanceados(backend, frontend);
        
        if (equiposGenerados.length === 0) {
            mostrarNotificacion('No se pueden formar equipos válidos con los practicantes disponibles', 'warning');
            elements.modalProgreso.style.display = 'none';
            return;
        }
        
        elements.progresoTexto.textContent = 'Creando equipos en el sistema...';
        
        // Crear equipos en el servidor
        let equiposCreados = 0;
        let equiposError = 0;
        
        for (let i = 0; i < equiposGenerados.length; i++) {
            try {
                const equipo = equiposGenerados[i];
                // CAMBIO: Nombre más descriptivo para equipos sin Scrum Master
                const nombre = `EQUIPO_${Date.now()}_${i + 1}`;
                
                await makeAPIRequest('/equipos/', {
                    method: 'POST',
                    body: JSON.stringify({
                        nombre: nombre,
                        practicantes_ids: equipo.map(p => p.id)
                    })
                });
                
                equiposCreados++;
                elements.progresoTexto.textContent = 
                    `Creando equipos... ${equiposCreados}/${equiposGenerados.length}`;
                
            } catch (error) {
                console.error('Error creando equipo:', error);
                equiposError++;
            }
        }
        
        // Mostrar resultados
        if (equiposCreados > 0) {
            mostrarNotificacion(
                `Se generaron ${equiposCreados} equipo${equiposCreados !== 1 ? 's' : ''} automáticamente`,
                'success'
            );
        }
        
        if (equiposError > 0) {
            mostrarNotificacion(
                `${equiposError} equipo${equiposError !== 1 ? 's' : ''} no se pudieron crear`,
                'warning'
            );
        }
        
        // Recargar datos
        await cargarDatos();
        
    } catch (error) {
        mostrarNotificacion('Error en la generación automática: ' + error.message, 'error');
        console.error('Error generando equipos:', error);
    } finally {
        elements.modalProgreso.style.display = 'none';
        elements.btnGenerarEquipos.disabled = false;
    }
}

function generarEquiposBalanceados(backend, frontend) { // CAMBIO: Eliminado parámetro 'scrum'
    const equipos = [];
    const practicantesUsados = new Set();
    
    // Algoritmo greedy para formar equipos balanceados (CAMBIO: Solo Backend y Frontend)
    while (true) {
        const equipoActual = [];
        
        // CAMBIO: Eliminada la lógica para agregar Scrum Master automáticamente
        // Los Scrum Master serán agregados manualmente después
        
        // Intentar agregar hasta 2 Backend
        const backendDisponibles = backend.filter(p => !practicantesUsados.has(p.id));
        const backendParaEquipo = backendDisponibles.slice(0, 2);
        backendParaEquipo.forEach(p => {
            equipoActual.push(p);
            practicantesUsados.add(p.id);
        });
        
        // Intentar agregar hasta 2 Frontend
        const frontendDisponibles = frontend.filter(p => !practicantesUsados.has(p.id));
        const frontendParaEquipo = frontendDisponibles.slice(0, 2);
        frontendParaEquipo.forEach(p => {
            equipoActual.push(p);
            practicantesUsados.add(p.id);
        });
        
        // CAMBIO: Ahora un equipo es válido con al menos 2 personas (antes era 3)
        // ya que no incluimos Scrum Master automáticamente
        if (equipoActual.length >= 2) {
            equipos.push(equipoActual);
        } else {
            // No se pueden formar más equipos válidos
            break;
        }
        
        // CAMBIO: Ajustado el cálculo de practicantes restantes (sin contar scrum)
        const restantes = backend.length + frontend.length - practicantesUsados.size;
        if (restantes < 2) { // CAMBIO: Cambió de 3 a 2 el mínimo requerido
            break;
        }
    }
    
    return equipos;
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
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.remove();
        }
    }, 5000);
    
    // Permitir cerrar manualmente
    notificacion.addEventListener('click', () => {
        notificacion.remove();
    });
}

// Validar token al cargar
function verificarToken() {
    if (!appState.token) {
        mostrarNotificacion('Token de autenticación no encontrado. Por favor, inicia sesión.', 'error');
        return false;
    }
    return true;
}

// Verificar token al inicio
if (!verificarToken()) {
    // Redirigir al login o mostrar formulario de login
    console.warn('Token no válido o no encontrado');
}