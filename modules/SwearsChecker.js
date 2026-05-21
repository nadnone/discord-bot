import { ActivityType } from "discord.js";
import warnUser from "../tools/warn.js";
import fs from "node:fs";
import { ALLOWERBARDWORDSFILE, BADWORDS_LIST_API_EN, BADWORDS_LIST_API_FR } from "../tools/constants.js";

export default class SwearsChecker {

    constructor(servers, db) {
        this.servers = servers;
        this.allowedbWords = null;
        this.blacklist = null;
        this.db = db
        this._init();
    }

    async _init() {
        this.blacklist_FR = await (await fetch(BADWORDS_LIST_API_FR)).text()
        this.blacklist_EN = await (await fetch(BADWORDS_LIST_API_EN)).text()
        
        this.blacklist_FR = await this.blacklist_FR.toString().split("\n");
        this.blacklist_EN = await this.blacklist_EN.toString().split("\n");

        this.allowedbWords = JSON.parse(await fs.readFileSync(ALLOWERBARDWORDSFILE));
        
    }

    async check(interaction, presence)
    {
        const server = this.servers.find(s => s.id === interaction.guildId);

        let words = interaction.content.toLowerCase();

        words = words.trim().split(" ");

        if (server.language === "FR"){
            presence.set("Verifie un mot è_é", ActivityType.Watching);
            this.blacklist = this.blacklist_FR
        }
        else 
        {
            presence.set("Check a word è_é", ActivityType.Watching);
            this.blacklist = this.blacklist_EN;
        } 


        for (const word of words)
        {
            const rslt = await this.blacklist.filter(bw => bw === word.toLowerCase());
            if (rslt.length < 1) continue

            const allowed = await this.allowedbWords.filter(aw => aw === rslt.join(""))
            if (allowed.length > 0) continue

            if (rslt.length > 0 && server.language === "FR")
            {
                warnUser(interaction.member, `Insulte non familière detectée ${word}`, interaction, this.db)
                await interaction.reply("Une insulte = un warn (:");
                await interaction.delete();
                return true;
            }
            else if (rslt.length > 0 && server.language === "EN")
            {
                warnUser(interaction.member, `A swear detected ${word}`, interaction, this.db)
                await interaction.reply("A swear = a warn (:");
                await interaction.delete();
                return true;
            }
        }




        return false;
    }

}
   