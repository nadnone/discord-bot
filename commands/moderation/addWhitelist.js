import { ChannelType } from 'discord-api-types/v9';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DATABASE_CHECK, DATABASE_KEYS, PERMISSIONS, WARNJSONFILE, WHITELISTFILE } from '../../tools/constants.js';
import warnUser from '../../tools/warn.js';
import pardon from '../../tools/pardon.js';
import fs from 'node:fs';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('addwhitelist')
			.setDescription("Add a link to your whitelist")
			.addStringOption(option =>
				option.setName("link")
					.setDescription("link to add")
					.setRequired(true)
			),
	async execute(interaction, db) {

        try {

            const lien = interaction.options.getString('lien')
            let list = await db.get_servers_info(DATABASE_KEYS.whitelist, await interaction.guildId.toString());
            if (list == null) list = [];

            list = JSON.parse(list.whitelist);
            
            const doublon = list.includes(lien);

            if (doublon)
            {
                interaction.reply("Lien déjà existant dans la whitelist.")
                return
            }

            list.push(lien);

            await db.update_servers_info(DATABASE_KEYS.whitelist, JSON.stringify(list), await interaction.guildId.toString());
            interaction.reply("Lien ajouté");
        }
        catch (e) 
        {
            console.log(`Erreur : ${e.message} -> addwhitelist.js`);
            
        }

	},
};