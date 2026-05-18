import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder().setName('purge')
			.setDescription("Purge les messages d'un membre")
			.addUserOption((option) =>
				option.setName("cible")
					.setDescription("Le membre que vous vous purger")
					.setRequired(true)
			),

	async execute(interaction) {

		await interaction.reply('Scanning of messages...');


		const interval = setInterval(async () => {
			
			const channels = await interaction.guild.channels.fetch();
			const textChannels = await channels.filter(chan => chan.type === ChannelType.GuildText);

			textChannels.forEach( async (chan) => {
				
				const msgs = await chan.messages.fetch({
					limit: 100,
					cache: false
				}).then(async (msg) => await msg.filter(m => m.author.id === interaction.options.getUser("cible").id))
				.catch((e) => {

					console.log(e);
					clearInterval(interval)
					
				})

				msgs.forEach(async (msg) => {

					if (msg == null) {
						interaction.reply("Messages supprimés");						
						clearInterval(interval);
					}
					msg.delete();
				});

			});
			
		}, 1000);
		
	
	},
};