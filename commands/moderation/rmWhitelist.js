import { ChannelType } from 'discord-api-types/v9';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DATABASE_KEYS, PERMISSIONS, WARNJSONFILE, WHITELISTFILE } from '../../tools/constants.js';
import warnUser from '../../tools/warn.js';
import pardon from '../../tools/pardon.js';
import fs from 'node:fs';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('rmwhitelist')
			.setDescription("Delete a link from your whitelist")
			.addStringOption(option =>
				option.setName("lien")
					.setDescription("link to remove")
					.setRequired(true)
			),
	async execute(interaction, db) {

        try {
            const serverID =  await interaction.guildId.toString();
            const lien = interaction.options.getString('lien')
            let list = await db.get_servers_info(DATABASE_KEYS.whitelist, serverID);
            if (list == null) throw "Erreur interne";
            list = JSON.parse(list.whitelist);

            if (!list.includes(lien)) 
            {
                await interaction.reply("Lien non existant")
                return
            }

            list = list.filter(l => !l.includes(lien))

           

            await db.update_servers_info(DATABASE_KEYS.whitelist, JSON.stringify(list), serverID);

            await interaction.reply("Lien retiré");
        }
        catch (e) 
        {
            console.log(`Erreur : ${e.message} -> rmwhitelist.js`);
        }

	},
};