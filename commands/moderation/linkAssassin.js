import { ChannelType } from 'discord-api-types/v9';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, PERMISSIONS } from '../../tools/constants.js';


async function check_db(db, serverID) {
	const check = await db.get_linkAssassin(serverID);
	if (check != null)
		await db.remove_linkAssassin(serverID);
}
async function check_db_chan(db, serverID, channel) {
	const check = await db.get_linkAssassin(serverID, channel);
	if (check != null)
		await db.remove_linkAssassin(serverID, channel);
}

async function whitelist_check(whitelist, interaction) {

	const list = whitelist.split(",");
	
	if (typeof list !== "object")
	{
		await interaction.reply({content: "Bad whitelist format", flag: MessageFlags.Ephemeral});
		return false
	}
	
	return JSON.stringify(list)
}

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('linkassassin')
			.setDescription("Manage the links checker")
			.addBooleanOption((option) =>
				option.setName("enable")
					.setDescription("True: enable, False, disable")
					.setRequired(true))
			.addChannelOption(option => 
				option.setName("channel")
					.setDescription("channel you want to filter")
					.setRequired(false))
			.addStringOption(option => 
				option.setName("whitelist")
					.setDescription("exemple: google.com, youtube.com, example.com")
					.setRequired(false))
			.addBooleanOption(option => 
				option.setName("all")
					.setDescription("if you want to lock all links from the channel")
					.setRequired(false)),

    async execute(interaction, db) {

		try {

            const enabled = await interaction.options.getBoolean("enable");
            const serverID = await interaction.guildId.toString();
			const channel = await interaction.options.getChannel("channel");
			const alllink = await interaction.options.getBoolean("all");
			const whitelist = await interaction.options.getString("whitelist");



			// on nettoye avant la prochaine requête
			if (enabled && channel != null)
			{
				check_db_chan(db, serverID, channel.id)
			}
			else if (!enabled) 
			{
				check_db(db, serverID);
			}

			if (enabled && channel != null && whitelist != null && !alllink) // on filtre le channel avec les settings par défaut
			{
				const list = await whitelist_check(whitelist, interaction);
				if (list === false) return

				await db.insert_linkAssassin(serverID, channel.id, list)
			}
			else if (enabled && channel == null && whitelist != null && !alllink) // on filtre tout les salons sauf la whitelist
			{
				const list = await whitelist_check(whitelist, interaction);
				if (list === false) return

				await db.insert_linkAssassin(serverID, "ALL", list);
			}
			else if (enabled && channel == null && whitelist == null && alllink) // on bloque tout dans tous les salons
			{
				await db.insert_linkAssassin(serverID, "ALL", "!ALL");
			}
			else if (enabled && channel != null && whitelist == null && alllink) // on bloque tous dans le salon
			{
				await db.insert_linkAssassin(serverID, channel.id, "!ALL");
			}
			else if (enabled && channel != null && whitelist == null && !alllink) // on bloque tous avec les settings par défaut
			{
				await db.insert_linkAssassin(serverID, channel.id, "FALSE"); 
			}
			else if (enabled && channel == null && whitelist != null && alllink) // on bloque tout sauf la whitelist
			{
				const list = await whitelist_check(whitelist, interaction);
				if (list === false) return
				
				await db.insert_linkAssassin(serverID, "ALL", list); 
			}
			else if (enabled && channel != null && whitelist != null & alllink) // on bloque tout dans le salon excepté la whitelist
			{
				const list = await whitelist_check(whitelist, interaction);
				if (list === false) return;

				await db.insert_linkAssassin(serverID, "ALL", list);
			}


			await db.update_servers(DB_SERVERS_KEYS.linkAssassin, enabled ? 1 : 0, serverID);

			
            if (enabled)
                await interaction.reply({content: "enabled", flag: MessageFlags.Ephemeral});
            else 
                await interaction.reply({content: "disabled", flag: MessageFlags.Ephemeral});
			
		} catch (e) {
			console.log(`Erreur : ${e.message} -> cmds/linkAssassin.js`);
		}
		
		
	},
};