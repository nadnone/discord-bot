import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS, SERVERSLISTFILE } from '../../tools/constants.js';
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
            
            let servers = await db.read(SERVERSLISTFILE);
            
            for (let server of servers) {

                if (choice)
                {
                    if (server.id === interaction.guildId)
                    {
                        server.hasThreads = true;
                        server.threads.push(channel.id);
                        await db.erase(JSON.stringify(servers), SERVERSLISTFILE);
                        await interaction.reply("Channel added");
                        return
                    }
                }
                else if (server.id === interaction.guildId && server.hasThreads)
                {
                        
                    if (server.id === interaction.guildId)
                    {
                        const i = server.threads.indexOf(channel.id);
                        server.threads.splice(i, 1);
                        if (server.threads.length <= 0) server.hasThreads = false;
                        await db.erase(JSON.stringify(servers), SERVERSLISTFILE);
                        await interaction.reply("Channel removed");
                        return
                    }
                }
            }

            await interaction.reply("Rien à faire");

          
        }
        catch (e) 
        {
            console.log(`Erreur : ${e.message} -> warnlist.js`);
            
        }

	},
};