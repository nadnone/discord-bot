import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import config from './config/config.json' with {type: "json"}
import ActivityPresence from './modules/ActivityPresence.js';
import MessagesManager from './events/MessagesManager.js';
import SlashCmdManager from './events/SlashCmdManager.js';
import CommandsLoader from './modules/CommandsLoader.js';
import BotReady from './events/BotReady.js';
import path from 'node:path';
import fs, { existsSync, mkdirSync } from 'node:fs';
import { ALLOWERBARDWORDSFILE, BADWORDSFILEEN, BADWORDSFILEFR, BLACKLISTFILE, BLACKLISTSFWFILE, LOGCOMMITSFILE, WHITELISTFILE } from './tools/constants.js';
import { exec } from 'node:child_process';
import Database from './tools/Database.js';
import backup from './tools/backup.js';
import update from './tools/deployement.js';
import { argv, exit } from 'node:process';
import { DatabaseSync } from 'node:sqlite';



export function main(argument) {    

    load_folders() // verification des dossiers manquants
    load_files(); // verification de fichiers manquants


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
    

    let db = null;
        
    try {
    
        if (argument != null)
            argv.push(argument)
        

        if (argv.includes("--update") || argv.includes("--init")) // seulement avec l'argument --update ou --init
        {
            update(dirname) // pour les mises à niveau de la base de donnée
        }
        db = new Database(dirname) // on ouvre la base de donnée

    } catch (e) {
        console.log(e);
        return
    }



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
    exit(0)
}


function load_files() {

    try {

        let data = [];

        data.push({name: BLACKLISTFILE, status: fs.existsSync(BLACKLISTFILE)});
        data.push({name: WHITELISTFILE, status: fs.existsSync(WHITELISTFILE)});
        data.push({name: LOGCOMMITSFILE, status: fs.existsSync(LOGCOMMITSFILE)});
        data.push({name: BLACKLISTSFWFILE, status: fs.existsSync(BLACKLISTSFWFILE)});
        data.push({name: ALLOWERBARDWORDSFILE, status: fs.existsSync(ALLOWERBARDWORDSFILE)});
        data.push({name: BADWORDSFILEEN, status: fs.existsSync(BADWORDSFILEEN)});
        data.push({name: BADWORDSFILEFR, status: fs.existsSync(BADWORDSFILEFR)});

        for (const file of data) {
            if (!file.status) {
                console.log(`Création de ${file.name}`);
                fs.writeFileSync(file.name, "[]")
            }
        }

    } catch (error) {

        console.log(error.message);
    }
}

function load_folders() {
    
    try {
        
        let data = [];
    
        data.push({name: "./data", status: fs.existsSync("./data")});
        data.push({name: "./config", status: fs.existsSync("./config")});
    
        for (const folder of data) {

            if (!folder.status) {

                console.log(`Création de ${folder.name}`);
                mkdirSync(folder.name);
            }
        }

    } catch (error) {

        console.log(error.message);
        
    }


}


main();

