import { ActivityType } from "discord.js";
import blacklist_links from '../config/blacklist.json' with {type: "json"}
import whitelist_list from '../config/whitelist.json' with {type: "json"}
import warnUser from "../tools/warn.js";
import fs from "node:fs";
import { ALLOWERBARDWORDSFILE, BADWORDS_LIST_API, BLACKLISTFILE } from "../tools/constants.js";

export default class SwearsChecker {

    constructor() {

        this.allowedbWords = null;
        this.blacklist = null;
        console.log(this.blacklist);
        this._init();
    }

    async _init() {
        this.blacklist = await (await fetch(BADWORDS_LIST_API)).text()
        this.blacklist = await this.blacklist.toString().split("\n");
        this.allowedbWords = JSON.parse(await fs.readFileSync(ALLOWERBARDWORDSFILE));
        
    }

    async check(interaction, presence)
    {

        let words = interaction.content.toLowerCase();

        words = words.trim().split(" ");

        presence.set("Verifie un mot è_é", ActivityType.Watching);

        for (const word of words)
        {
            const rslt = await this.blacklist.filter(bw => bw === word.toLowerCase());
            if (rslt.length < 1) continue

            const allowed = await this.allowedbWords.filter(aw => aw === rslt.join(""))
            if (allowed.length > 0) continue

            if (rslt.length > 0)
            {
                warnUser(interaction.member, "Insulte non familière detectée", interaction)
                await interaction.reply("Une insulte = un warn (:");
                await interaction.delete();
                return;
            }
        }


            

    }

}
   