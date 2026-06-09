import TeamsService from "../../../services/teams.service.js"; // Ajustá los '../' según tu estructura
import TeamRequest from "../../../models/request/team.request.js";

const teamsService = new TeamsService();

// Elementos del DOM
const teamsTableBody = document.getElementById('teamsTableBody');
const teamForm = document.getElementById('teamForm');
const formMessage = document.getElementById('formMessage');
const logoutBtn = document.getElementById('logoutBtn');

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarEquipos();
    
    // Configurar eventos
    teamForm.addEventListener('submit', handleCreateTeam);
    logoutBtn.addEventListener('click', handleLogout);
});

// Función para listar los equipos (GET)
async function cargarEquipos() {
    try {
        const teams = await teamsService.get(); // Llama al get() de tu teams.service.js
        teamsTableBody.innerHTML = ''; // Limpiamos la tabla

        if (teams.length === 0) {
            teamsTableBody.innerHTML = `<tr><td colspan="3" class="text-center">No hay equipos registrados.</td></tr>`;
            return;
        }

        teams.forEach(team => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${team.id || 'N/A'}</td>
                <td>${team.name}</td>
                <td>
                    <button class="btn-danger btn-sm" onclick="alert('Funcionalidad eliminar próximamente')">Eliminar</button>
                </td>
            `;
            teamsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        teamsTableBody.innerHTML = `<tr><td colspan="3" class="text-center error-text">Error al cargar equipos: ${error.message}</td></tr>`;
    }
}

// Función para crear un equipo (POST)
async function handleCreateTeam(event) {
    event.preventDefault();
    formMessage.textContent = '';
    formMessage.className = 'message';

    const formData = new FormData(teamForm);
    const name = formData.get('name');

    try {
        // Instanciamos el request tal como lo valida tu servicio
        const teamRequest = new TeamRequest(name); 
        
        // Enviamos al backend mediante tu servicio
        await teamsService.create(teamRequest);

        // Éxito
        formMessage.textContent = '¡Equipo creado con éxito!';
        formMessage.classList.add('success');
        teamForm.reset(); // Limpiar formulario
        
        // Recargar la tabla para ver el nuevo elemento
        cargarEquipos();
    } catch (error) {
        formMessage.textContent = `Error: ${error.message}`;
        formMessage.classList.add('error');
    }
}

// Función para cerrar sesión
function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = window.location.origin + '/login.html'; // Cambiá esto por tu página de login real
}