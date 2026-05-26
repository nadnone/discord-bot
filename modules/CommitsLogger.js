import { ActivityType, ChannelType, EmbedBuilder } from "discord.js";
import { stderr, stdout } from "node:process";
import { exec } from 'child_process';
import fs from 'node:fs';

import { LOGCOMMITSFILE, UPDATES_ROOM_NAME } from "../tools/constants.js";

export default class CommitsLogger {

    checkloop(client) {
        this._check(client); // on teste une fois au démarrage
        //setInterval(this._check, 300_000, client);
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
                const fields = commit.splice(5);
                const title = commit[4].trim()


                const lastcommit = commitsData.filter(el => el.title === title && el.fields === fields && el.author === author)
                
                if (lastcommit.length > 0) 
                {
                    this.check_anyway = false;
                    return
                }

                let embed = new EmbedBuilder()
                            .setAuthor({name: author})
                            .setTitle(title)

                for (let i = 0; i < fields.length; i++) {

                    embed.addFields({name: "", value: fields[i].trim()});

                }


                const channels = await client.channels.cache.forEach(async (chan) => {
                    if (chan.name === UPDATES_ROOM_NAME
                    ){
                            chan.send({embeds: [embed]})
                    }
                });


                let newcommmit = [] // on efface pour n'avoir qu'un seul element : TODO à revoir
                newcommmit.push({
                    title: title,
                    fields: fields,
                    author: author
                });

                fs.writeFileSync(LOGCOMMITSFILE, JSON.stringify(newcommmit));
                

            }
                
        })

    }
}