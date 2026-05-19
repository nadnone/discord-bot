import { exec } from 'node:child_process';
import banUser from './ban.js';
import fs from 'node:fs';
import { WARNJSONFILE, WARNS_BEFORE_BAN } from './constants.js';
 
export default async function pardon(cible, motif) {

    try
    {
        let list =  JSON.parse(await fs.readFileSync(WARNJSONFILE));

        list = await list.filter(el => el.cible !== cible.id.toString());

        await fs.writeFileSync(WARNJSONFILE, JSON.stringify(list));

    }
    catch (e)
    {
        console.log(`Errore code: ${e} -> tools/pardon.js`);
        
    }

}