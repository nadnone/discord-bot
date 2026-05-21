import { ChannelType } from 'discord-api-types/v9';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS, WARNJSONFILE, WHITELISTFILE } from '../../tools/constants.js';
import warnUser from '../../tools/warn.js';
import pardon from '../../tools/pardon.js';
import fs from 'node:fs';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('rmwhitelist')
			.setDescription("Supprimer un lien à la whitelist")
			.addStringOption(option =>
				option.setName("lien")
					.setDescription("Le lien à retirer de la whitelist")
					.setRequired(true)
			),
	async execute(interaction, db) {

        try {

            const lien = interaction.options.getString('lien')
            let list = await db.read(WHITELISTFILE)

            list =  list.filter(l => !l.includes(lien))

            await db.erase(JSON.stringify(list), WHITELISTFILE);

            interaction.reply("Lien retiré");
        }
        catch (e) 
        {
            console.log(`Erreur : ${e.message} -> rmwhitelist.js`);
            
        }

	},
};