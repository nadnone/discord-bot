import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';
import { logout, main } from '../../main.js';
import { exec } from 'node:child_process';

export default {
    permissions: PERMISSIONS.DEVELOPERS,
	data: new SlashCommandBuilder().setName('update').setDescription('Mise à jours du bot'),
	async execute(interaction) {
      
        await interaction.reply("Je me met à jours...");
    
        /* ne fonctionne que sur alpine linux X_X */

        // on update
        await exec(`apk update && apk upgrade && git reset --hard origin/main`, (error) => {

            if (error) {
                interaction.followUp("Erreur !")    
                console.log(error.message);
                return
            }
                
        });

        // on redémarre
        logout(interaction.client);
        main();
    },
};