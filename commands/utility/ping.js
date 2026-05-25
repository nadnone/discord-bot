import { SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, PERMISSIONS } from '../../tools/constants.js';

export default {
	permissions: PERMISSIONS.USERS,
	data: new SlashCommandBuilder().setName('ping').setDescription('Pour tester si je suis vivant'),
	async execute(interaction, db) {

		try {

			const lang = db.get_servers(DB_SERVERS_KEYS.language, await interaction.guildId.toString());
			if (lang == null) return


			if (lang.language === "FR")
				await interaction.reply('JE SUIS VIVANT (v1.0)!');
			else
				await interaction.reply("I'm alive ! (v1.0)")
			
		} catch (e) {
			console.log(`Erreur : ${e.message} -> ping.js`);
			
		}
	},
};