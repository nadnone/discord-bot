import { ThreadAutoArchiveDuration } from 'discord.js';
import { DATABASE_KEYS, SERVERSLISTFILE } from '../tools/constants.js'

export default class ThreadsManager {

    constructor(servers, db)
    {
        this.servers = servers;
        this.db = db;
    }

    async check(interaction, activityPresence) {

        let raw_threads = await this.db.get_servers_info(DATABASE_KEYS.threads, await interaction.guildId.toString());
        const lang = await this.db.get_servers_info(DATABASE_KEYS.language, await interaction.guildId.toString());
        if (raw_threads == null) return

        const threads = raw_threads.threads

        
        if (!threads.includes(await interaction.channel.id)) return

        // on récupère le dernier message pour controle
        const lastmessage = await interaction.channel.lastMessage;
        

        // si déjà un thread ou si c'est un bot
        if (await lastmessage.hasThreads || await lastmessage.author.bot) return 
        
        // si ce n'est pas une fichier ou un lien
        if (lastmessage.attachments.size <= 0 && !lastmessage.content.toString().match("https|http|ftp|ftps")) return

        if (lang.language === "FR") {

            await interaction.channel.threads.create({
                name: "Discussion sur l'objet",
                autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
                reason: "Object's thread",
            });

            return

        }
        else {

             interaction.channel.threads.create({
                name: "Object's chat thread",
                autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
                reason: "image's thread",
            });

            return
        }

        
    }
}