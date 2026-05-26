import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS } from '../../tools/constants.js';
import banUser from '../../tools/ban.js';

export default {
	permissions: PERMISSIONS.SUPER_MODERATOR,
	data: new SlashCommandBuilder().setName('gracier')
			.setDescription("Gracier un membre banni (experimental)")
			.addUserOption(option =>
				option.setName("cible")
					.setDescription("Le membre que vous voulez gracier")
					.setRequired(true)
			)
			.addStringOption(option => 
				option.setName("raison")
					.setDescription("Le motif de la grâce")
					.setRequired(true)
			),

	async execute(interaction, db) {

		try
		{
			const cible = interaction.options.getUser('cible')
			const motif = interaction.options.getString('raison')
			const serverID = await interaction.guildId.toString();
			const lang = db.get_servers(DB_SERVERS_KEYS.language, serverID)

			let config = null;
			if (lang === "FR")
				config = await db.read(LANG_FR_CONFIG);
			else 
				config = await db.read(LANG_EN_CONFIG);

			await interaction.reply(`${cible} ${config.unbanReply} ${motif})`);
	
			await interaction.guild.members.unban(cible, motif);
		}
		catch (e) 
		{
			console.log(`Erreur: ${e} -> gracier.js`);
			
		}
	},
};