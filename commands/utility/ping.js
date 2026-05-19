import { SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';

export default {
	permissions: PERMISSIONS.USERS,
	data: new SlashCommandBuilder().setName('ping').setDescription('Pour tester si je suis vivant'),
	async execute(interaction) {
		await interaction.reply('JE SUIS VIVANT (v1.0)!');
	},
};