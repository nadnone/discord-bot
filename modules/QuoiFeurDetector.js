import { ActivityType } from "discord.js";

export default class QuoiFeurDetector {

    constructor(servers) {
        this.servers = servers
        this.cooldown = 15; // toutes les 15 fois
    }

    check(interaction, presence) {

        const server = this.servers.find(s => s.id === interaction.guildId);
        
        if (server.languange !== "FR") return // si ce n'est pas un serveur francophone, on passe

        if (interaction.content.match(/quoi|Quoi/) != null && --this.cooldown < 0) 
        {
            interaction.reply("FEUR !");
            presence.set("S'amuse", ActivityType.Playing);
            this.cooldown = 15;
        }

    }
}