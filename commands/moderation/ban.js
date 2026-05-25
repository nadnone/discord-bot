import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS } from '../../tools/constants.js';
import banUser from '../../tools/ban.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('ban')
			.setDescription("Bannir un membre (experimental)")
			.addUserOption(option =>
				option.setName("cible")
					.setDescription("Le membre que vous voulez bannir")
					.setRequired(true)
			)
			.addStringOption(option => 
				option.setName("raison")
					.setDescription("Le motif du ban")
					.setRequired(true)
			),

	async execute(interaction, db) {

		try {
			
			const cible = await interaction.options.getUser('cible')
			const motif = await interaction.options.getString('raison');
			const serverID = await interaction.guildId.toString();

			const lang = db.get_servers(DB_SERVERS_KEYS.language, serverID)

			let config = null;
			if (lang === "FR")
				config = db.read(LANG_FR_CONFIG);
			else 
				config = db.read(LANG_EN_CONFIG);


			await interaction.reply(`${cible} ${config.bannedReply} ${motif})`);
			banUser(cible, motif, interaction);
	
			await interaction.followUp("Ba-ba-ba ba-ba-ba BANNED !");
			
		} catch (e) {
			console.log(`Erreur: ${e.message} -> ban.js`);
			
		}

	},
};