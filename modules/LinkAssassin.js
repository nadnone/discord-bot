import { ActivityType, MessageFlags } from "discord.js";
import warnUser from "../tools/warn.js";
import fs from "node:fs";
import { BLACKLISTFILE, BLACKLISTSFWFILE, DB_SERVERS_KEYS, WHITELISTFILE } from "../tools/constants.js";

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

        const serverID = await interaction.guildId.toString();
        const channelId = await interaction.channelId.toString();
        const enabled = await this.db.get_servers(DB_SERVERS_KEYS.linkAssassin, serverID);
        if (enabled.linkAssassin !== 1) return false
        
        // check si c'est pareil sur tous le serveur ou non
        let everychannels = false;
        let whitelist = await this.db.get_linkAssassin(serverID, "ALL");
        let locked = false;

        if (whitelist == null)
        {
            locked = true; // on doit bloquer tous les liens
        }
    
        this.blacklist = []; // on clear 

        let nude_link = await interaction.content.toLowerCase();

        if (!nude_link.match("https|http|ftp|ftps")) return false; // si c'est pas un lien HTTP ou FTP on passe.

        if (locked) 
        {
            await interaction.delete();
            return true
        }

        nude_link = nude_link
            .replace("http:", "")
            .replace("https:", "")
            .replaceAll("\/", "")
            .trim()


        const lang = await this.db.get_servers(DB_SERVERS_KEYS.language, serverID);
        const nsfw = await this.db.get_servers(DB_SERVERS_KEYS.nsfw, serverID);


        if (lang.langage === "FR")
            presence.set("Verifie un lien è_é", ActivityType.Watching);
        else 
            presence.set("Checking a link è_é", ActivityType.Watching);


        if (whitelist.addresses === "!ALL")
        {
            locked = true;
            let all = await this.db.get_chan_linkAssassin(serverID, whitelist.addresses);

            if (all == null) throw "bdd error";
            else everychannels = true;                    
        }

        

        if (everychannels && locked)
        {
            await interaction.delete();
            return true
        }
        else if (!locked && whitelist.addresses.includes(nude_link))
        {
            return true;
        }

        // sinon on prend la whitelist par défaut
        whitelist = this.db.read(WHITELISTFILE);
        if (whitelist.includes(nude_link)) return true;


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
                    await interaction.reply({ content: "Lien bizarre detecté, supprimé. U_u, si c'est un faux positif, je te recommande de faire un ticket.",flag: MessageFlags.Ephemeral});
                    await warnUser(interaction.member, `Envoie des liens douteux: ${nude_link}`, interaction, this.db);
                    await interaction.delete();
                    return true
                }
                else if (rslt.includes(nude_link) && lang.language === "EN") {
                    await interaction.reply({content: "Not allowed link detected, if you think I'm wrong, please send a ticket.", flag: MessageFlags.Ephemeral});
                    await warnUser(interaction.member, `Send not allowed link: ${nude_link}`, interactio, this.db);
                    await interaction.delete();
                    return true
                }
        }


            
        return false;
    }

}
   