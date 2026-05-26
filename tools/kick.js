export default async function kickUser(cible, motif, interaction) {


    await interaction.guild.members.fetch((member) => {

			if (member.author.id === cible.id)
			{
				member.kick(motif);
			}

	});

}