import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DEVELOPERSJSONFILE, PERMISSIONS } from '../../tools/constants.js';
import { logout, main } from '../../main.js';
import { exec } from 'node:child_process';
import { stderr, stdout } from 'node:process';
import fs from 'node:fs';

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
        const developer_list = await fs.readFileSync(DEVELOPERSJSONFILE);


        if (developer_list.includes(cible.id))
        {
            interaction.reply("Ce membre est déjà opérateur !")
            return
        }

        developer_list.push(cible.id.toString());

        try {
            await fs.writeFileSync(DEVELOPERSJSONFILE, JSON.stringify(developer_list));
        }
        catch (e) 
        {
            console.log(`Error code : ${e.code} -> adddevelopers.js`);
        }
    

        interaction.reply("J'ajoute ce membre :saluting_face:");

    },
};