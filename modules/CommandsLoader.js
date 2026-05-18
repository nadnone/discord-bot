import { REST } from 'discord.js';
import config from '../config/config.json' with {type: "json"}
import { Routes } from "discord-api-types/v9";
import path, { dirname } from 'node:path';
import fs from 'node:fs';

export default class CommandsLoader {

    constructor(dir) {
        this.dirname = dir;
        this.commands = []
        this._updateRegisters()
    }
    get_commands() {

        return this.commands;
    }

   async _updateRegisters() {

        await this._scanPath();
         
        const rest = await new REST().setToken(config.token);
        
        try {
            
                console.log(`Started refreshing ${this.commands.length} application (/) commands.`);

                let cmds = [];
                for (let i = 0; i < this.commands.length; i++) {
                    const cmd = this.commands[i].data.toJSON();
                    cmds.push(cmd);
                }

                const data = await rest.put(Routes.applicationCommands(config.clientId), { body: cmds });

                console.log(`Successfully reloaded ${data.length} application (/) commands.`);

            } catch (error) {

                console.error(error);
            }

    }

    async _scanPath() {

        const foldersPath = path.join(this.dirname, "commands");
        const commandFolders = fs.readdirSync(foldersPath);
        for (const folder of commandFolders) {
        
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
            
            for (const file of commandFiles) {
            
                const filePath = path.join(commandsPath, file);
                const command = (await import(filePath)).default

                if ('data' in command && 'execute' in command && 'permissions' in command) {
                    this.commands.push(command);
                    console.log(`Ajout de la commande ${command.data.name}.`);
                    
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data", "permissions" or "execute" property.`);
                }
        
            }

        }
        
        
    }
}