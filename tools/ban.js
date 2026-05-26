
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