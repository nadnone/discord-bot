import { dir, log } from "node:console";
import { DATABASE_CHECK, DATABASE_KEYS, SERVERSLISTFILE, WARNJSONFILE, WHITELISTFILE } from "./constants.js";
import fs from 'node:fs';
import path from "node:path";
import { backup, DatabaseSync } from "node:sqlite";
import { exec } from "node:child_process";

export default class Database {

    constructor(dirname) {
        this.p = path.join(dirname, "/data/data.db")


        if (!fs.existsSync(this.p))
        {
            this.db = new DatabaseSync(this.p);
            this._init();
            return
        }

        this.db = new DatabaseSync(this.p);

    }

    async _init() {

        try {
            
            console.log("Initialisation de la base de donnée");
            
            this.db.exec(`
                CREATE TABLE servers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner TEXT NOT NULL, 
                serverID TEXT NOT NULL, 
                nsfw BOOLEAN NOT NULL,
                language TEXT NOT NULL, 
                threads TEXT,
                whitelist TEXT,
                linkAssassin BOOLEAN NOT NULL,
                badwords BOOLEAN NOT NULL
                );
                `);

            this.db.exec(`
                CREATE TABLE warns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL, 
                reason TEXT NOT NULL,
                serverID TEXT NOT NULL
            );
            `);
    
            console.log("Création de la base de donnée");
            
            let servers = await this.read("./data/backup.json")
            if (servers == null) throw "No server default database"

            for (const server of servers) {

                const default_whitelist = this.read("./config/whitelist.json");

                let values = []
    
                let threads = server.threads;
                if (threads == null) threads = []


                if (server.whitelist == null) server.whitelist = default_whitelist;
    
                values.push(server.owner);
                values.push(server.serverID.toString());
                values.push(server.NSFW ? 1 : 0);
                values.push(server.language);
                values.push(JSON.stringify(threads));
                values.push(JSON.stringify(server.whitelist)); 
                values.push(server.linkAssassin ? 1 : 0); // linkAssassin
                values.push(server.badwords ? 1 : 0); // badWords
                this.insert_new_server(values);
    
            }
    


            return true;

        } catch (e) {
            console.log(`${e} -> tools/Database.js:_init()`);
            
        }

    }

    async insert_new_server(values) {

        try {
            if (values.length < 8) throw "not enough values";
    
            let insert = this.db.prepare(`
                INSERT INTO servers (owner, serverID, nsfw, language, threads, whitelist, linkAssassin, Badwords)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `);
        
            await insert.run(...values)
            
        } catch (e) {
            console.log(`Erreur : ${e} -> tools/Database.js`);
        }

    }

    async update_servers_info(key, value, serverID) {

        try {
            const check = DATABASE_CHECK.includes(key);
            if (!check) throw "Not a valid key";
    
            let update = this.db.prepare(`
                UPDATE servers
                SET ${key} = ?
                WHERE serverID = ?;
            `)
            
            await update.run(value, serverID);
            
        } catch (e) {
            console.log(`${e} -> tools/Database.js`);
            
        }


    }

    async get_servers_info(key, serverID) {
        
        try {
            
            const check = DATABASE_CHECK.includes(key)
            if (!check) throw "Not a valid key";
    
            let getter = this.db.prepare(`SELECT ${key} FROM servers WHERE serverID = ? ;`);
    
            return await getter.get(serverID);
            
        } catch (e) {
            console.log(`${e} -> tools/Database.js`);
            
        }
        
    }
    async get_warns(user, serverID) 
    {
        try {
            let getter = this.db.prepare("SELECT * FROM warns WHERE serverID = ? AND user = ? ;")

            return getter.all(serverID, user);

        } catch (e) {
            console.log(`${e} -> tools/Database.js:get_warns()`);
        }
    }

    async count_warns(user, serverID) 
    {
        try {
            let counter = this.db.prepare("SELECT COUNT(reason) FROM warns WHERE user = ? AND serverID = ?");

            return await counter.get(user, serverID)["COUNT(reason)"]; 
            
        } catch (e) {
            console.log(`${e} -> tools/Database.js:count_warns()`);
            
        }
    }

    async set_warn(user, motif, serverID) 
    {
        try {
            let setter = this.db.prepare(`
                INSERT INTO warns (user, reason, serverID)
                VALUES (?, ?, ?);
            `);
        
            await setter.run(user.toString(), motif, serverID.toString());

        } catch (e) {
            console.log(`${e} -> tools/Database.js:set_warn()`);
        }
    }

    async clear_warns(user, serverID) 
    {
        try {
            let query = this.db.prepare(`
                DELETE FROM warns
                WHERE user = ? AND serverID = ?;
            `);

            await query.run(user.toString(), serverID.toString());

        } catch (e) {
            console.log(`${e} -> tools/Database.js:clear_warns()`);
            
        }
    }

    async erase(data, context) {

        await fs.writeFileSync(context, data);
    }

    read(context) {
        
        return JSON.parse(fs.readFileSync(context));
    }
    
    async _get_servers_list() {

        let query = this.db.prepare(`
            SELECT * FROM servers ;
        `);

        return await query.all();
    }

    async _backup() {
            console.log("Création du fichier de sauvegarde");

            const servers = await this._get_servers_list();

            let backup = []
            for (let srv of servers) {

                while (typeof srv.threads === "string") 
                {
                    srv.threads = JSON.parse(srv.threads);
                }

                while (typeof srv.whitelist === "string")
                {
                    srv.whitelist = JSON.parse(srv.whitelist);
                }

                backup.push({
                    serverID: srv.serverID,
                    owner: srv.owner,
                    nswf: srv.nswf,
                    language: srv.language,
                    threads: JSON.stringify(srv.threads),
                    whitelist: JSON.stringify(srv.whitelist),
                    linkAssassin: srv.linkAssassin,
                    badwords: srv.badwords
                });
            }
            
            await this.erase(JSON.stringify(servers), "./data/backup_latest.json");
    }

    _deploy() {

        try {

            // protection anti perte de données
            if (!fs.existsSync("./data/backup.json")) return

            console.log("Mise à jours de la base de donnée");
            
            fs.unlinkSync(this.p) // suppression de la bdd
            
            this.db = new DatabaseSync(this.p);
            
            this._init(); // on recrée la bdd

            
        } catch (e) {
            console.log(`${e} -> tools/Database.js:_deploy()`);
            
        }

    }
}