import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import config from './config/config.json' with {type: "json"}
import ActivityPresence from './modules/ActivityPresence.js';
import MessagesManager from './events/MessagesManager.js';
import SlashCmdManager from './events/SlashCmdManager.js';
import CommandsLoader from './modules/CommandsLoader.js';
import BotReady from './events/BotReady.js';
import path from 'node:path';
import Address_checker from './modules/Address_checker.js';

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
