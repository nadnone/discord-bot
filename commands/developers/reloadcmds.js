import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';
import { logout, main } from '../../main.js';

export default {
    permissions: PERMISSIONS.DEVELOPERS,
	data: new SlashCommandBuilder().setName('reloadcmds').setDescription('Recharger la liste des commandes'),
	async execute(interaction) {
      
        interaction.reply("Je reboot, à plus tard :)");
        
        logout(interaction.client);
        main();
	},
};