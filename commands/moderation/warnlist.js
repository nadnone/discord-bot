import { ChannelType } from 'discord-api-types/v9';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS } from '../../tools/constants.js';
import warnUser from '../../tools/warn.js';
import pardon from '../../tools/pardon.js';
import fs from 'node:fs';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('warnlist')
			.setDescription("list des warns d'un membre")
			.addUserOption(option =>
				option.setName("cible")
					.setDescription("Le membre que vous voulez observer")
					.setRequired(true)
			),
	async execute(interaction, db) {

        try {
            const serverID = interaction.guildId.toString();

                let config = null
                const lang = db.get_servers(DB_SERVERS_KEYS.language, serverID);

                if (lang.language === "FR")
                    config = await db.read(LANG_FR_CONFIG);
                else 
                    config = await db.read(LANG_EN_CONFIG);

		
            const cible = interaction.options.getUser('cible')
    
            let warns = await db.get_warns(cible.id.toString(), await interaction.guildId.toString());
            if (warns == null) warns = [];

            let response = new EmbedBuilder()
                            .setColor(0x4D4D47)
                            .setTitle(config.warnlist_1)
                            .setDescription(config.warnlist_2)
                            .setAuthor({name: 'nadnone', url: 'https://nadnone.github.io'})
                            .setTimestamp();
    
            for (let i = 0; i < warns.length; i++) {
                
                const warn = warns[i];

                response.addFields({ name: `${config.motif} n°${i+1}`, value: warn.reason, inline: false })
            }

            await interaction.reply({ embeds: [response] });

        }
        catch (e) 
        {
            console.log(`Erreur : ${e.message} -> warnlist.js`);
            
        }

	},
};