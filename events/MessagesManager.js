import { Events } from "discord.js";
import Address_checker from '../modules/Address_checker.js';
import QuoiFeurDetector from "../modules/QuoiFeurDetector.js";
import SwearsChecker from "../modules/SwearsChecker.js";
import fs from 'node:fs';
import { SERVERSLISTFILE } from "../tools/constants.js";

export default class MessagesManager {

    constructor() {

        this.servers = JSON.parse(fs.readFileSync(SERVERSLISTFILE));

        this.addr_checker = new Address_checker(this.servers);
        this.quoifeurDetector = new QuoiFeurDetector(this.servers);
        this.swearsChecker = new SwearsChecker(this.servers);
    }

    eventLoop(client, activityPresence) {

        client.on(Events.MessageCreate, async (interaction) => {

            const server = this.servers.find(s=> s.id === interaction.guildId);
            if (server == null) return // si le serveur n'est pas enregistrer, pas de fonctions suivantes

            this.addr_checker.check(interaction, activityPresence);
            this.quoifeurDetector.check(interaction, activityPresence);
            this.swearsChecker.check(interaction, activityPresence);
        });
    }
    
}