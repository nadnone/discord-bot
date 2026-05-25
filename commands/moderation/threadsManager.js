import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS, SERVERSLISTFILE } from '../../tools/constants.js';
import warnUser from '../../tools/warn.js';
import pardon from '../../tools/pardon.js';
import fs from 'node:fs';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('threadsmanager')
			.setDescription("Ajouter un supprimer un salon à fils")
			.addChannelOption(option =>
				option.setName("channel")
                .setDescription("Le salon que tu souhaites ajouter ou supprimer")
                .setRequired(true)
			).addBooleanOption(option => 
                option.setName("choix")
                .setDescription("True : Ajouter, False: Supprimer")
                .setRequired(true)
            ),
	async execute(interaction, db) {

        try {

            const choice = interaction.options.getBoolean("choix");
            const channel = interaction.options.getChannel("channel");
            const serverID = interaction.guildId.toString();

            const lang = db.get_servers(DB_SERVERS_KEYS.language, serverID);

            let config = null;
            if (lang.language === "FR")
                config = await db.read(LANG_FR_CONFIG);
            else
                config = await db.read(LANG_EN_CONFIG);

            
            let rawdata = await db.get_servers(DB_SERVERS_KEYS.threads, await interaction.guildId);

            // traitement de donnée (TODO à revoir)
            let threads = rawdata.threads;
            if (threads == null) threads = [];
            while (typeof threads === "string") {
                threads = JSON.parse(threads)
            }

            const alreadyExist = threads.includes(channel.id)
            
            if (choice && !alreadyExist)
            {
                
                threads.push(channel.id);

                await db.update_servers(DB_SERVERS_KEYS.threads, JSON.stringify(threads), await interaction.guildId);
                await interaction.reply(config.channelAdded);
                return
            }
            else if (!choice && alreadyExist)
            {
                threads = threads.filter(t => t !== channel.id);
                await db.update_servers(DB_SERVERS_KEYS.threads, JSON.stringify(threads), await interaction.guildId);
                await interaction.reply(config.channelRemoved);
                return

            }

            await interaction.reply(config.nothingToDo);

          
        }
        catch (e) 
        {
            console.log(`Erreur : ${e} -> threadsManager.js:execute()`);
            
        }

	},
};