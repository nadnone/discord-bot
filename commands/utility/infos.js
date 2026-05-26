import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS } from '../../tools/constants.js';

export default {
    permissions: PERMISSIONS.USERS,
	data: new SlashCommandBuilder().setName('infos').setDescription('En savoir plus sur moi'),
	async execute(interaction, db) {

        try {

            const lang = db.get_servers(DB_SERVERS_KEYS.language, await interaction.guildId.toString());
			if (lang == null) return

            let config = null;
            if (lang.language === "FR")
                config = await db.read(LANG_FR_CONFIG)
            else 
                config = await db.read(LANG_EN_CONFIG)

            await interaction.reply(config.info_first_message);

            const response = new EmbedBuilder()
                .setColor(0x4D4D47)
                .setTitle(config.info_embed_title)
                .setDescription(config.info_embed_desc)
                .setURL('https://github.com/nadnone/discord-bot')
                .setAuthor({name: 'nadnone', url: 'https://nadnone.github.io'})
                .setTimestamp();

            setTimeout(() => interaction.followUp({ embeds: [response] }), 8000);

        } catch (e) {
            console.log(`Erreur : ${e.message} -> infos.js`);
            
        }
	
		
	},
};