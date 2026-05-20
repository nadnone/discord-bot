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
	async execute(interaction) {

        try {

            const lien = interaction.options.getString('lien')
            let list =  JSON.parse(await fs.readFileSync(WHITELISTFILE));

            list =  list.filter(l => !l.includes(lien))

            await fs.writeFileSync(WHITELISTFILE, JSON.stringify(list));

            interaction.reply("Lien retiré");
        }
        catch (e) 
        {
            console.log(`Erreur : ${e.message} -> warnlist.js`);
            
        }

	},
};