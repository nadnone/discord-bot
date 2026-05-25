import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { GITHUB_REPOSITORY, PERMISSIONS } from '../../tools/constants.js';
import { logout, main } from '../../main.js';
import { exec } from 'node:child_process';
import { exit, exitCode } from 'node:process';
import backup from '../../tools/backup.js';

export default {
    permissions: PERMISSIONS.DEVELOPERS,
	data: new SlashCommandBuilder().setName('update').setDescription('Mise à jours du bot'),
	async execute(interaction, db) {
      
        await interaction.reply("Je me met à jours...");
    
        /* ne fonctionne que sur alpine linux X_X */

        // on update
        await exec(`apk update && apk upgrade && git fetch ${GITHUB_REPOSITORY} && git reset origin/main --hard && rm -rf ./node_modules && npm install`, (error) => {
            if (!error) 
            {
                backup(db) // on backup avant
                // on redémarre
                logout(interaction.client);
                main("--update")
            }
            else if (error.code === 128)
            {
                interaction.followUp("Je suis déjà à jours");
            }
            else {
                interaction.followUp(`Erreur: -> ${error.code}`)    
                console.log(error.message);
            }
                
        });

    },
};