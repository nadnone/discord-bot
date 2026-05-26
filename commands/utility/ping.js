import { SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS } from '../../tools/constants.js';

export default {
	permissions: PERMISSIONS.USERS,
	data: new SlashCommandBuilder().setName('ping').setDescription('Pour tester si je suis vivant'),
	async execute(interaction, db) {

		try {

			const lang = db.get_servers(DB_SERVERS_KEYS.language, await interaction.guildId.toString());
			if (lang == null) return

			let config = null;
			if (lang.language === "FR")
				config = await db.read(LANG_FR_CONFIG)
			else
				config = await db.read(LANG_EN_CONFIG)

			await interaction.reply(config.ping)
			
		} catch (e) {
			console.log(`Erreur : ${e.message} -> ping.js`);
			
		}
	},
};