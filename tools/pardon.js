import { exec } from 'node:child_process';
import banUser from './ban.js';
import fs from 'node:fs';
import { WARNS_BEFORE_BAN } from './constants.js';
 
export default async function pardon(cible, serverID, db) {

    try
    {
        await db.clear_warns(cible.id.toString(), serverID.toString());
    }
    catch (e)
    {
        console.log(`Errore code: ${e} -> tools/pardon.js`);
        
    }

}