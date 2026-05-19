import { ActivityType, Events } from "discord.js";
import { PERMISSIONS } from "../tools/constants.js";
import developers_list from "../config/developers.json" with {type: "json"};

export default class SlashCmdManager {
    constructor() {
        this.commands = []
    }

    setCommands(commands) {
        this.commands = commands;
    }

    async _isDeveloper(interaction) {
        
        const isdev = await developers_list.filter(el => el === interaction.user.id.toString());

        if (await isdev.length < 1) // si le tableau est vide, l'id n'existe pas 
        {
            return false;
        }

        return true;
    }

    async _isModerator(interaction) {

        if (interaction.memberPermissions.has("BanMembers"))
            return true; // si l'auteur est membre des gens qui peuvent bannirs

        return false;
    }

    async _isUser(interaction) {
        if (interaction.memberPermissions.has("SendMessages"))
            return true;

        else return false;
    }

    eventLoop(client, activityPresence) {

            client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return; // si pas une slashcommand


            for (let i = 0; i < this.commands.length; i++) {

                const cmd = this.commands[i];

                if (interaction.commandName === cmd.data.toJSON().name &&
                    cmd.permissions === PERMISSIONS.MODERATORS && await this._isModerator(interaction))
                {
                    activityPresence.set('Entrain de servir...', ActivityType.Playing);
                    await cmd.execute(interaction);
                    return
                }
                else if (interaction.commandName === cmd.data.toJSON().name &&
                    cmd.permissions === PERMISSIONS.USERS && await this._isUser(interaction))
                {
                    activityPresence.set('Entrain de travailler...', ActivityType.Playing);
                    await cmd.execute(interaction);
                    return
                }
                else if (interaction.commandName === cmd.data.toJSON().name &&
                    cmd.permissions === PERMISSIONS.DEVELOPERS && await this._isDeveloper(interaction))
                {
                    activityPresence.set('En maintenance...', ActivityType.Playing);
                    await cmd.execute(interaction);
                    return

                }
            }

            

            activityPresence.set("En attente d'un nouvel ordre", ActivityType.Watching);

        });
    }

}