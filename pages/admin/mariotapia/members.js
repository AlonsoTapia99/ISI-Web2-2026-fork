import TeamsService from "../../../shared/services/teams.service.js";
import TokenResponse from "../../../shared/models/response/token.response.js"; // Importamos para leer o simular el token

class LocalMemberResponse {
    constructor(teamId, userId, displayName, email, role, joinedAt) {
        this.teamId = teamId;
        this.userId = userId;
        this.displayName = displayName;
        this.email = email;
        this.role = role;
        this.joinedAt = new Date(joinedAt);
    }

    static fromJson(json) {
        return new LocalMemberResponse(
            json.teamId,
            json.userId,
            json.displayName,
            json.email,
            json.role,
            json.joinedAt
        );
    }
}

class LocalMemberRequest {
    constructor(userId, role) {
        this.userId = parseInt(userId);
        this.role = role;
    }

    toJson() {
        return {
            userId: this.userId,
            role: this.role
        };
    }
}


const teamsService = new TeamsService();


async function obtenerMiembrosDeEquipo(teamId) {
    try {
        if (!teamId) throw new Error("Es necesario proporcionar el ID del equipo.");

        // Modificación de ruta para saltar el conflicto del endpoint en minúsculas del servicio
        const endpointMembers = `/Teams/${teamId}/members`;
        console.log(`Iniciando petición GET a: ${teamsService.baseUrl}${endpointMembers}`);

      
        const jsonResponse = await teamsService.get(endpointMembers);

        if (jsonResponse === null || !Array.isArray(jsonResponse)) {
            return [];
        }

        return jsonResponse.map(memberJson => LocalMemberResponse.fromJson(memberJson));

    } catch (error) {
       
        if (error.message.includes("JSON") || error.message.includes("fetching data")) {
            throw new Error("No autorizado (401). Asegúrate de haber iniciado sesión primero.");
        }
        console.error("Error al obtener los miembros de la API:", error.message);
        throw error;
    }
}

// --- Petición POST ---
async function agregarMiembroEnEquipo(teamId, localMemberRequest) {
    try {
        if (!teamId) throw new Error("El ID del equipo es requerido.");
        
        if (!localMemberRequest) throw new Error("Los datos del miembro son requeridos."); 

       
        const endpointMembersPost = `/Teams/${teamId}/members`;
        console.log(`Iniciando petición POST a: ${teamsService.baseUrl}${endpointMembersPost}`);

        
        const jsonResponse = await teamsService.post(endpointMembersPost, localMemberRequest.toJson());
        return jsonResponse;

    } catch (error) {
        console.error("Error en la petición POST de miembros:", error.message);
        throw error;
    }
}

const btnCargarMiembros = document.getElementById('btnCargarMiembros');
const inputTeamId = document.getElementById('teamIdMembersInput');
const txtEstado = document.getElementById('mensajeEstadoMembers');
const ulMiembros = document.getElementById('listaMiembros');

btnCargarMiembros.addEventListener('click', async () => {
    const teamId = inputTeamId.value;

    ulMiembros.innerHTML = '';
    txtEstado.style.color = "black";
    txtEstado.innerText = "Consultando miembros en el servidor...";

    
    const token = TokenResponse.loadFromLocalStorage();
    if (token === null || !token.isValid()) {
        txtEstado.style.color = "red";
        txtEstado.innerText = "Error: No existe un token válido en LocalStorage. Debes loguearte primero en la app principal.";
        return;
    }

    try {
        const miembros = await obtenerMiembrosDeEquipo(teamId);

        if (miembros.length === 0) {
            txtEstado.innerText = "Este equipo no tiene miembros registrados o el equipo no existe.";
            return;
        }

        txtEstado.style.color = "green";
        txtEstado.innerText = `¡Éxito! Se encontraron ${miembros.length} miembros:`;

        miembros.forEach(member => {
            const li = document.createElement('li');
            li.style.marginBottom = "10px";
            li.innerHTML = `
                <strong>${member.displayName}</strong> (${member.role}) <br>
                <span>Email: ${member.email}</span> | <small>ID Usuario: ${member.userId}</small>
            `;
            ulMiembros.appendChild(li);
        });

    } catch (error) {
        txtEstado.style.color = "red";
        txtEstado.innerText = `Error: ${error.message}`;
    }
});


const btnAgregarMiembro = document.getElementById('btnAgregarMiembro');
const inputNewMemberUserId = document.getElementById('newMemberUserIdInput');
const inputNewMemberRole = document.getElementById('newMemberRoleInput');
const txtAgregarMemberEstado = document.getElementById('mensajeAgregarMemberEstado');

btnAgregarMiembro.addEventListener('click', async () => {
    const teamId = inputTeamId.value; 
    const userId = inputNewMemberUserId.value;
    const role = inputNewMemberRole.value.trim();

    if (!userId || !role) {
        txtAgregarMemberEstado.innerText = "Por favor, completa el ID del usuario y su rol.";
        return;
    }

    txtAgregarMemberEstado.style.color = "black";
    txtAgregarMemberEstado.innerText = "Enviando solicitud de miembro a la API...";

    try {
        
        const nuevoMiembroRequest = new LocalMemberRequest(userId, role);

        // Ejecutamos el flujo asíncrono
        const resultado = await agregarMiembroEnEquipo(teamId, nuevoMiembroRequest);

        
        txtAgregarMemberEstado.style.color = "green";
        txtAgregarMemberEstado.innerText = `¡Éxito! Usuario ID ${resultado.userId} agregado al equipo como "${resultado.role}".`;

       
        inputNewMemberUserId.value = '';
        inputNewMemberRole.value = '';

    } catch (error) {
        txtAgregarMemberEstado.style.color = "red";
        txtAgregarMemberEstado.innerText = `Error al agregar: ${error.message}`;
    }
});

async function removerMiembroDeEquipo(teamId, userId) {
    try {
        if (!teamId) throw new Error("El ID del equipo es requerido.");
        if (!userId) throw new Error("El ID del usuario es requerido.");

        
        const endpointMembersDelete = `/Teams/${teamId}/members/${userId}`;
        console.log(`Iniciando petición DELETE a: ${teamsService.baseUrl}${endpointMembersDelete}`);

        
        const jsonResponse = await teamsService.delete(endpointMembersDelete);
        
        
        return jsonResponse;

    } catch (error) {
        console.error("Error en la petición DELETE de miembros:", error.message);
        throw error;
    }
}


const btnEliminarMiembro = document.getElementById('btnEliminarMiembro');
const inputDeleteMemberUserId = document.getElementById('deleteMemberUserIdInput');
const txtDeleteMemberEstado = document.getElementById('mensajeDeleteMemberEstado');


btnEliminarMiembro.addEventListener('click', async () => {
    const teamId = inputTeamId.value;
    const userId = inputDeleteMemberUserId.value;

    if (!userId) {
        txtDeleteMemberEstado.style.color = "black";
        txtDeleteMemberEstado.innerText = "Por favor, proporciona el ID del usuario que deseas remover.";
        return;
    }

    
    const seguro = confirm(`¿Estás seguro de que deseas remover al usuario ID ${userId} de este equipo?`);
    if (!seguro) return;

    txtDeleteMemberEstado.style.color = "black";
    txtDeleteMemberEstado.innerText = "Removiendo miembro de la API...";

    try {
       
        const resultado = await removerMiembroDeEquipo(teamId, userId);

        txtDeleteMemberEstado.style.color = "red";
        txtDeleteMemberEstado.innerText = `¡Éxito! El usuario ID ${resultado.userId} fue revocado de su rol de "${resultado.role}" en este equipo.`;
        
        
        inputDeleteMemberUserId.value = '';

    } catch (error) {
        txtDeleteMemberEstado.style.color = "red";
        txtDeleteMemberEstado.innerText = `Error al remover: ${error.message}`;
    }
});


class LocalMemberPutRequest {
    constructor(role) {
        this.role = role;
    }

    toJson() {
        return {
            role: this.role
        };
    }
}

async function actualizarRolDeMiembro(teamId, userId, localMemberPutRequest) {
    try {
        if (!teamId) throw new Error("El ID del equipo es requerido.");
        if (!userId) throw new Error("El ID del usuario es requerido.");
        if (!localMemberPutRequest) throw new Error("El nuevo rol es requerido.");

       
        const endpointMembersPut = `/Teams/${teamId}/members/${userId}`;
        console.log(`Iniciando petición PUT a: ${teamsService.baseUrl}${endpointMembersPut}`);

      
        const jsonResponse = await teamsService.put(endpointMembersPut, localMemberPutRequest.toJson());
           
        return LocalMemberResponse.fromJson(jsonResponse);

    } catch (error) {
        console.error("Error en la petición PUT de miembros:", error.message);
        throw error;
    }
}


const btnActualizarMiembro = document.getElementById('btnActualizarMiembro');
const inputPutMemberUserId = document.getElementById('putMemberUserIdInput');
const inputPutMemberRole = document.getElementById('putMemberRoleInput');
const txtPutMemberEstado = document.getElementById('mensajePutMemberEstado');


btnActualizarMiembro.addEventListener('click', async () => {
    const teamId = inputTeamId.value; 
    const userId = inputPutMemberUserId.value;
    const role = inputPutMemberRole.value.trim();

    if (!userId || !role) {
        txtPutMemberEstado.style.color = "black";
        txtPutMemberEstado.innerText = "Por favor, completa el ID del usuario y el nuevo rol.";
        return;
    }

    txtPutMemberEstado.style.color = "black";
    txtPutMemberEstado.innerText = "Actualizando rol en la API...";

    try {
       
        const cambioRolRequest = new LocalMemberPutRequest(role);

        
        const resultado = await actualizarRolDeMiembro(teamId, userId, cambioRolRequest);

        txtPutMemberEstado.style.color = "green";
        txtPutMemberEstado.innerText = `¡Éxito! El usuario ID ${resultado.userId} ahora tiene el rol de "${resultado.role}".`;

        
        inputPutMemberUserId.value = '';
        inputPutMemberRole.value = '';

    } catch (error) {
        
        txtPutMemberEstado.style.color = "red";
        txtPutMemberEstado.innerText = `Error al actualizar: ${error.message}`;
    }
});