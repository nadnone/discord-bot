import fs from "node:fs";
import { DB_SERVERS_KEYS } from "../tools/constants.js";

export default class ImagesKiller {

    constructor(db) {
        this.db = db
    }
    

    async check(interaction, presence)
    {

        const message = await interaction;

        const serverID = await message.guildId.toString();
        const channelId = await message.channelId.toString();;
        
        const enabled = await this.db.get_servers(DB_SERVERS_KEYS.imagesKiller, serverID);
        if (!enabled) return false

        const rules = this.db.get_images_rules(channelId, serverID);
        if (rules == null) return false;


        for (const type of rules.formats) {

            const isImage = await message.attachments.find(c => c.contentType.includes(type)) != null
            if (isImage) 
            {
                await interaction.delete();
                return true;
            }
            
        }

        return false;
    }

}
   