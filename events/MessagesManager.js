import { Events } from "discord.js";
import QuoiFeurDetector from "../modules/QuoiFeurDetector.js";
import BadwordsDetector from "../modules/BadwordsDetector.js";
import LinkAssassin from "../modules/LinkAssassin.js";
import fs from 'node:fs';
import { DB_SERVERS_KEYS, SERVERSLISTFILE } from "../tools/constants.js";
import ThreadsManager from "../modules/ThreadsManager.js";
import Database from "../tools/Database.js";

export default class MessagesManager {

    constructor(db) {
        this.db = db;

        this.addr_checker = new LinkAssassin(null, this.db);
        this.quoifeurDetector = new QuoiFeurDetector(this.db);
        this.swearsChecker = new BadwordsDetector(null, this.db);
        this.threadsManager = new ThreadsManager(null, this.db);
    }

    eventLoop(client, activityPresence) {

        client.on(Events.MessageCreate, async (interaction) => {

            const server = await this.db.get_servers(DB_SERVERS_KEYS.serverID, await interaction.guildId.toString());
            if (server.serverID == null) return // si le serveur n'est pas enregistré, pas de fonctions suivantes


            let bad = await this.addr_checker.check(interaction, activityPresence) || this.swearsChecker.check(interaction, activityPresence);
            if (bad === true) return;
            
            this.quoifeurDetector.check(interaction, activityPresence);
            this.threadsManager.check(interaction, activityPresence);
        });
    
    
    }
    
}