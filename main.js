import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import config from './config/config.json' with {type: "json"}
import ActivityPresence from './modules/ActivityPresence.js';
import MessagesManager from './events/MessagesManager.js';
import SlashCmdManager from './events/SlashCmdManager.js';
import CommandsLoader from './modules/CommandsLoader.js';
import BotReady from './events/BotReady.js';
import path from 'node:path';
import Address_checker from './modules/Address_checker.js';
import fs, { mkdirSync } from 'node:fs';
import { BLACKLISTFILE, LOGCOMMITSFILE, WARNJSONFILE, WHITELISTFILE } from './tools/constants.js';
import { exec } from 'node:child_process';

export async function main() {

    await load_folders() // verification des dossiers manquants
    await load_files(); // verification de fichiers manquants


    const client = new Client({ 
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
        ],
        presence: {
            status: 'online', // 'online', 'idle' (inactif), 'dnd' (ne pas déranger), 'invisible'
            activities: [{
                name: 'Attend un ordre des vizirs',
                type: ActivityType.Watching 
            }]
        }
    });
    
    
    const dirname = import.meta.dirname;
    new BotReady(client)
    
    const presence = new ActivityPresence(client);
    const cmdsloader = new CommandsLoader(dirname);
    
    const slashcmdMAnager = new SlashCmdManager();
    slashcmdMAnager.setCommands(cmdsloader.get_commands());
    slashcmdMAnager.eventLoop(client, presence);
    
    const addr_checker = new Address_checker()
    const msgManager = new MessagesManager(addr_checker);
    msgManager.eventLoop(client, presence);
    
    client.login(config.token);

}


export function logout(client) {
    client.destroy();
}


async function load_files() {

    try {

        let data = [];

        data.push({name: WARNJSONFILE, status: await fs.existsSync(WARNJSONFILE)});
        data.push({name: WARNJSONFILE, status: await fs.existsSync(BLACKLISTFILE)});
        data.push({name: WARNJSONFILE, status: await fs.existsSync(WHITELISTFILE)});
        data.push({name: LOGCOMMITSFILE, status: await fs.existsSync(LOGCOMMITSFILE)});

        for (const file of data) {
            if (!file.status) {
                console.log(`Création de ${file.name}`);
                await fs.writeFileSync(file.name, "[]")
            }
        }

    } catch (error) {

        console.log(error.message);
    }
}

async function load_folders() {
    
    try {
        
        let data = [];
    
        data.push({name: "./data", status: await fs.existsSync("./data")});
        data.push({name: "./config", status: await fs.existsSync("./config")});
    
        for (const folder of data) {

            if (!folder.status) {

                console.log(`Création de ${folder.name}`);
                await mkdirSync(folder.name);
            }
        }

    } catch (error) {

        console.log(error.message);
        
    }


}


main();

