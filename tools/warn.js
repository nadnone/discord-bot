import { exec } from 'node:child_process';
import banUser from './ban.js';
import fs from 'node:fs';
import { WARNJSONFILE, WARNS_BEFORE_BAN } from './constants.js';
 
export default async function warnUser(cible, motif, interaction, db) {

    try
    {
        let warns_count = await db.count_warns(cible.id.toString(), await interaction.guildId.toString());
        if (warns_count == null) warns_count = [];

        
        if (warns_count >= WARNS_BEFORE_BAN)
        {
            await banUser(cible, "4x warn, donc ban", interaction);
            await this.db.clear_warns(cible.id.toString(), await interaction.guildId.toString());
            return
        }

        await db.set_warn(cible.id.toString(), motif.toString(), await interaction.guildId.toString())
       
    }
    catch (e)
    {
        console.log(`Errore code: ${e} -> tools/warn.js`);
        
    }

}