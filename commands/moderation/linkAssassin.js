import { ChannelType } from 'discord-api-types/v9';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS, WHITELISTFILE } from '../../tools/constants.js';


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

	const list = whitelist.replaceAll("https","").replaceAll("http", "").split(",");
	
	if (typeof list !== "object")
	{
		await interaction.reply({content: "Mauvais whitelist format", flag: MessageFlags.Ephemeral});
		return false
	}
	
	return JSON.stringify(list)
}

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('linkassassin')
			.setDescription("Gérer les liens sur ton serveur")
			.addBooleanOption((option) =>
				option.setName("enable")
					.setDescription("True: Activé, False, Désactivé")
					.setRequired(true))
			.addChannelOption(option => 
				option.setName("channel")
					.setDescription("Le salon que tu souhaites filtrer")
					.setRequired(false))
			.addStringOption(option => 
				option.setName("whitelist")
					.setDescription("La liste des adresses autorisées (ou non avec '!') -> exemple: google.com, !youtube.com, example.com")
					.setRequired(false))
			.addBooleanOption(option => 
				option.setName("all")
					.setDescription("True : Bloquer tous les liens; False : Filtrer normalement")
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
				let list = await whitelist_check(whitelist, interaction);
				
				list = JSON.parse(list);
				list.push("FILTER");
				list = JSON.stringify(list);

				if (list === false) return


				await db.insert_linkAssassin(serverID, channel.id, list)
			}
			else if (enabled && channel == null && whitelist == null && !alllink) // setting par défaut partout
			{
				let default_whitelist = await db.read(WHITELISTFILE);
				default_whitelist.push("FILTER")

				await db.insert_linkAssassin(serverID, "ALL", JSON.stringify(default_whitelist))
			}
			else if (enabled && channel == null && whitelist != null && !alllink) // on filtre tout les salons sauf la whitelist
			{
				let list = await whitelist_check(whitelist, interaction);

				list = JSON.parse(list);
				list.push("FILTER");
				list = JSON.stringify(list);

				if (list === false) return

				await db.insert_linkAssassin(serverID, "ALL", list);
			}
			else if (enabled && channel == null && whitelist == null && alllink) // on bloque tout dans tous les salons
			{
				let list = [];
				list.push("ALL");
				list = JSON.stringify(list);

				await db.insert_linkAssassin(serverID, "ALL", list);
			}
			else if (enabled && channel != null && whitelist == null && alllink) // on bloque tous dans le salon
			{
				let list = [];
				list.push("ALL");
				list = JSON.stringify(list);

				await db.insert_linkAssassin(serverID, channel.id, list);
			}
			else if (enabled && channel != null && whitelist == null && !alllink) // on bloque tous avec les settings par défaut
			{
				let list = [];
				list.push("FILTER");
				list = JSON.stringify(list);

				await db.insert_linkAssassin(serverID, channel.id, list); 
			}
			else if (enabled && channel == null && whitelist != null && alllink) // on bloque tout sauf la whitelist
			{
				let list = await whitelist_check(whitelist, interaction);
				if (list === false) return

				list = JSON.parse(list);
				list.push("ALL");
				list = JSON.stringify(list);
				
				await db.insert_linkAssassin(serverID, "ALL", list); 
			}
			else if (enabled && channel != null && whitelist != null && alllink) // on bloque tout dans le salon excepté la whitelist
			{
				let list = await whitelist_check(whitelist, interaction);
				if (list === false) return;

				list = JSON.parse(list);
				list.push("ALL");
				list = JSON.stringify(list);

				await db.insert_linkAssassin(serverID, channel.id, list);
			}


			await db.update_servers(DB_SERVERS_KEYS.linkAssassin, enabled ? 1 : 0, serverID);


			const lang = db.get_servers(DB_SERVERS_KEYS.language, serverID);
			
			let config = null;
			if (lang === "FR")
				config = await db.read(LANG_FR_CONFIG);
			else 
				config = await db.read(LANG_EN_CONFIG);
			
            if (enabled)
                await interaction.reply({content: config.enabled, flag: MessageFlags.Ephemeral});
            else 
                await interaction.reply({content: config.disabled, flag: MessageFlags.Ephemeral});
			
		} catch (e) {
			console.log(`Erreur : ${e.message} -> cmds/linkAssassin.js`);
		}
		
		
	},
};