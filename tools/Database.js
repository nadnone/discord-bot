import { dir, log } from "node:console";
import { DATABASE_CHECK, DB_SERVERS_KEYS, SERVERSLISTFILE, WARNJSONFILE, WHITELISTFILE } from "./constants.js";
import fs from 'node:fs';
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { exec } from "node:child_process";
import backup from "./backup.js";

export default class Database {

    constructor(dirname) {
        this.p = path.join(dirname, "/data/data.db")


        if (!fs.existsSync(this.p))
        {
            this.sql = new DatabaseSync(this.p);
            this._init();
            return
        }

        this.sql = new DatabaseSync(this.p);

    }

    async _init() {

        try {
            
            console.log("Initialisation de la base de donnée");
            
            this.sql.exec(`
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

            this.sql.exec(`
                CREATE TABLE warns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user TEXT NOT NULL, 
                    reason TEXT NOT NULL,
                    serverID TEXT NOT NULL
                );
            `);
    
             this.sql.exec(`
                CREATE TABLE linkassassin (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    addresses TEXT NOT NULL, 
                    channels TEXT NOT NULL,
                    serverID TEXT NOT NULL
                );
            `);

            this.sql.exec(`
                CREATE TABLE imagesKiller (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    formats TEXT NOT NULL, 
                    channels TEXT NOT NULL,
                    serverID TEXT NOT NULL
                );
            `);

            console.log("Actualisation de la table servers");
            
            const servers = await this.read("./data/backup_servers_latest.json")
            if (servers == null) throw "No server default database"

            for (const server of servers) {

                const default_whitelist = await this.read("./config/whitelist.json");

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
                this.insert_new_server(values);
    
            }
            
            console.log("Actualisation de la table linkassassin");
            
            let data = await this.read("./data/backup_linkassassin_latest.json")
            if (data == null) throw "No linkassassin default database"

            for (const backup of data) {

                let check = JSON.parse(backup.address);
                
                if (check.length === 0) 
                {
                    check.push("FILTER");
                }
                check = JSON.stringify(check);

                this.insert_linkAssassin(backup.serverID, backup.channels, check);
    
            }
    
            console.log("Actualisation de la table warns");
            
            data = await this.read("./data/backups_warns_latest.json")
            if (data == null) throw "No warns default database"

            for (const backup of data) {
                this.set_warn(backup.user, backup.reason, backup.serverID);
            }
    

    
    


            return true;

        } catch (e) {
            console.log(`${e} -> tools/Database.js:_init()`);
            
        }

    }

    get_images_rules(channel, serverID) 
    {
        try {
            let query = this.sql.prepare(`
                SELECT formats FROM imagesKiller
                WHERE channels = ? AND serverID = ? ;
            `)
            
            return query.get(channel, serverID);

        } catch (e) {
            console.log(`Erreur : ${e} -> tools/Database.js:get_images_rules()`);
        }
    }
    insert_new_images_rules(rules, channel, serverID) 
    {
        try {
            const existing = this.get_images_rules(channel, serverID) != null

            let query = null;

            if (!existing)
            {
                query = this.sql.prepare(`
                    INSERT INTO imagesKiller (formats, channels, serverID) 
                    VALUES (?, ?, ?) ;
                `);
            }
            else {
                query = this.sql.prepare(`
                    UPDATE imagesKiller
                    SET formats = ?
                    WHERE channels = ? AND serverID = ? ;
                `);
            }

            query.run(rules, channel, serverID);
            
        } catch (e) {
            console.log(`Erreur : ${e} -> tools/Database.js:insert_new_images_rules()`);
        }
    }
    remove_images_rule(serverID, channel) 
    {
        let query;
        if (channel == null)
        {
            query = this.sql.prepare("DELETE FROM imagesKiller WHERE serverID = ? ;")
            query.run(serverID);
            return
        }

        query = this.sql.prepare("DELETE FROM imagesKiller WHERE channels = ? AND serverID = ? ;")
        query.run(channel, serverID);
    }

    insert_new_server(values) {

        try {
            if (values.length < 9) throw "not enough values";
    
            let insert = this.sql.prepare(`
                INSERT INTO servers (owner, serverID, nsfw, language, threads, whitelist, linkAssassin, Badwords, imagesKiller)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ;
            `);
        
            insert.run(...values)
            
        } catch (e) {
            console.log(`Erreur : ${e} -> tools/Database.js:insert_new_server()`);
        }

    }

    async update_servers(key, value, serverID) {

        try {

            const check = DATABASE_CHECK.includes(key);
            if (!check) throw "Not a valid key";
    
            const existing = this.get_servers(DB_SERVERS_KEYS.serverID, serverID) != null

            if (existing)
            {
                let update = this.sql.prepare(`
                    UPDATE servers
                    SET ${key} = ?
                    WHERE serverID = ?;
               `)
                update.run(value, serverID);
            }
            else
                throw "Serveur inexistant"
           
            
        } catch (e) {
            console.log(`${e} -> tools/Database.js:update_server()`);
        }


    }

    async get_servers(key, serverID) {
        
        try {
            
            const check = DATABASE_CHECK.includes(key)
            if (!check) throw "Not a valid key";
    
            let getter = this.sql.prepare(`SELECT ${key} FROM servers WHERE serverID = ? ;`);
    
            return await getter.get(serverID);
            
        } catch (e) {
            console.log(`${e} -> tools/Database.js:get_server()`);
            
        }
        
    }
    async get_warns(user, serverID) 
    {
        try {
            let getter = this.sql.prepare("SELECT * FROM warns WHERE serverID = ? AND user = ? ;")

            return getter.all(serverID, user);

        } catch (e) {
            console.log(`${e} -> tools/Database.js:get_warns()`);
        }
    }

    async count_warns(user, serverID) 
    {
        try {
            let counter = this.sql.prepare("SELECT COUNT(reason) FROM warns WHERE user = ? AND serverID = ?");

            return await counter.get(user, serverID)["COUNT(reason)"]; 
            
        } catch (e) {
            console.log(`${e} -> tools/Database.js:count_warns()`);
            
        }
    }

    async set_warn(user, motif, serverID) 
    {
        try {
            let setter = this.sql.prepare(`
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
            let query = this.sql.prepare(`
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
    
    async _get_servers_table() {

        let query = this.sql.prepare(`
            SELECT * FROM servers ;
        `);

        return query.all();
    }

    async get_chan_linkAssassin(serverID) {
        let query = this.sql.prepare("SELECT channels FROM linkassassin WHERE serverID = ? ;");
        return await query.all(serverID);
    }

    async get_linkAssassin(serverID, channel){

        if (channel == null) 
        {
            // si null alors on prend tout
            let query = this.sql.prepare("SELECT addresses FROM linkassassin WHERE serverID = ? ;")
            return await query.all(serverID)
        }
        let query = this.sql.prepare(`SELECT addresses FROM linkassassin WHERE serverID = ? AND channels = ? ;`)
        return await query.get(serverID, channel);
    }

    async insert_linkAssassin(serverID, channel, addresses) {
        try {
            
            let query = this.sql.prepare(`
                INSERT INTO linkassassin (serverID, channels, addresses)
                VALUES (?, ?, ?) ;
            `);
    
            await query.run(serverID, channel, addresses);

        } catch (e) {
            console.log(`${e} -> tools/Database.js:insert_linkAssassin()`);
            
        }

    }

    remove_linkAssassin(serverID, channel) {

        if (channel == null)
        {
            let query = this.sql.prepare("DELETE FROM linkassassin WHERE serverID = ?");
            query.run(serverID);
            return
        }

        let query = this.sql.prepare(`
            DELETE FROM linkassassin WHERE serverID = ? AND channels = ? ;
        `);

        query.run(serverID, channel)
    }

    _get_linkassassin_table() {
        let query = this.sql.prepare("SELECT * FROM linkassassin ;");
        return query.all();
    }

    _get_warns_table() {
        let query = this.sql.prepare("SELECT * FROM warns ;")
        return query.all();
    }

    
   
}