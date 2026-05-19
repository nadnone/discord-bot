import { exec } from 'node:child_process';
import banUser from './ban.js';
import fs from 'node:fs';
import { WARNJSONFILE, WARNS_BEFORE_BAN } from './constants.js';
 
export default async function warnUser(cible, motif, interaction) {

    try
    {
        let list =  JSON.parse(await fs.readFileSync(WARNJSONFILE));
        const registre = list.filter(el => el.cible === cible.id.toString());


        if (registre.length >= WARNS_BEFORE_BAN)
        {
            await banUser(cible, "4x warn, donc ban", interaction);

            list = await list.filter(el => el.cible !== cible.id.toString());
            await fs.writeFileSync(WARNJSONFILE, JSON.stringify(list));
            return
        }

        list.push(({
			"cible": cible.id.toString(),
			"raison": motif.toString()
		}));


        await fs.writeFileSync(WARNJSONFILE, JSON.stringify(list));
       
    }
    catch (e)
    {
        console.log(`Errore code: ${e} -> tools/warn.js`);
        
    }

}