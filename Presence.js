import { ActivityType } from "discord.js";

export default class Presence {

    constructor(client) {
        this.client = client;
        this.set('Attend un ordre des vizirs', ActivityType.Watching)
    }

    set(nom, type) {
        
        this.client.user.setPresence({
            activities: [{ name: nom, type: type }],
            status: 'online',
        });
    }
}