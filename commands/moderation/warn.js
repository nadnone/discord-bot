import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';
import { exec } from 'node:child_process';
import warnUser from '../../tools/warn.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('warn')
			.setDescription("warn un membre")
			.addUserOption(option =>
				option.setName("cible")
					.setDescription("Le membre que vous voulez warn")
					.setRequired(true)
			)
			.addStringOption(option => 
				option.setName("raison")
					.setDescription("Le motif du warn")
					.setRequired(true)
			),

	async execute(interaction) {

		
		const cible = interaction.options.getUser('cible')
		const motif = interaction.options.getString('raison');

		await warnUser(cible, motif, await interaction);
 
		await interaction.reply(`${cible} Attention, je t'ai à l'oeil. (motif: ${motif})`);

	},
};