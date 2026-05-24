export const PERMISSIONS = {
    USERS: "users",
    MODERATORS: "moderators",
    DEVELOPERS: "developers"
}
export const DB_SERVERS_KEYS = {
    owner: "owner",
    language: "language",
    threads: "threads",
    nsfw: "nsfw",
    serverID: "serverID",
    whitelist: "whitelist",
    linkAssassin: "linkAssassin",
    linkAssassinID: "linkAssassinID",
    badwords: "badwords",
    imagesKiller: "imagesKiller"
};
export const DB_LINKASSSASSIN_KEY = {
    serverID: "serverID",
    channel: "linkAssassin",
    addresses: "addressses"
};
export const DATABASE_CHECK = [
    "owner", "language", "threads", "nsfw", "serverID", "whitelist", "linkAssassin","linkAssassinID", "badwords", "imagesKiller"
];

export const SUPPORTED_MIMETYPE = [
    "image", "video", "application"
]


export const WARNJSONFILE = "./data/warns.json";
export const DEVELOPERSJSONFILE = "./config/developers.json";
export const LOGCOMMITSFILE = "./data/commits.json";
export const BLACKLISTFILE = "./config/blacklist.json"
export const BLACKLISTSFWFILE = "./config/blacklist_SFW.json"
export const WHITELISTFILE = "./config/whitelist.json"
export const ALLOWERBARDWORDSFILE = "./config/allowedBadWords.json"
export const SERVERSLISTFILE = "./data/servers.json"

export const UPDATES_ROOM_NAME = "lechatfouettard-updates"

export const WARNS_BEFORE_BAN = 15;

export const GITHUB_REPOSITORY = "https://github.com/nadnone/discord-bot.git"

// credit
// @Author Maurice Butler https://github.com/darwiin/french-badwords-list
export const BADWORDS_LIST_API_FR = "https://raw.githubusercontent.com/darwiin/french-badwords-list/refs/heads/master/list.txt"

// credit
// @briankung Brian Kung https://github.com/darwiin/french-badwords-list
export const BADWORDS_LIST_API_EN = "https://gist.githubusercontent.com/briankung/e085841a7a13fa4945a0cf482950436a/raw/326b4078db98541204e3d192d7cf84f63cd4c87a/bad_words.txt"