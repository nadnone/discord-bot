import { ThreadAutoArchiveDuration } from 'discord.js';
import { SERVERSLISTFILE } from '../tools/constants.js'

export default class ThreadsManager {

    constructor(servers, db)
    {
        this.servers = servers;
        this.db = db;
    }

    async check(interaction, activityPresence) {

        this.servers = await this.db.read(SERVERSLISTFILE)

        const server = this.servers.find(s=> s.id === interaction.guildId); // TODO, faire un fichier à part
        if (server == null) return // si le serveur n'est pas enregistré, pas de fonctions suivantes
        if (!server.hasThreads) return // s'il n'y a aucun threads activé

        const chanId = server.threads.find(c => c === interaction.channel.id);
        if (chanId == null) return // si le salon n'est pas dans la liste

        // on récupère le dernier message pour controle
        const lastmessage = await interaction.channel.lastMessage;

        // si déjà un thread ou si c'est un bot
        if (await lastmessage.hasThreads || await lastmessage.author.bot) return 

        if (server.language === "FR"){

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