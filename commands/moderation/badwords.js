import { ChannelType } from 'discord-api-types/v9';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, PERMISSIONS } from '../../tools/constants.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('badwords')
			.setDescription("Manage the badwords checker")
			.addBooleanOption((option) =>
				option.setName("enable")
					.setDescription("True: Activer, False, Désactiver")
					.setRequired(true)),

    async execute(interaction, db) {

		try {

            const enabled = await interaction.options.getBoolean("enable");
            const serverID = await interaction.guildId.toString();

            await db.update_servers(DB_SERVERS_KEYS.badwords, enabled ? 1 : 0, serverID);

            if (enabled)
                await interaction.reply({content: "Activé", flag: MessageFlags.Ephemeral});
            else 
                await interaction.reply({content: "Désactivé", flag: MessageFlags.Ephemeral});
			
		} catch (e) {
			console.log(`Erreur : ${e.message} -> cmds/badwords.js`);
		}
		
		
	},
};