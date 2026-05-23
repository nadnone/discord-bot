import { ChannelType } from 'discord-api-types/v9';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { PERMISSIONS } from '../../tools/constants.js';

export default {
	permissions: PERMISSIONS.MODERATORS,
	data: new SlashCommandBuilder().setName('purge')
			.setDescription("(Be careful !) Purge ALL the messages of a member")
			.addUserOption((option) =>
				option.setName("cible")
					.setDescription("The user you want to wipe")
					.setRequired(true)),
	async execute(interaction) {

		let interval = [];
		const demandeFrom = await interaction.user;
		const replymsg =`${demandeFrom}, I'll mention you when I'm finished. Please wait, this is a slow process..`
		try {

			await interaction.reply({content: replymsg, flag: MessageFlags.Ephemeral})

			const textChannels = await interaction.guild.channels.cache
			const cibleID = await interaction.options.getUser("cible").id;

			const channels = textChannels.filter(t => t.type === ChannelType.GuildText);
			
			let i = 0;
			for (const channel of channels) {

				let inter = setInterval(checkmsgs, 2_500, channel, i++)
				interval.push(inter);
			}

			let checker = setInterval(async () => {
				console.log(interval.length);
				
				if (interval.length <= 0) 
				{
					await interaction.editReply(`${demandeFrom} Member wiped from the whole server`);
					clearInterval(checker)
					checker = null;
					return
				}
			}, 500);

			async function checkmsgs(channel, i) {
				
				if (checker == null)
				{
					clearInterval(interval[i]);
					return
				}

				const editReply =`${demandeFrom} Purge for`

				const allmsgs = await channel[1].messages.fetch({limit: 100, cache: false})

				const msgs = allmsgs.filter(m => m.author.id === cibleID && m.deletable === true && m.content !== replymsg);
				
				if (msgs == null) {
					await interaction.editReply(`${demandeFrom} Nothing to purge`)
					let tmp = interval[i];
					clearInterval(tmp)
					interval = interval.splice(i, 1);
					return 
				}
				else if (msgs.size <= 0){
					await interaction.editReply(`${editReply} ${channel[1].name} finished`)
					let tmp = interval[i];
					clearInterval(tmp)
					interval = interval.splice(i, 1);
					return
				}
				else {
					await interaction.editReply(replymsg)
				}

				for (const msg of msgs) {
					
					setTimeout(deleteMsg, 300, msg);
				}

				async function deleteMsg(msg) {

					try {
						if (await msg[1] == null)
						{
							return
						}
						else if (await msg[1].content.toString().includes(editReply))
						{
							return
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