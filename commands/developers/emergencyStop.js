import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';
import { logout, main } from '../../main.js';
import { exec } from 'node:child_process';
import { exit } from 'node:process';

export default {
    permissions: PERMISSIONS.DEVELOPERS,
	data: new SlashCommandBuilder().setName('stop').setDescription("Pour m'arrêter si je pars en cacahuètes"),
	async execute(interaction) {
      
        await interaction.reply(":saluting_face:")
        logout(interaction.client);
        exit();
    },
};