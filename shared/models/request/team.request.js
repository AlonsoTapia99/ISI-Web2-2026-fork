export default class TeamRequest {
    name = '';
    description = '';

    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    toJson() {
        return {
            name: this.name,
            description: this.description
        };
    }
} 