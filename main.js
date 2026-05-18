import fs, { readFileSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { Client, REST, GatewayIntentBits, Events } from 'discord.js';
import { Routes } from 'discord-api-types/v10';
import config from './config/config.json' with {type: "json"}

const client = new Client({ intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
    ] });

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});


let commands = [] 

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

        const data = await await rest.put(Routes.applicationCommands(config.clientId), { body: cmds });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {

        console.error(error);
	}
})();



client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
    if (!interaction.memberPermissions.has("BanMembers")) return;

    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        
        if (interaction.commandName === cmd.data.toJSON().name)
        {
            cmd.execute(interaction);
            return;
        }

    }
    

});


client.login(config.token);
