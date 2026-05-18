import { ActivityType } from "discord-api-types/v10"

export default class ActivityPresence {

    constructor(client) {
        this.client = client;
    }

    set(nom, type) {
        
        this.client.user.setPresence({
            activities: [{ name: nom, type: type }],
            status: 'online',
        });
    }
}