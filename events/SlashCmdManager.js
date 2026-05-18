import { ActivityType, Events } from "discord.js";

export default class SlashCmdManager {
    constructor() {
        this.commands = []
    }

    setCommands(commands) {
        this.commands = commands;
    }

    eventLoop(client, activityPresence) {

            client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return; // si pas une slashcommand

            let isModerator = false; // par défaut c'est un random
            if (interaction.memberPermissions.has("BanMembers"))
                isModerator = true; // si l'auteur est membre des gens qui peuvent bannirs


            for (let i = 0; i < this.commands.length; i++) {

                const cmd = this.commands[i];
                
                if (interaction.commandName === cmd.data.toJSON().name && isModerator)
                {
                    activityPresence.set('Entrain de servir...', ActivityType.Playing);
                    await cmd.execute(interaction);
                    return
                }
                else if (interaction.commandName === cmd.data.toJSON().name && (cmd.permissions === "users" || isModerator))
                {
                    activityPresence.set('Entrain de travailler...', ActivityType.Playing);
                    await cmd.execute(interaction);
                    return
                }
            }

            activityPresence.set("En attente d'un nouvel ordre", ActivityType.Watching);

        });
    }

}