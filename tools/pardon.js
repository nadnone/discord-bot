import { exec } from 'node:child_process';
import banUser from './ban.js';
import fs from 'node:fs';
import { WARNJSONFILE, WARNS_BEFORE_BAN } from './constants.js';
 
export default async function pardon(cible, motif, db) {

    try
    {
        let list = await db.read(WARNJSONFILE);

        list = await list.filter(el => el.cible !== cible.id.toString());

        await db.erase(JSON.stringify(list), WARNJSONFILE);

    }
    catch (e)
    {
        console.log(`Errore code: ${e} -> tools/pardon.js`);
        
    }

}