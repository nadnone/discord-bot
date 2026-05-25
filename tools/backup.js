export default function backup(db) {

    try {

        console.log("Création du fichier de sauvegarde SERVERS");

        const servers = db._get_servers_table();

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
        
        db.erase(JSON.stringify(backup), "./data/backup_servers_latest.json");

        console.log("Création du fichier de sauvegarde WARNS");

        const warns = db._get_warns_table();

        backup = []

        for (const warn of warns) {
            
            backup.push({
                serverID: warn.serverID,
                reason: warn.reason,
                user: warn.user
            });
        }

        db.erase(JSON.stringify(backup), "./data/backup_warns_latest.json");


        console.log("Création du fichier de sauvegarde LINKASSASSIN");

        const linkAssassin = db._get_linkassassin_table();


        backup = [];

        for (const links of linkAssassin) {
            
            backup.push({
                address: links.addresses,
                channels: links.channels,
                serverID: links.serverID
            });
        }

        db.erase(JSON.stringify(backup), "./data/backup_linkassassin_latest.json");


        console.log("Création du fichier de sauvegarde IMAGESKILLER");

        let data = db._get_imageskiller_table();

        backup = [];

        for (const el of data) {
            
            backup.push({
                formats: el.formats,
                channels: el.channels,
                serverID: el.serverID
            });
        }

        db.erase(JSON.stringify(backup), "./data/backup_imageskiller_latest.json");


    } catch (e) {
        console.log("Sauvegarde échouée " + e);
        exit(1);
    }

    

}
