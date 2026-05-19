import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';

export default {
    permissions: PERMISSIONS.USERS,
	data: new SlashCommandBuilder().setName('infos').setDescription('En savoir plus sur moi'),
	async execute(interaction) {
		await interaction.reply("Alors comme ca tu veux me stalk ? O_O");

        const response = new EmbedBuilder()
            .setColor(0x4D4D47)
            .setTitle('Voir le projet sur GitHub')
            .setDescription('Je suis un bot fait en Javascript par un utilisateur random de Discord.')
            .setURL('https://github.com/nadnone/discord-bot')
        	.setAuthor({name: 'nadnone', url: 'https://nadnone.github.io'})
            .setTimestamp();

        setTimeout(() => interaction.followUp({ embeds: [response] }), 8000);

		
	},
};