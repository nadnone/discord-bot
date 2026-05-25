import Database from "./Database.js";
import fs from "node:fs";
import path from "node:path";
import backup from "./backup.js";
import { DatabaseSync } from "node:sqlite";
import { argv } from "node:process";

export default function update(dirname) {

        try {
            const ddb_path = path.join(dirname, "/data/data.db");

            // protection anti perte de données
            if (!fs.existsSync("./data/backup_servers_latest.json")) throw "[!] fichier manquant"
            if (!fs.existsSync("./data/backup_linkassassin_latest.json")) throw "[!] fichier manquant"

            console.log("Mise à jours de la base de donnée");
            
            if (argv.includes("--update"))
            {                
                let db = new Database(dirname)
                backup(db);
            }

            if (fs.existsSync(ddb_path) && argv.includes("--init") || argv.includes("--update"))
                fs.unlinkSync(ddb_path) // suppression de la bdd pour l'update

            console.log("Création du fichier de base de donnée");
            
            let db = new Database(dirname) // on ouvre la nouvelle bdd

            init(db) // on initialise la nouvelle bdd

        } catch (e) {
           throw `${e} -> tools/deployements.js:update()`;
        }

}

function init(db) {

    try {
        
        console.log("Initialisation de la base de donnée");
        
        db.exec_table(`
            CREATE TABLE servers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner TEXT NOT NULL, 
                serverID TEXT NOT NULL, 
                nsfw BOOLEAN NOT NULL,
                language TEXT NOT NULL, 
                threads TEXT,
                whitelist TEXT,
                linkAssassin BOOLEAN NOT NULL,
                badwords BOOLEAN NOT NULL,
                imagesKiller BOOLEAN NOT NULL
            );
            `);

        db.exec_table(`
            CREATE TABLE warns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL, 
                reason TEXT NOT NULL,
                serverID TEXT NOT NULL
            );
        `);

            db.exec_table(`
            CREATE TABLE linkassassin (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                addresses TEXT NOT NULL, 
                channels TEXT NOT NULL,
                serverID TEXT NOT NULL
            );
        `);

        db.exec_table(`
            CREATE TABLE imagesKiller (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                formats TEXT NOT NULL, 
                channels TEXT NOT NULL,
                serverID TEXT NOT NULL
            );
        `);

        console.log("Actualisation de la table servers");
        
        const servers = db.read("./data/backup_servers_latest.json")
        if (servers == null) throw "No server default database"

        for (const server of servers) {

            const default_whitelist = db.read("./config/whitelist.json");

            let values = []

            let threads = server.threads;
            if (threads == null) threads = []

            let whitelist = server.whitelist
            if (server.whitelist == null) whitelist = default_whitelist;

            values.push(server.owner);
            values.push(server.serverID.toString());
            values.push(server.NSFW ? 1 : 0);
            values.push(server.language);
            values.push(JSON.stringify(threads));
            values.push(JSON.stringify(whitelist)); 
            values.push(server.linkAssassin ? 1 : 0); // linkAssassin
            values.push(server.badwords ? 1 : 0); // badWords
            values.push(server.imageKiller ? 1 : 0); // imageKiller
            db.insert_new_server(values);

        }
        
        console.log("Actualisation de la table linkassassin");
        
        let data = db.read("./data/backup_linkassassin_latest.json")
        if (data == null) throw "No linkassassin default database"

        for (const backup of data) {

            let check = JSON.parse(backup.address);
            
            if (check.length === 0) 
            {
                check.push("FILTER");
            }
            check = JSON.stringify(check);

            db.insert_linkAssassin(backup.serverID, backup.channels, check);

        }

        console.log("Actualisation de la table warns");
        
        data = db.read("./data/backup_warns_latest.json")
        if (data == null) throw "No warns default database"

        for (const backup of data) {
            db.set_warn(backup.user, backup.reason, backup.serverID);
        }


        console.log("Actualisation de la table imageKiller");
        
        data = db.read("./data/backup_imageskiller_latest.json")
        if (data == null) throw "No warns default database"

        for (const backup of data) {
            db.insert_new_images_rules(backup.formats, backup.channels, backup.serverID);
        }


        return true;

    } catch (e) {
        console.log(`${e} -> tools/deployement.js:init()`);
        
    }

}