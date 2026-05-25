import { ChannelType } from 'discord-api-types/v9';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS, SUPPORTED_MIMETYPE } from '../../tools/constants.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('imagekiller')
			.setDescription("Gérer le service ImageKiller")
			.addBooleanOption((option) =>
				option.setName("enable")
					.setDescription("True: Activer, False, Désactiver")
					.setRequired(true))
			.addChannelOption(option =>
				option.setName("channel")
				.setDescription("Salon sur lequel la règle sera appliquée")
				.setRequired(false))
			.addStringOption(option => 
				option.setName("type")
					.setDescription("Type de fichiers, exemple: video, image, application (type MIME)")
					.setRequired(false)),

    async execute(interaction, db) {

		try {

            const enabled = await interaction.options.getBoolean("enable");
            const channel = await interaction.options.getChannel("channel")
            const type = await interaction.options.getString("type")
            const serverID = await interaction.guildId.toString();
			const lang = db.get_servers(DB_SERVERS_KEYS.language, serverID);

			let config = null;
			if (lang.language === "FR")
				config = await db.read(LANG_FR_CONFIG);
			else
				config = await db.read(LANG_EN_CONFIG);

			if (type == null)
				interaction.reply(config.missingType)

			let mimetype = type.replaceAll(" ", "").trim().split(",");

			for (const el of mimetype) {

				if (!SUPPORTED_MIMETYPE.includes(el) && enabled)
				{
					await interaction.reply(`type ${el} ${config.notSupported}`);
					return
				}
			}

			
			if (channel == null && enabled) 
			{
				await interaction.reply(config.missingChannel);
				return
			}
			else if (!enabled) 
			{
				await db.remove_images_rule(serverID);
                await interaction.reply({content: config.disabled, flag: MessageFlags.Ephemeral});
				return
			}
8
			mimetype = JSON.stringify(mimetype);

			db.insert_new_images_rules(mimetype, channel.id.toString(), serverID);
			db.update_servers(DB_SERVERS_KEYS.imagesKiller, enabled ? 1 : 0, serverID);

			await interaction.reply({content: config.enabled, flag: MessageFlags.Ephemeral});
			
		} catch (e) {
			console.log(`Erreur : ${e} -> cmds/imagesKiller.js`);
		}
		
		
	},
};