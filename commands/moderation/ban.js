import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder().setName('ban')
			.setDescription("Bannir un membre membre (experimental)")
			.addUserOption(option =>
				option.setName("cible")
					.setDescription("Le membre que vous vous bannir")
					.setRequired(true)
			)
			.addStringOption(option => 
				option.setName("raison")
					.setDescription("Le motif du ban")
					.setRequired(true)
			),

	async execute(interaction) {

		await interaction.reply('Ba-ba-ba ba-ba-ba BANNED !');
		
		const cible = interaction.options.getUser('cible')
		const motif = interaction.options.getString('raison');

		await interaction.guild.members.fetch((member) => {

			console.log(member);
			
			if (member.author.id === membre.id)
			{
				member.ban({
					deleteMessageSeconds: Infinity,
					reason: motif
				});
			}

		});

	},
};