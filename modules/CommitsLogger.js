import { ActivityType, ChannelType, EmbedBuilder } from "discord.js";
import { stderr, stdout } from "node:process";
import { exec } from 'child_process';
import fs from 'node:fs';

import { LOGCOMMITSFILE, UPDATES_ROOM_NAME } from "../tools/constants.js";

export default class CommitsLogger {

    checkloop(client) {
        this._check(client); // on teste une première fois
        setInterval(this._check, 300_000, client); // on fait la boucle
    }

    _check(client) {
        
        const commitsData = JSON.parse(fs.readFileSync(LOGCOMMITSFILE));

        exec("git fetch https://github.com/nadnone/discord-bot.git && git log -n 1", async (error, stdout, stderr) => {

            if (error) {
                console.log(error.message);
            }
            else {

                const commit = stdout.split("\n")

                const author = commit[1].replace("Author: ", "").split(" ")[0].trim();
                const date = new Date(commit[2].replace("Date: ", ""));
                const description = commit.slice(5).join("\n").trim();
                const title = commit[4].trim()

                const lastcommit = commitsData.filter(el => el.title === title && el.description === description && el.author === author)
                if (lastcommit.length > 0) 
                {
                    this.check_anyway = false;
                    return
                }

                const embed = new EmbedBuilder()
                            .setAuthor({name: author})
                            .setDescription(description)
                            .setTitle(title)


                const channels = await client.channels.cache.forEach(async (chan) => {
                    if (chan.name === UPDATES_ROOM_NAME &&
                        chan.type === ChannelType.GuildText 
                    ){
                            chan.send({embeds: [embed]})
                    }
                });

                commitsData.clear(); // on efface pour n'avoir qu'un seul element

                commitsData.push({
                    title: title,
                    description: description,
                    author: author
                });

                fs.writeFileSync(LOGCOMMITSFILE, JSON.stringify(commitsData));
                

            }
                
        })

    }
}