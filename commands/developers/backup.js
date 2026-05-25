import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';
import { logout, main } from '../../main.js';
import { exec } from 'node:child_process';
import { exit } from 'node:process';
import backup from '../../tools/backup.js';
import fs from 'node:fs';

export default {
    permissions: PERMISSIONS.DEVELOPERS,
	data: new SlashCommandBuilder().setName('backup').setDescription("Pour sauvegarder les données"),
	async execute(interaction, db) {
      
        await backup(db)

        let timestamp = Date.now();

        if (!fs.existsSync("./backups"))
            fs.mkdirSync("./backups");

        exec(`zip -r ./backups/backup_${timestamp}.zip ./data/`, (err, stdout, _) => {
            if (err)
            {
                console.log(err);
                
                interaction.reply("Backup échouée :saluting_face:")
                return
            }      
        });


        await interaction.reply("Backup terminée :saluting_face:")
    },
};