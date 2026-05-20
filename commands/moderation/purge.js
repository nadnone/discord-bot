import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';
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

			await interaction.deferReply();

			const interval = await setInterval(async () => {
				
				const channels = await interaction.guild.channels.fetch();
				const textChannels = await channels.filter(chan => chan.type === ChannelType.GuildText);

				textChannels.forEach( async (chan) => {
					
					const msgs = await chan.messages.fetch({
						limit: 100,
						cache: false
					}).then(async (msg) => await msg.filter(m => m.author.id === interaction.options.getUser("cible").id))
					.catch((e) => {
			
						console.log(`Erreur code : ${e.code} -> purge.js`);
						clearInterval(interval)
					})

					if (msgs.size < 1) {
						await interaction.followUp("Tâches terminée");
					}
					
					msgs.forEach(async (msg) => {
						await msg.delete().catch(e => {
							console.log(`Erreur code: ${e.code} -> purge.js`)
							clearInterval(interval)
						});
					});

				
					if (msgs.size < 1) 
					{
						clearInterval(interval)
					}
				});

				
			}, 2_500);
			
		} catch (e) {
			console.log(`Erreur : ${e.message} -> purge.js`);
			
		}


		
	},
};