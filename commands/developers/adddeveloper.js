import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';
import { logout, main } from '../../main.js';
import { exec } from 'node:child_process';
import { stderr, stdout } from 'node:process';

import developer_list from '../../config/developers.json' with {type: "json"}

export default {
    permissions: PERMISSIONS.DEVELOPERS,
	data: new SlashCommandBuilder()
        .setName('addopt')
        .setDescription('Ajouter un développeur du bot')
        .addUserOption(option =>
	        option.setName("operateur")
                .setDescription("Le membre à mettre dev")
                .setRequired(true)
		),
	async execute(interaction) {
      
    
		const cible = interaction.options.getUser('operateur')


        if (developer_list.includes(cible.id))
        {
            interaction.reply("Ce membre est déjà opérateur !")
            return
        }

        developer_list.push(cible.id.toString());

        await exec(`echo ${JSON.stringify(developer_list)} > ./config/developers.json`, (error) => {

            if (error) {
                interaction.followUp("Erreur !")    
                console.log(error.message);
                return
            }
                
        });

        interaction.reply("J'ajoute ce membre :saluting_face:");

    },
};