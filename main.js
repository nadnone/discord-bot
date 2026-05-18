import fs, { link, readFileSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { Client, REST, GatewayIntentBits, Events } from 'discord.js';
import { ActivityType, Routes } from 'discord-api-types/v10';
import config from './config/config.json' with {type: "json"}
import Presence from './Presence.js';
import Address_checker from './Events/dnsLookup.js';

let activityPresence = null;
let commands = [] 

const address_checker = new Address_checker();

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

client.once(Events.ClientReady, (readyClient) => {
    activityPresence = new Presence(client);
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});



const foldersPath = path.join(import.meta.dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {

	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	
    for (const file of commandFiles) {
	
        const filePath = path.join(commandsPath, file);
		const command = (await import(filePath)).default;

        if ('data' in command && 'execute' in command) {
			commands.push(command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}

    }
}



const rest = new REST().setToken(config.token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

        let cmds = [];
        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i].data.toJSON();
            cmds.push(cmd);
        }

        const data = await rest.put(Routes.applicationCommands(config.clientId), { body: cmds });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);

	} catch (error) {

        console.error(error);
	}
})();

client.on(Events.MessageCreate, async (interaction) => {

    address_checker.check(interaction, activityPresence);
    
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return; // si pas une slashcommand

    let isModerator = false; // par défaut c'est un random

    if (interaction.memberPermissions.has("BanMembers")) {
        isModerator = true;
    }; // si l'auteur est membre des gens qui peuvent bannirs

    for (let i = 0; i < commands.length; i++) {

        const cmd = commands[i];
        
        
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




client.login(config.token);
