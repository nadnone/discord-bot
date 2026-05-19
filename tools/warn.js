import { exec } from 'node:child_process';
import banUser from './ban.js';
import fs from 'node:fs';
import { WARNJSONFILE, WARNS_BEFORE_BAN } from './constants.js';
 
export default async function warnUser(cible, motif, interaction) {

    try
    {
        const registre = await fs.readFileSync(WARNJSONFILE).filter(el => el.cible === cible.id.toString());

        let list = warnslist;

        if (registre.length >= WARNS_BEFORE_BAN)
        {
            await banUser(cible, "4x warn, donc ban", interaction);

            list = await warnslist.filter(el => el.cible !== cible.id.toString());
            await fs.writeFileSync(WARNJSONFILE, JSON.stringify(list));
            return
        }


        list = warnslist;

        list.push(({
			"cible": cible.id.toString(),
			"raison": motif.toString()
		}));


        await fs.writeFileSync(WARNJSONFILE, JSON.stringify(list));
       
    }
    catch (e)
    {
        console.log(`Errore code: ${e.code} -> tools/warn.js`);
        
    }

}