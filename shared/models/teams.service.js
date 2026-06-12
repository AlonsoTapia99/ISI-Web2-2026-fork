import TeamRequest from "../models/request/team.request.js";
import { TeamResponse } from "../models/response/team.response.js";
import HttpService from "./http.service.js";

export default class TeamsService extends HttpService {
    endpoint = '/teams';

    // READ - Obtener todos los equipos
    async get() {
        const json = await super.get(this.endpoint);
        if (json === null) return [];
        if (!Array.isArray(json)) return [];

        const teams = json.map(json => TeamResponse.fromJson(json));
        return teams;
    }

    // READ - Obtener un equipo por ID
    async getById(id) {
        const json = await super.get(`${this.endpoint}/${id}`);
        if (json === null) return null;

        const team = TeamResponse.fromJson(json);
        return team;
    }

    // CREATE - Crear un nuevo equipo
    async create(teamRequest) {
        if (!teamRequest) throw new Error('Team request is required.');
        if (!(teamRequest instanceof TeamRequest)) throw new Error('Invalid team request.');

        const json = await super.post(this.endpoint, teamRequest.toJson());
        return TeamResponse.fromJson(json);
    }

    // UPDATE - Modificar un equipo existente
    async update(id, teamRequest) {
        if (!id) throw new Error('ID requerido para actualizar.');
        if (!teamRequest) throw new Error('Datos requeridos para actualizar.');
        
        const json = await super.put(`${this.endpoint}/${id}`, teamRequest.toJson());
        return TeamResponse.fromJson(json);
    }

    // DELETE - Eliminar un equipo del sistema
    async delete(id) {
        if (!id) throw new Error('ID requerido para eliminar.');
        const json = await super.delete(`${this.endpoint}/${id}`);
        return json;
    }
}