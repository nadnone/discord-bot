import { ChannelType } from 'discord-api-types/v9';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { DATABASE_KEYS, PERMISSIONS } from '../../tools/constants.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('linkassassin')
			.setDescription("Manage the links checker")
			.addBooleanOption((option) =>
				option.setName("enable")
					.setDescription("True: enable, False, disable")
					.setRequired(true)),

    async execute(interaction, db) {

		try {

            const enabled = interaction.options.getBoolean("enable");
            const serverID = interaction.guildId.toString();

            await db.update_servers_info(DATABASE_KEYS.linkAssassin, enabled ? 1 : 0, serverID);

            if (enabled)
                await interaction.reply({content: "enabled", flag: MessageFlags.Ephemeral});
            else 
                await interaction.reply({content: "disabled", flag: MessageFlags.Ephemeral});
			
		} catch (e) {
			console.log(`Erreur : ${e.message} -> linkAssassin.js`);
		}
		
		
	},
};