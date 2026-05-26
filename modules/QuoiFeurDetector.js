import { ActivityType } from "discord.js";
import { DB_SERVERS_KEYS } from "../tools/constants.js";

export default class QuoiFeurDetector {

    constructor(db) {
        this.db = db
        this.cooldown = 30; // toutes les 30 fois
    }

    check(interaction, presence) {

        const server = this.db.get_servers(DB_SERVERS_KEYS.language, interaction.guildId.toString());
        
        if (server.languange !== "FR") return // si ce n'est pas un serveur francophone, on passe

        if (interaction.content.match(/quoi|Quoi/) != null && --this.cooldown < 0) 
        {
            interaction.reply("FEUR !");
            presence.set("S'amuse", ActivityType.Playing);
            this.cooldown = 15;
        }

    }
}