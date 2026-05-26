import { exec } from 'node:child_process';
import banUser from './ban.js';
import fs from 'node:fs';
import { WARNS_BEFORE_BAN, WARNS_BEFORE_KICK } from './constants.js';
import kickUser from './kick.js';
 
export default async function warnUser(cible, motif, interaction, db) {

    try
    {
        let warns_count = await db.count_warns(cible.id.toString(), await interaction.guildId.toString());
        if (warns_count == null) warns_count = [];

        
        if (warns_count >= WARNS_BEFORE_BAN)
        {
            banUser(cible, "4x warn, donc ban", interaction);
            await db.clear_warns(cible.id.toString(), await interaction.guildId.toString());
            return
        }
        else if (warns_count >= WARNS_BEFORE_KICK) 
        {
            kickUser(cible, motif, interaction)
            return
        }

        await db.set_warn(cible.id.toString(), motif.toString(), await interaction.guildId.toString())
       
    }
    catch (e)
    {
        console.log(`Errore code: ${e} -> tools/warn.js`);
    }

}