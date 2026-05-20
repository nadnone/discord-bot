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

			const channels = await interaction.guild.channels.fetch();
			const textchannel = await interaction.channel
			
			const msgs = await textchannel.messages.fetch({
				limit: parseInt(interaction.options.getString("nombre")),
				cache: false
			}).then(async (msg) => await msg.filter(m => m.author.id === interaction.options.getUser("cible").id))
			.catch((e) => {
				console.log(`Erreur code : ${e} -> purge.js`);
			})

			await msgs.forEach(async (msg) => {
				await msg.delete().catch(e => {
					console.log(`Erreur code: ${e} -> purge.js`)
				});
			});

	
		} catch (e) {
			console.log(`Erreur : ${e.message} -> purge.js`);
			
		}
		finally {
			interaction.followUp("Tâche terminée");
		}
		
	},
};