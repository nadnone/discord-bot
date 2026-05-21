import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DATABASE_KEYS, PERMISSIONS, SERVERSLISTFILE } from '../../tools/constants.js';
import warnUser from '../../tools/warn.js';
import pardon from '../../tools/pardon.js';
import fs from 'node:fs';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('threadsmanager')
			.setDescription("Add or remove a threads channel")
			.addChannelOption(option =>
				option.setName("channel")
                .setDescription("the channel you want to add or remove")
                .setRequired(true)
			).addBooleanOption(option => 
                option.setName("choix")
                .setDescription("true : add, false: remove")
                .setRequired(true)
            ),
	async execute(interaction, db) {

        try {

            const choice = interaction.options.getBoolean("choix");
            const channel = interaction.options.getChannel("channel");
            
            let rawdata = await db.get_servers_info(DATABASE_KEYS.threads, await interaction.guildId);

            // traitement de donnée (TODO à revoir)
            let threads = JSON.parse(JSON.parse(rawdata.threads)); 

            const alreadyExist = threads.includes(channel.id)
            
            
            if (choice && !alreadyExist)
            {
                threads.push(channel.id);

                await db.update_servers_info(DATABASE_KEYS.threads, JSON.stringify(JSON.stringify(threads)), await interaction.guildId);
                await interaction.reply("Channel added");
                return
            }
            else if (!choice && alreadyExist)
            {
                threads = threads.filter(t => t !== channel.id);
                await db.update_servers_info(DATABASE_KEYS.threads, JSON.stringify(JSON.stringify(threads)), await interaction.guildId);
                await interaction.reply("Channel removed");
                return

            }

            await interaction.reply("Rien à faire");

          
        }
        catch (e) 
        {
            console.log(`Erreur : ${e} -> threadsManager.js:execute()`);
            
        }

	},
};