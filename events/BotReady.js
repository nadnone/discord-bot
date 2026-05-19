import { Events } from "discord.js";
import path from 'node:path';
import CommitsLogger from "../modules/CommitsLogger.js";

export default class BotReady {

    constructor(client) {
        this.client = client;
        this.commitsLogger = new CommitsLogger();

        client.once(Events.ClientReady, (readyClient) => {
            console.log(`Ready! Logged in as ${readyClient.user.tag}`);

            this.commitsLogger.checkloop(client);
        });

    }
}


