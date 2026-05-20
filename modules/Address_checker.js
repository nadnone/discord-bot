import { ActivityType } from "discord.js";
import warnUser from "../tools/warn.js";
import fs from "node:fs";
import { BLACKLISTFILE, BLACKLISTSFWFILE, WHITELISTFILE } from "../tools/constants.js";

export default class Address_checker {

    constructor(servers) {
        this.servers = servers;
        this.blacklist = [];
        this.blacklist_sfw = [];
        this.whitelist = null;
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

        const blacklist_array = JSON.parse(fs.readFileSync(BLACKLISTFILE));
        const blacklist_SFW_array = JSON.parse(fs.readFileSync(BLACKLISTSFWFILE));
        this.whitelist = JSON.parse(fs.readFileSync(WHITELISTFILE));

        this._load_list(blacklist_array, this.blacklist);
        this._load_list(blacklist_SFW_array, this.blacklist_sfw);

    }

    async check(interaction, presence)
    {

        let nude_link = interaction.content.toLowerCase();

        if (!nude_link.match("https|http|ftp|ftps")) return; // si c'est pas un lien HTTP ou FTP on passe.

        nude_link = nude_link
            .replace("http:", "")
            .replace("https:", "")
            .replaceAll("\/", "")
            .trim()


        const server = await this.servers.find(s => s.id === interaction.guildId);

        if (server.langage === "FR")
            presence.set("Verifie un lien è_é", ActivityType.Watching);
        else 
            presence.set("Looking a link è_é", ActivityType.Watching);



        let allowed = this.whitelist.filter((el) => nude_link.includes(el)).length > 0
        if (allowed) return


        if (!server.NSFW)
        {
            this.blacklist = this.blacklist.concat(this.blacklist_sfw);
            return
        }

        for (const el of this.blacklist)
        {

                const rsltStr = await el.toString()
    
                const rslt = rsltStr
                            .replaceAll("|", "")
                            .replaceAll("/", "")
                            .replaceAll("^", "")
                            .trim()
            
                            
                if (rslt.includes(nude_link) && server.language === "FR") {
                    await interaction.reply("Lien bizarre detecté, supprimé. U_u, si c'est un faux positif, je te recommande de faire un ticket.");
                    await warnUser(interaction.member, `Envoie des liens douteux: ${nude_link}`, interaction);
                    await interaction.delete();
                    return
                }
                else if (rslt.includes(nude_link) && server.language === "EN") {
                    await interaction.reply("Not allowed link detected, if you think I'm wrong, please send a ticket.");
                    await warnUser(interaction.member, `Send not allowed link: ${nude_link}`, interaction);
                    await interaction.delete();
                    return
                }
        }


            

    }

}
   