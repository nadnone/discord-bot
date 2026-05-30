import { dir, log } from "node:console";
import { DATABASE_CHECK, DB_SERVERS_KEYS, WHITELISTFILE } from "./constants.js";
import fs from 'node:fs';
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { exec } from "node:child_process";
import backup from "./backup.js";
import { argv } from "node:process";

export default class Database {

    constructor(dirname) {
        this.p = path.join(dirname, "/data/data.db")
        this.sql = null;
        
        try {
            this.sql = new DatabaseSync(this.p);
        } catch (e) {
            throw `${e} -> tools/Database.js:contrusctor()`
        }

    }

    exec_table(instructions) {
        this.sql.exec(instructions);
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

    update_servers(key, value, serverID) {

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

    get_servers(key, serverID) {
        
        try {
            
            const check = DATABASE_CHECK.includes(key)
            if (!check) throw "Not a valid key";
    
            let getter = this.sql.prepare(`SELECT ${key} FROM servers WHERE serverID = ? ;`);
    
            return getter.get(serverID);
            
        } catch (e) {
            console.log(`${e} -> tools/Database.js:get_server()`);
            
        }
        
    }
    get_warns(user, serverID) 
    {
        try {
            let getter = this.sql.prepare("SELECT * FROM warns WHERE serverID = ? AND user = ? ;")
            return getter.all(serverID, user);

        } catch (e) {
            console.log(`${e} -> tools/Database.js:get_warns()`);
        }
    }

    count_warns(user, serverID) 
    {
        try {
            let counter = this.sql.prepare("SELECT COUNT(reason) FROM warns WHERE user = ? AND serverID = ?");

            return counter.get(user, serverID)["COUNT(reason)"]; 
            
        } catch (e) {
            console.log(`${e} -> tools/Database.js:count_warns()`);
            
        }
    }

    set_warn(user, motif, serverID) 
    {
        try {
            let setter = this.sql.prepare(`
                INSERT INTO warns (user, reason, serverID)
                VALUES (?, ?, ?);
            `);
        
            setter.run(user.toString(), motif, serverID.toString());

        } catch (e) {
            console.log(`${e} -> tools/Database.js:set_warn()`);
        }
    }

    clear_warns(user, serverID) 
    {
        try {
            let query = this.sql.prepare(`
                DELETE FROM warns
                WHERE user = ? AND serverID = ?;
            `);

            query.run(user.toString(), serverID.toString());

        } catch (e) {
            console.log(`${e} -> tools/Database.js:clear_warns()`);
            
        }
    }

    async erase(data, context) {
        await fs.writeFileSync(context, data);
    }

    read_text(context) {
        return fs.readFileSync(context);
    }

    read(context) {
        return JSON.parse(fs.readFileSync(context));
    }
$
    _get_imageskiller_table()
    {
        let query = this.sql.prepare("SELECT * FROM imagesKiller;")
        return query.all();
    }

    _get_servers_table() {

        let query = this.sql.prepare(`SELECT * FROM servers ;`);
        return query.all();
    }
    _get_linkassassin_table() {
        let query = this.sql.prepare("SELECT * FROM linkassassin ;");
        return query.all();
    }

    _get_warns_table() {
        let query = this.sql.prepare("SELECT * FROM warns ;")
        return query.all();
    }

    get_chan_linkAssassin(serverID) {
        let query = this.sql.prepare("SELECT channels FROM linkassassin WHERE serverID = ? ;");
        return query.all(serverID);
    }

    get_linkAssassin(serverID, channel){

        if (channel == null) 
        {
            // si null alors on prend tout
            let query = this.sql.prepare("SELECT addresses FROM linkassassin WHERE serverID = ? ;")
            return query.all(serverID)
        }
        let query = this.sql.prepare(`SELECT addresses FROM linkassassin WHERE serverID = ? AND channels = ? ;`)
        return query.get(serverID, channel);
    }

    insert_linkAssassin(serverID, channel, addresses) {
        try {
            
            let query = this.sql.prepare(`
                INSERT INTO linkassassin (serverID, channels, addresses)
                VALUES (?, ?, ?) ;
            `);
    
            query.run(serverID, channel, addresses);

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


    
   
}