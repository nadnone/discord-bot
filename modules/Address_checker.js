import { Resolver } from "node:dns";
import { ActivityType } from "discord.js";
import blacklist_links from '../config/blacklist.json' with {type: "json"}

export default class Address_checker {

    constructor() {

        this.blacklist = []
        this._init();
    }
    
    async _init()
    {
         for (let i = 0; i < blacklist_links.length; i++) {
        
            const list = blacklist_links[i];
            
            let text = await fetch(list);
            if (!text.ok)
                console.log(`${list} : fetch error`);
            
            this.blacklist.push(await text.text())

        }
        
    }

    async check(interaction, presence)
    {

        let nude_link = interaction.content;

        if (!nude_link.match("https|http|ftp|ftps")) return; // si c'est pas un lien HTTP ou FTP on passe.

        nude_link = nude_link
            .replace("http:", "")
            .replace("https:", "")
            .replaceAll("\/", "")
            .trim();        

        presence.set("Verifie un lien è_é", ActivityType.Watching);

        for (const el of this.blacklist)
        {
            const rsltStr = await el.toString()

            const rslt = rsltStr
                        .replaceAll("|", "")
                        .replaceAll("/", "")
                        .replaceAll("^", "")
                        .trim()
        
                                                        
            if (rslt.includes(nude_link)) {
                await interaction.reply("Lien bizarre detecté, message supprimé. U_u");
                await interaction.delete();
            }
        }


            

    }

}
   