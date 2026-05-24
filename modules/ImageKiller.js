import { ActivityType, MessageFlags } from "discord.js";
import warnUser from "../tools/warn.js";
import fs from "node:fs";
import { BLACKLISTFILE, BLACKLISTSFWFILE, DB_SERVERS_KEYS, WHITELISTFILE } from "../tools/constants.js";

export default class LinkAssassin {

    constructor(db) {
        this.db = db
    }
    

    async check(interaction, presence)
    {

        const serverID = await interaction.guildId.toString();
        const channelId = await interaction.channelId.toString();
        const enabled = await this.db.get_servers(DB_SERVERS_KEYS.imageKiller, serverID);


       
    }

}
   