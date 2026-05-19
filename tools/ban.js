import { exec } from 'node:child_process';
import ban from '../commands/moderation/ban.js';

export default async function banUser(cible, motif, interaction) {


    await interaction.guild.members.fetch((member) => {

			if (member.author.id === cible.id)
			{
				member.ban({
					deleteMessageSeconds: Infinity,
					reason: motif
				});
			}

	});

}