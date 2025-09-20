// Configuración de la API
const API_BASE_URL = 'http://127.0.0.1:8000';

// Estado global de la aplicación
const appState = {
    practicantes: [],
    habilidadesDisponibles: [
        { nombre: "JavaScript" },
        { nombre: "React" },
        { nombre: "Figma" },
        { nombre: "Python" },
        { nombre: "Django" },
        { nombre: "Docker" },
        { nombre: "MySQL" },
        { nombre: "PHP" },
        { nombre: "Laravel" }
    ],
    practicanteSeleccionado: null,
    puntajesOriginales: {},
    puntajesActuales: {},
    token: localStorage.getItem('token') || '',
    user: null
};

// Elementos del DOM
const elements = {
    practicanteSelect: document.getElementById('practicanteSelect'),
    habilidadesContainer: document.getElementById('habilidadesContainer'),
    habilidadesGrid: document.getElementById('habilidadesGrid'),
    practicanteNombre: document.getElementById('practicanteNombre'),
    estadoVacio: document.getElementById('estadoVacio'),
    loading: document.getElementById('loading'),
    notificaciones: document.getElementById('notificaciones'),
    
    // Botones
    btnGuardar: document.getElementById('btnGuardar'),
    btnReemplazar: document.getElementById('btnReemplazar'),
    btnEliminar: document.getElementById('btnEliminar'),
    
    // Modal
    modalConfirmar: document.getElementById('modalConfirmar'),
    modalTitle: document.getElementById('modalTitle'),
    modalMessage: document.getElementById('modalMessage'),
    btnConfirmar: document.getElementById('btnConfirmar'),
    btnCancelar: document.getElementById('btnCancelar')
};

let accionPendiente = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventListeners();
    cargarPerfilUsuario();
    cargarPracticantes();
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
    
    // Selector de practicante
    elements.practicanteSelect.addEventListener('change', cambiarPracticante);
    
    // Botones
    elements.btnGuardar.addEventListener('click', () => guardarCambios('POST'));
    elements.btnReemplazar.addEventListener('click', () => confirmarAccion('reemplazar'));
    elements.btnEliminar.addEventListener('click', () => confirmarAccion('eliminar'));
    
    // Modal
    elements.btnConfirmar.addEventListener('click', ejecutarAccion);
    elements.btnCancelar.addEventListener('click', cerrarModal);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === elements.modalConfirmar) {
            cerrarModal();
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
        // Si el endpoint es absoluto, no anteponer API_BASE_URL
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        // Manejar 204 No Content
        if (response.status === 204) {
            return null;
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
        localStorage.removeItem('token');
        window.location.href = 'http://127.0.0.1:8000/';
    } catch (error) {
        console.error('Error cerrando sesión:', error);
        localStorage.removeItem('token');
        window.location.href = 'http://127.0.0.1:8000/';
    }
}

// Funciones de datos
async function cargarPracticantes() {
    try {
        const practicantes = await makeAPIRequest('/api/practicantes/');
        appState.practicantes = practicantes;
        
        // Llenar el select
        elements.practicanteSelect.innerHTML = '<option value="">-- Seleccionar Practicante --</option>';
        practicantes.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.nombre} ${p.apellido}`;
            elements.practicanteSelect.appendChild(option);
        });
        
    } catch (error) {
        mostrarNotificacion('Error al cargar practicantes: ' + error.message, 'error');
    }
}

async function cargarHabilidadesPracticante(idPracticante) {
    try {
        elements.loading.style.display = 'flex';
        elements.habilidadesContainer.style.display = 'none';
        elements.estadoVacio.style.display = 'none';
        
    const data = await makeAPIRequest(`/api/practicantes_puntaje/${idPracticante}/`);
        
        // Guardar puntajes originales
        appState.puntajesOriginales = {};
        appState.puntajesActuales = {};
        
        if (data.niveles_habilidad) {
            data.niveles_habilidad.forEach(habilidad => {
                appState.puntajesOriginales[habilidad.nombre_habilidad] = habilidad.puntaje;
                appState.puntajesActuales[habilidad.nombre_habilidad] = habilidad.puntaje;
            });
        }
        
        // Actualizar nombre del practicante
        elements.practicanteNombre.textContent = `Habilidades de ${data.nombre_practicante}`;
        
        // Renderizar habilidades
        renderizarHabilidades();
        
        elements.habilidadesContainer.style.display = 'block';
        
    } catch (error) {
        mostrarNotificacion('Error al cargar habilidades: ' + error.message, 'error');
        elements.estadoVacio.style.display = 'block';
    } finally {
        elements.loading.style.display = 'none';
    }
}

// Funciones de UI
function cambiarPracticante() {
    const idPracticante = elements.practicanteSelect.value;
    
    if (!idPracticante) {
        elements.habilidadesContainer.style.display = 'none';
        elements.estadoVacio.style.display = 'block';
        appState.practicanteSeleccionado = null;
        return;
    }
    
    appState.practicanteSeleccionado = idPracticante;
    elements.estadoVacio.style.display = 'none';
    cargarHabilidadesPracticante(idPracticante);
}

function renderizarHabilidades() {
    elements.habilidadesGrid.innerHTML = '';
    
    appState.habilidadesDisponibles.forEach(habilidad => {
        const puntaje = appState.puntajesActuales[habilidad.nombre] || 0;
        
        const habilidadCard = document.createElement('div');
        habilidadCard.className = 'habilidad-card';
        habilidadCard.innerHTML = `
            <div class="habilidad-nombre">
                ${getHabilidadIcon(habilidad.nombre)}
                ${habilidad.nombre}
            </div>
            <div class="habilidad-puntaje">
                <label class="puntaje-label">Puntaje (0-10)</label>
                <input 
                    type="number" 
                    class="puntaje-input" 
                    value="${puntaje}"
                    min="0" 
                    max="10"
                    data-habilidad="${habilidad.nombre}"
                    data-puntaje="${puntaje}"
                />
                <input 
                    type="range" 
                    class="puntaje-range" 
                    value="${puntaje}"
                    min="0" 
                    max="10"
                    data-habilidad="${habilidad.nombre}"
                />
            </div>
        `;
        
        elements.habilidadesGrid.appendChild(habilidadCard);
        
        // Event listeners para sincronizar input y range
        const inputNumber = habilidadCard.querySelector('.puntaje-input');
        const inputRange = habilidadCard.querySelector('.puntaje-range');
        
        inputNumber.addEventListener('input', (e) => {
            const valor = parseInt(e.target.value) || 0;
            const valorLimitado = Math.max(0, Math.min(10, valor));
            
            inputRange.value = valorLimitado;
            e.target.value = valorLimitado;
            e.target.setAttribute('data-puntaje', valorLimitado);
            
            appState.puntajesActuales[habilidad.nombre] = valorLimitado;
            actualizarEstadoBotones();
        });
        
        inputRange.addEventListener('input', (e) => {
            const valor = parseInt(e.target.value);
            inputNumber.value = valor;
            inputNumber.setAttribute('data-puntaje', valor);
            
            appState.puntajesActuales[habilidad.nombre] = valor;
            actualizarEstadoBotones();
        });
    });
    
    actualizarEstadoBotones();
}

function getHabilidadIcon(habilidad) {
    const iconos = {
        'JavaScript': '🟨',
        'React': '⚛️',
        'Figma': '🎨',
        'Python': '🐍',
        'Django': '🏗️',
        'Docker': '🐳',
        'MySQL': '🗃️',
        'PHP': '🐘',
        'Laravel': '🔴'
    };
    return iconos[habilidad] || '🔧';
}

function actualizarEstadoBotones() {
    if (!appState.practicanteSeleccionado) {
        elements.btnGuardar.disabled = true;
        elements.btnReemplazar.disabled = true;
        elements.btnEliminar.disabled = true;
        return;
    }
    
    // Verificar si hay cambios
    const hayCambios = JSON.stringify(appState.puntajesOriginales) !== JSON.stringify(appState.puntajesActuales);
    
    elements.btnGuardar.disabled = !hayCambios;
    elements.btnReemplazar.disabled = !hayCambios;
    elements.btnEliminar.disabled = false;
}

// Funciones de acciones
function confirmarAccion(accion) {
    accionPendiente = accion;
    
    const messages = {
        'reemplazar': {
            title: 'Reemplazar Todos los Puntajes',
            message: 'Esto eliminará todos los puntajes actuales y los reemplazará con los nuevos valores. ¿Continuar?'
        },
        'eliminar': {
            title: 'Eliminar Todos los Puntajes',
            message: 'Se eliminarán todos los puntajes de habilidades de este practicante. Esta acción no se puede deshacer. ¿Continuar?'
        }
    };
    
    elements.modalTitle.textContent = messages[accion].title;
    elements.modalMessage.textContent = messages[accion].message;
    elements.modalConfirmar.style.display = 'block';
}

async function ejecutarAccion() {
    if (!accionPendiente || !appState.practicanteSeleccionado) return;
    
    try {
        elements.btnConfirmar.disabled = true;
        elements.btnConfirmar.textContent = 'Procesando...';
        
        if (accionPendiente === 'reemplazar') {
            await guardarCambios('PUT');
        } else if (accionPendiente === 'eliminar') {
            await eliminarTodosPuntajes();
        }
        
        cerrarModal();
        
    } catch (error) {
        mostrarNotificacion('Error: ' + error.message, 'error');
    } finally {
        elements.btnConfirmar.disabled = false;
        elements.btnConfirmar.textContent = 'Confirmar';
    }
}

async function guardarCambios(metodo = 'POST') {
    if (!appState.practicanteSeleccionado) return;
    
    try {
        elements.btnGuardar.disabled = true;
        elements.btnReemplazar.disabled = true;
        
        // Preparar puntajes solo con valores > 0
        const puntajes = [];
        Object.entries(appState.puntajesActuales).forEach(([habilidad, puntaje]) => {
            if (puntaje > 0) {
                puntajes.push({
                    nombre_habilidad: habilidad,
                    puntaje: puntaje
                });
            }
        });
        
        const data = {
            id_practicante: parseInt(appState.practicanteSeleccionado),
            puntajes: puntajes
        };
        
        const response = await makeAPIRequest('/api/practicantes_puntaje/asignar_puntajes/', {
            method: metodo,
            body: JSON.stringify(data)
        });
        
        mostrarNotificacion(response.detail || 'Puntajes guardados correctamente', 'success');
        
        if (response.errores && response.errores.length > 0) {
            response.errores.forEach(error => {
                mostrarNotificacion('Error: ' + error, 'warning');
            });
        }
        
        // Recargar datos
        await cargarHabilidadesPracticante(appState.practicanteSeleccionado);
        
    } catch (error) {
        mostrarNotificacion('Error al guardar: ' + error.message, 'error');
    } finally {
        elements.btnGuardar.disabled = false;
        elements.btnReemplazar.disabled = false;
    }
}

async function eliminarTodosPuntajes() {
    if (!appState.practicanteSeleccionado) return;
    
    const id = appState.practicanteSeleccionado;
    const response = await makeAPIRequest(`/api/practicantes_puntaje/${id}/borrar_puntajes/`, {
        method: 'DELETE',
        body: JSON.stringify({ id_practicante: parseInt(id) })
    });
    if (response && response.detail) {
        mostrarNotificacion(response.detail, 'success');
    } else {
        mostrarNotificacion('Puntajes eliminados correctamente', 'success');
    }
    // Recargar datos
    await cargarHabilidadesPracticante(id);
}

function cerrarModal() {
    elements.modalConfirmar.style.display = 'none';
    accionPendiente = null;
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