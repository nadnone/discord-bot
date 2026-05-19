import { ChannelType } from 'discord-api-types/v9';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS, WARNJSONFILE } from '../../tools/constants.js';
import warnslist from '../../data/warns.json' with {type: "json"}
import warnUser from '../../tools/warn.js';
import pardon from '../../tools/pardon.js';
import fs from 'node:fs';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('warnlist')
			.setDescription("list des warns d'un membre")
			.addUserOption(option =>
				option.setName("cible")
					.setDescription("Le membre que vous voulez observer")
					.setRequired(true)
			),
	async execute(interaction) {

        try {

            const cible = interaction.options.getUser('cible')
    
            const list =  JSON.parse(await fs.readFileSync(WARNJSONFILE));
            const warns = await list.filter((el) => el.cible === cible.id);

            let response = new EmbedBuilder()
                            .setColor(0x4D4D47)
                            .setTitle(`Liste des warns`)
                            .setDescription("La liste de toutes les bétises qu'a fait la personne demandée")
                            .setFields()
                            .setAuthor({name: 'nadnone', url: 'https://nadnone.github.io'})
                            .setTimestamp();
    
            for (let i = 0; i < warns.length; i++) {
                
                const warn = warns[i];

                response.addFields({ name: `motif n°${i+1}`, value: warn.raison, inline: false })
            }

            await interaction.reply({ embeds: [response] });

        }
        catch (e) 
        {
            console.log(`Erreur : ${e.message} -> warnlist.js`);
            
        }

	},
};