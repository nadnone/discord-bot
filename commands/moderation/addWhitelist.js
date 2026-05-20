import { ChannelType } from 'discord-api-types/v9';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS, WARNJSONFILE, WHITELISTFILE } from '../../tools/constants.js';
import warnUser from '../../tools/warn.js';
import pardon from '../../tools/pardon.js';
import fs from 'node:fs';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('whitelist')
			.setDescription("Ajouter un lien à la whitelist pour éviter que je warn")
			.addStringOption(option =>
				option.setName("lien")
					.setDescription("Le lien à mettre dans la whitelist")
					.setRequired(true)
			),
	async execute(interaction) {

        try {

            const lien = interaction.options.getString('lien')
            let list =  JSON.parse(await fs.readFileSync(WHITELISTFILE));


            const doublon = list.filter(el => el.includes(lien));

            if (doublon.length > 0)
            {
                interaction.reply("Lien déjà existant dans la whitelist.")
                return
            }

            list.push(lien);

            await fs.writeFileSync(WHITELISTFILE, JSON.stringify(list));

            interaction.reply("Lien ajouté");
        }
        catch (e) 
        {
            console.log(`Erreur : ${e.message} -> warnlist.js`);
            
        }

	},
};