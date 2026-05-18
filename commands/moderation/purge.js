import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';

export default {
	permissions: "moderators",
	data: new SlashCommandBuilder().setName('purge')
			.setDescription("Purge les messages d'un membre")
			.addUserOption((option) =>
				option.setName("cible")
					.setDescription("Le membre que vous voulez purger")
					.setRequired(true)
			),

	async execute(interaction) {

		await interaction.reply('Suppressions des messages...');

		const interval = await setInterval(async () => {
			
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
					return
				})

				msgs.forEach(async (msg) => {
					await msg.delete().catch(e => console.log(`Erreur code: ${e.code} -> purge.js`));
				});

			
				if (msgs.size < 1) 
				{
					clearInterval(interval)
				}
			});
			
		}, 5500);
		

	},
};