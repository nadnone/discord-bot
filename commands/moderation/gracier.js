import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';
import banUser from '../../tools/ban.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('gracier')
			.setDescription("Gracier un membre banni (experimental)")
			.addUserOption(option =>
				option.setName("cible")
					.setDescription("Le membre que vous voulez gracier")
					.setRequired(true)
			)
			.addStringOption(option => 
				option.setName("raison")
					.setDescription("Le motif de la grâce")
					.setRequired(true)
			),

	async execute(interaction) {

		try
		{
			const cible = interaction.options.getUser('cible')
			const motif = interaction.options.getString('raison');
	
			await interaction.reply(`${cible} Je t'accorde la grâce du grand Chat. (motif: ${motif})`);
	
			await interaction.guild.members.unban(cible, motif);
		}
		catch (e) 
		{
			console.log(`Erreur: ${e.message} -> gracier.js`);
			
		}
	},
};