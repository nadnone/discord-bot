import { ChannelType } from 'discord-api-types/v9';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { DB_SERVERS_KEYS, LANG_EN_CONFIG, LANG_FR_CONFIG, PERMISSIONS } from '../../tools/constants.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('purge')
			.setDescription("(Attention !) Supprimer TOUS les messages d'un membre (dans TOUS le serveur)")
			.addUserOption((option) =>
				option.setName("cible")
					.setDescription("Le membre que tu souhaites effacer")
					.setRequired(true)),
	async execute(interaction, db) {

		let config = null
		const lang = db.get_servers(DB_SERVERS_KEYS.language, await interaction.guildId.toString());

		if (lang.language === "FR")
			config = await db.read(LANG_FR_CONFIG);
		else 
			config = await db.read(LANG_EN_CONFIG);


		let interval = [];
		const demandeFrom = await interaction.user;
		const replymsg =`${demandeFrom}, ${config.purge_1}`
		try {

			await interaction.reply({content: replymsg, flag: MessageFlags.Ephemeral})

			const textChannels = await interaction.guild.channels.cache
			const cibleID = await interaction.options.getUser("cible").id;

			const channels = textChannels.filter(t => t.type === ChannelType.GuildText);
			
			let i = 0;
			for (const channel of channels) {

				let inter = setInterval(checkmsgs, 300, channel, i++)
				interval.push(inter);
			}

			let checker = setInterval(async () => {
				
				if (interval.length <= 0) 
				{
					await interaction.followUp(`${demandeFrom} ${config.purge_2}`);
					clearInterval(checker)
					checker = false;
					return
				}
				interval = interval.filter(i => i != false)
				
					

			}, 300);

			async function checkmsgs(channel, i) {
				
				if (checker === false)
				{
					clearInterval(interval[i]);
					interval[i] = false;
					return
				}

				const editReply =`${demandeFrom} Purge de`

				const allmsgs = await channel[1].messages.fetch({limit: 100, cache: false, force: true})

				const msgs = allmsgs.filter(m => m.author.id === cibleID && m.deletable === true && m.content !== replymsg);


				if (msgs == null) {
					await interaction.editReply(`${demandeFrom}, ${config.purge_3}`)
					let tmp = interval[i];
					clearInterval(tmp)
					interval[i] = false
					return 
				}
				else if (msgs.size <= 0){
					await interaction.editReply(`${editReply} ${channel[1].name} -> ${config.purge_4}`)
					let tmp = interval[i];
					clearInterval(tmp)
					interval[i] = false
					return
				}

				for (const msg of msgs) {
					await setTimeout(deleteMsg, 300, msg);
				}

				async function deleteMsg(msg) {

					try {
						if (await msg[1] == null)
						{
							throw 400
						}
						else if (await msg[1].content.toString().includes(editReply))
						{
							return 500
						}
						else if (await msg[1].deletable)
							await msg[1].delete();

						
					} catch (e) {
						if (e.code === 10008) // si le message n'est pas connu
							 return //on ignore cette erreur
						
						console.log(`${e.message} -> purge.js:deleteMsg:interval`);
						return
					}
				}
				

			}

		} catch (e) {
			console.log(`Erreur : ${e.message} -> purge.js:execute():trycatch`);
		}
	},
};