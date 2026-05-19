import { ActivityType } from "discord.js";

export default class QuoiFeurDetector {

    constructor() {
        this.cooldown = 15; // toutes les 15 fois
    }

    check(interaction, presence) {

        if (interaction.content.match(/[quoi|Quoi]/) != null && --this.cooldown < 0) 
        {
            interaction.reply("FEUR !");
            presence.set("S'amuse", ActivityType.Playing);
            this.cooldown = 15;
        }

    }
}