import Database from "./Database.js";
import fs from "node:fs";
import path from "node:path";
import backup from "./backup.js";

export default function update(dirname, db) {

        try {

            // protection anti perte de données
            if (!fs.existsSync("./data/backup_servers_latest.json")) return
            if (!fs.existsSync("./data/backup_linkassassin_latest.json")) return

            console.log("Mise à jours de la base de donnée");
            
            fs.unlinkSync(path.join(dirname, "./data/data.db")) // suppression de la bdd pour l'update
            
            db = new Database(dirname) // on refait une bdd

        } catch (e) {
            console.log(`${e} -> tools/deployements.js`);
            
        }

}