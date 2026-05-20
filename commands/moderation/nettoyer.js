import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('nettoyer')
			.setDescription("Nettoye les messages d'un membre dans un salon donné")
			.addUserOption((option) =>
				option.setName("cible")
					.setDescription("Le membre que vous voulez nettoyer")
					.setRequired(true))
			.addStringOption(option => 
				option.setName("nombre")
				.setDescription("Le nombre max de messages à supprimer (max 100)")
				.setRequired(true))
			,

	async execute(interaction) {

		try {

			await interaction.deferReply();

			let max = parseInt(interaction.options.getString("nombre"));

			const channels = await interaction.guild.channels.fetch();
			const textchannel = await interaction.channel
			
			let interval = setInterval(async () => {
				
				let msgs = await textchannel.messages.fetch({
					limit: 100,
					cache: false 
				})
				
				msgs = await msgs.filter(m => m.author.id === interaction.options.getUser("cible").id);
				
				if (msgs.size <= 0 || msgs == null) clearInterval(interval);

				await msgs.forEach(msg => {

					if (max <= 0) {
						clearInterval(interval);
						return
					} 
					
					if (msg != null)
					{
						msg.delete()
						--max;
					}
				});

			}, 2_500);

		} catch (e) {
			console.log(`Erreur : ${e.message} -> purge.js`);
		}
		finally {
			setTimeout(async () => await interaction.followUp("Tâches terminée"), 500);
		}
		
		
	},
};