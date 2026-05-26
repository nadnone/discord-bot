import { ChannelType } from 'discord-api-types/v9';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS } from '../../tools/constants.js';

export default {
	permissions: PERMISSIONS.SUPER_MODERATOR,
	data: new SlashCommandBuilder().setName('badwords')
			.setDescription("Manage the badwords checker")
			.addBooleanOption((option) =>
				option.setName("enable")
					.setDescription("True: Activer, False, Désactiver")
					.setRequired(true)),

    async execute(interaction, db) {

		try {
            const serverID = await interaction.guildId.toString();
			const enabled = await interaction.options.getBoolean("enable");

			
			const lang = db.get_servers(DB_SERVERS_KEYS.language, serverID)
			if (lang == null) return

 			let config
			if (lang.language === "FR")
				config = await db.read(LANG_FR_CONFIG);
			else 
				config = await db.read(LANG_EN_CONFIG);



            await db.update_servers(DB_SERVERS_KEYS.badwords, enabled ? 1 : 0, serverID);

            if (enabled)
                await interaction.reply({content: config.enabled, flag: MessageFlags.Ephemeral});
            else 
                await interaction.reply({content: config.disabled, flag: MessageFlags.Ephemeral});
			
		} catch (e) {
			console.log(`Erreur : ${e.message} -> cmds/badwords.js`);
		}
		
		
	},
};