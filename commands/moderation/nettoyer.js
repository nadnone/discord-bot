import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS } from '../../tools/constants.js';

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

	async execute(interaction, db) {

		let config = null;

		try {

			const lang = db.get_servers(DB_SERVERS_KEYS.language, await interaction.guildId.toString());

			if (lang.language === "FR")
				config = await db.read(LANG_FR_CONFIG);
			else
				config = await db.read(LANG_EN_CONFIG);

			await interaction.reply(config.process);

			let max = parseInt(interaction.options.getString("nombre"));
			const textchannel = await interaction.channel
			
			let interval = setInterval(async () => {
				
				let msgs = await textchannel.messages.fetch({
					limit: 100,
					cache: false 
				})
				
				msgs = await msgs.filter(m => m.author.id === interaction.options.getUser("cible").id && m.content !== config.process);
				
				if (msgs.size <= 0 || msgs == null) clearInterval(interval);

				await msgs.forEach(msg => {

					if (max <= 0) {
						clearInterval(interval);
						return
					} 
					
					if (msg != null && msg.deletable !== false)
					{
						msg.delete().catch(e => {--max})
						--max;
					}
				});

			}, 500);

		} catch (e) {
			console.log(`Erreur : ${e.message} -> nettoyer.js`);
		}
		finally {
			setTimeout(async () => await interaction.followUp(`${await interaction.member}, ${config.finished}`), 500);
		}
		
		
	},
};