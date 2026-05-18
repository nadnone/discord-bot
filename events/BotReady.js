import { Events } from "discord.js";
import path from 'node:path';

export default class BotReady {

    constructor(client) {
        this.client = client;
        client.once(Events.ClientReady, (readyClient) => {
            console.log(`Ready! Logged in as ${readyClient.user.tag}`);
        });
    }

}


