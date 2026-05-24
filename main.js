import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import config from './config/config.json' with {type: "json"}
import ActivityPresence from './modules/ActivityPresence.js';
import MessagesManager from './events/MessagesManager.js';
import SlashCmdManager from './events/SlashCmdManager.js';
import CommandsLoader from './modules/CommandsLoader.js';
import BotReady from './events/BotReady.js';
import path from 'node:path';
import fs, { mkdirSync } from 'node:fs';
import { ALLOWERBARDWORDSFILE, BLACKLISTFILE, BLACKLISTSFWFILE, LOGCOMMITSFILE, SERVERSLISTFILE, WARNJSONFILE, WHITELISTFILE } from './tools/constants.js';
import { exec } from 'node:child_process';
import Database from './tools/Database.js';
import backup from './tools/backup.js';
import update from './tools/deployement.js';
import { argv } from 'node:process';



export async function main(argv) {
    
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
    
    let db = new Database(dirname);

    if (argv.includes("--update")) // seulement avec l'argument --update
        await update(dirname, db); // pour les mises à niveau de la base de donnée


    const presence = new ActivityPresence(client);
    const cmdsloader = new CommandsLoader(dirname);
    
    const slashcmdMAnager = new SlashCmdManager(db);
    slashcmdMAnager.setCommands(cmdsloader.get_commands());
    slashcmdMAnager.eventLoop(client, presence);
    
    const msgManager = new MessagesManager(db);
    msgManager.eventLoop(client, presence);
    
    client.login(config.token);

}


export function logout(client) {
    client.destroy();
}


async function load_files() {

    try {

        let data = [];

        data.push({name: BLACKLISTFILE, status: await fs.existsSync(BLACKLISTFILE)});
        data.push({name: WHITELISTFILE, status: await fs.existsSync(WHITELISTFILE)});
        data.push({name: LOGCOMMITSFILE, status: await fs.existsSync(LOGCOMMITSFILE)});
        data.push({name: BLACKLISTSFWFILE, status: await fs.existsSync(BLACKLISTSFWFILE)});
        data.push({name: SERVERSLISTFILE, status: await fs.existsSync(SERVERSLISTFILE)});
        data.push({name: ALLOWERBARDWORDSFILE, status: await fs.existsSync(ALLOWERBARDWORDSFILE)});

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


main(argv);

