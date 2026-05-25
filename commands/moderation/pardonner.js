import { ChannelType } from 'discord-api-types/v9';
import { SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS } from '../../tools/constants.js';
import { exec } from 'node:child_process';
import warnUser from '../../tools/warn.js';
import pardon from '../../tools/pardon.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('pardonner')
			.setDescription("pardonner un membre")
			.addUserOption(option =>
				option.setName("cible")
					.setDescription("Le membre que vous voulez pardonner")
					.setRequired(true)
			)
			.addStringOption(option => 
				option.setName("raison")
					.setDescription("Le motif du pardon")
					.setRequired(true)
			),

	async execute(interaction, db) {

		let config = null;
        try {
            const cible = interaction.options.getUser('cible')
            const motif = interaction.options.getString('raison');
			const lang = db.get_servers(DB_SERVERS_KEYS.language, await interaction.guildId.toString());

		
            pardon(cible, await interaction.guildId.toString(), db);
    		
			if (lang.language === "FR")
				config = await db.read(LANG_FR_CONFIG);
			else 
				config = await db.read(LANG_EN_CONFIG);
				
			await interaction.reply(`${cible} ${config.pardonned} ${motif})`);
        }
        catch (e) 
        {
            console.log(`Erreur : ${e.message} -> pardonner.js`);
            
        }

	},
};