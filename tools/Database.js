import { SERVERSLISTFILE, WARNJSONFILE } from "./constants.js";
import fs from 'node:fs';

// Pour pouvoir migrer plus tard

export default class Database {

    async erase(data, context) {

        await fs.writeFileSync(context, data);
    }

    async read(context) {
        
        return JSON.parse(await fs.readFileSync(context));
    }
     
}