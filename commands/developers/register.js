import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, PERMISSIONS } from '../../tools/constants.js';
import { logout, main } from '../../main.js';

export default {
    permissions: PERMISSIONS.DEVELOPERS,
	data: new SlashCommandBuilder().setName('register').setDescription('Enregister un serveur')
                .addUserOption(option => option.setName("owner").setDescription("Server owner").setRequired(true))
                .addBooleanOption(option => option.setName("nsfw").setDescription("Is NSFW").setRequired(true))
                .addStringOption(option => option.setName("language").setDescription("Speaking language of the server").setRequired(true))
                
                ,
    async execute(interaction, db) {
      
        await interaction.deferReply();

        const owner = await interaction.options.getUser("owner");
        const nsfw = await interaction.options.getBoolean("nsfw");
        const language = await interaction.options.getString("language");


        // (owner, serverID, nsfw, language, threads, whitelist, linkAssassin, Badwords, imagesKiller)
        let values = [];
        values.push(owner.id)
        values.push(await interaction.guildId.toString())
        values.push(nsfw ? 1 : 0)
        values.push(language)
        values.push("[]") // threads
        values.push("[]") // whitelist
        values.push("[]") // linkassassin
        values.push(0) // badwords
        values.push(0) // imageskiller

        try {
            let exist = db.get_servers(DB_SERVERS_KEYS.language, await interaction.guildId.toString());

            if (!exist)
            {
                db.insert_new_server(values); // on envoie à la bdd
                await interaction.followUp("Enregistré")
            } 
            else await interaction.followUp("Déjà enregistré");
            
                
        } catch (e) {
            await interaction.followUp("Enregistement échoué")
            console.log(`${e} -> cmds/devs/register.js`);
        }
        

	},
};