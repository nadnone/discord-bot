import { ActivityType } from "discord.js";
import warnUser from "../tools/warn.js";
import fs from "node:fs";
import { BLACKLISTFILE, BLACKLISTSFWFILE, DATABASE_KEYS, WHITELISTFILE } from "../tools/constants.js";

export default class LinkAssassin {

    constructor(servers, db) {
        this.servers = servers;
        this.blacklist = [];
        this.blacklist_sfw = [];
        this.blacklist_nsfw = [];
        this.whitelist = null;
        this.db = db
        this._init();
    }
    
    async _load_list(list_array, output) {
            
        for (const list of list_array) {
            
            let text = await fetch(list);
            if (!text.ok)
                console.log(`${list} : fetch error`);
            
            output.push(await text.text())
        }
    }

    async _init()
    {

        const blacklist_NSFW_array = await this.db.read(BLACKLISTFILE)
        const blacklist_SFW_array = await this.db.read(BLACKLISTSFWFILE)
        this.whitelist = await this.db.read(WHITELISTFILE)

        this._load_list(blacklist_NSFW_array, this.blacklist_nsfw);
        this._load_list(blacklist_SFW_array, this.blacklist_sfw);

    }

    async check(interaction, presence)
    {

        const enabled = await this.db.get_servers_info(DATABASE_KEYS.linkAssassin, await interaction.guildId.toString());
        if (enabled.linkAssassin !== 1) return

        this.blacklist = []; // on clear 

        let nude_link = interaction.content.toLowerCase();

        if (!nude_link.match("https|http|ftp|ftps")) return; // si c'est pas un lien HTTP ou FTP on passe.

        nude_link = nude_link
            .replace("http:", "")
            .replace("https:", "")
            .replaceAll("\/", "")
            .trim()


        const serverID = await this.db.get_servers_info(DATABASE_KEYS.serverID, await interaction.guildId.toString());
        const lang = await this.db.get_servers_info(DATABASE_KEYS.language, await interaction.guildId.toString());
        const nsfw = await this.db.get_servers_info(DATABASE_KEYS.nsfw, await interaction.guildId.toString());


        if (lang.langage === "FR")
            presence.set("Verifie un lien è_é", ActivityType.Watching);
        else 
            presence.set("Checking a link è_é", ActivityType.Watching);



        let allowed = await this.db.get_servers_info(DATABASE_KEYS.whitelist, await interaction.guildId.toString());
        
        if (allowed.whitelist == null) return
        if (allowed.whitelist.includes(nude_link)) return

        if (nsfw.nsfw === 0) // si c'est un Safe for work server
        {
            this.blacklist = this.blacklist_nsfw.concat(this.blacklist_sfw);
        }

        for (const el of this.blacklist)
        {

                const rsltStr = await el.toString()
    
                const rslt = rsltStr
                            .replaceAll("|", "")
                            .replaceAll("/", "")
                            .replaceAll("^", "")
                            .trim()
            
                            
                if (rslt.includes(nude_link) && lang.language === "FR") {
                    await interaction.reply("Lien bizarre detecté, supprimé. U_u, si c'est un faux positif, je te recommande de faire un ticket.");
                    await warnUser(interaction.member, `Envoie des liens douteux: ${nude_link}`, interaction, this.db);
                    await interaction.delete();
                    return true
                }
                else if (rslt.includes(nude_link) && lang.language === "EN") {
                    await interaction.reply("Not allowed link detected, if you think I'm wrong, please send a ticket.");
                    await warnUser(interaction.member, `Send not allowed link: ${nude_link}`, interactio, this.db);
                    await interaction.delete();
                    return true
                }
        }


            
        return false;
    }

}
   