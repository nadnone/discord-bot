import { Events } from "discord.js";
import Address_checker from '../modules/Address_checker.js';
import QuoiFeurDetector from "../modules/QuoiFeurDetector.js";
import SwearsChecker from "../modules/SwearsChecker.js";
import fs from 'node:fs';
import { SERVERSLISTFILE } from "../tools/constants.js";
import ThreadsManager from "../modules/ThreadsManager.js";
import Database from "../tools/Database.js";

export default class MessagesManager {

    constructor(db) {
        this.db = db;

        this.servers = JSON.parse(fs.readFileSync(SERVERSLISTFILE));

        this.addr_checker = new Address_checker(this.servers, this.db);
        this.quoifeurDetector = new QuoiFeurDetector(this.servers);
        this.swearsChecker = new SwearsChecker(this.servers, this.db);
        this.threadsManager = new ThreadsManager(this.servers, this.db);
    }

    eventLoop(client, activityPresence, db) {

        client.on(Events.MessageCreate, async (interaction) => {

            const server = this.servers.find(s=> s.id === interaction.guildId);
            if (server == null) return // si le serveur n'est pas enregistré, pas de fonctions suivantes

            let bad = this.addr_checker.check(interaction, activityPresence);
            bad &= this.swearsChecker.check(interaction, activityPresence);
            
            if (bad === true) return;
            
            this.quoifeurDetector.check(interaction, activityPresence);
            this.threadsManager.check(interaction, activityPresence);
        });
    
    
    }
    
}