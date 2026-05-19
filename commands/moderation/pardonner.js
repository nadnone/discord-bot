import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';
import warnslist from '../../data/warns.json' with {type: "json"}
import { exec } from 'node:child_process';
import warnUser from '../../tools/warn.js';
import pardon from '../../tools/pardon.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('pardonner')
			.setDescription("pardonner un membre")
			.addUserOption(option =>
				option.setName("cible")
					.setDescription("Le membre que vous voulez pardonner")
					.setRequired(true)
			)
			.addStringOption(option => 
				option.setName("raison")
					.setDescription("Le motif du pardon")
					.setRequired(true)
			),

	async execute(interaction) {

        try {
            const cible = interaction.options.getUser('cible')
            const motif = interaction.options.getString('raison');
    
            pardon(cible, motif);
    
            await interaction.reply(`${cible} Tu es pardonné (motif: ${motif})`);

        }
        catch (e) 
        {
            console.log(`Erreur : ${e.message} -> pardonner.js`);
            
        }

	},
};