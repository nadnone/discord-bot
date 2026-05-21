import { ChannelType } from 'discord-api-types/v9';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('purge')
			.setDescription("Purge les messages d'un membre")
			.addUserOption((option) =>
				option.setName("cible")
					.setDescription("Le membre que vous voulez purger")
					.setRequired(true)
			),

	async execute(interaction) {

		try {

			await interaction.reply({content: "Please wait..", flag: MessageFlags.Ephemeral})

			let channels = await interaction.guild.channels.fetch();
			let textchannel = await interaction.channel
			
			let interval = setInterval(async () => {
				
				let msgs = await textchannel.messages.fetch({
					limit: 100,
					cache: false 
				})
				
				msgs = await msgs.filter(m => m.author.id === interaction.options.getUser("cible").id);
				
				if (msgs.size <= 0 || msgs == null) clearInterval(interval);

				await msgs.forEach(msg => msg != null ? msg.delete().catch(e => {}) : _);

			}, 3_500);

			
		} catch (e) {
			console.log(`Erreur : ${e.message} -> purge.js`);
			clearInterval(interval);
		}
		
	},
};