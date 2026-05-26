import { ThreadAutoArchiveDuration } from 'discord.js';
import {  DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG } from '../tools/constants.js'

export default class ThreadsManager {

    constructor(servers, db)
    {
        this.servers = servers;
        this.db = db;
    }

    async check(interaction, activityPresence) {

        let raw_threads = await this.db.get_servers(DB_SERVERS_KEYS.threads, await interaction.guildId.toString());
        const lang = await this.db.get_servers(DB_SERVERS_KEYS.language, await interaction.guildId.toString());
        if (raw_threads == null) return

        const threads = raw_threads.threads

        // si pas inclu dans la liste, alors on passe
        if (!threads.includes(await interaction.channel.id)) return

        // on récupère le dernier message pour controle
        const lastmessage = await interaction.channel.lastMessage;
        

        // si déjà un thread ou si c'est un bot
        if (await lastmessage.hasThreads || await lastmessage.author.bot) return 
        
        // si ce n'est pas une fichier ou un lien
        if (lastmessage.attachments.size <= 0 && !lastmessage.content.toString().match("https|http|ftp|ftps")) return


        let config = null
        if (lang.language === "FR")
            config = await this.db.read(LANG_FR_CONFIG)
        else
            config = await this.db.read(LANG_EN_CONFIG)


        await interaction.channel.threads.create({
            name: config.thread_title,
            autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
            reason: config.thread_title,
        });

        
    }
}