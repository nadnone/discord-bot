import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS } from '../../tools/constants.js';
import { exec } from 'node:child_process';
import warnUser from '../../tools/warn.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('warn')
			.setDescription("warn un membre")
			.addUserOption(option =>
				option.setName("cible")
					.setDescription("Le membre que vous voulez warn")
					.setRequired(true)
			)
			.addStringOption(option => 
				option.setName("raison")
					.setDescription("Le motif du warn")
					.setRequired(true)
			),

	async execute(interaction, db) {

		
		const cible = interaction.options.getUser('cible')
		const motif = interaction.options.getString('raison');
		const serverID = interaction.guildId.toString();

		let config = null
		const lang = db.get_servers(DB_SERVERS_KEYS.language, serverID);

		if (lang.language === "FR")
			config = await db.read(LANG_FR_CONFIG);
		else 
			config = await db.read(LANG_EN_CONFIG);

		

		await warnUser(cible, motif, await interaction, db);
 
		await interaction.reply(`${cible} ${config.warning} ${motif})`);

	},
};