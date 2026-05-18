import { SlashCommandBuilder } from 'discord.js';

export default {
	permissions: "moderators",
	data: new SlashCommandBuilder().setName('ping').setDescription('Pour tester si je suis vivant'),
	async execute(interaction) {
		await interaction.reply('JE SUIS VIVANT (v1.0)!');
	},
};