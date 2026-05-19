import { Events } from "discord.js";
import Address_checker from '../modules/Address_checker.js';
import QuoiFeurDetector from "../modules/QuoiFeurDetector.js";


export default class MessagesManager {

    constructor(addr_checker) {
        this.addr_checker = addr_checker;
        this.quoifeurDetector = new QuoiFeurDetector();
    }

    eventLoop(client, activityPresence) {

        client.on(Events.MessageCreate, async (interaction) => {

            this.addr_checker.check(interaction, activityPresence);
            this.quoifeurDetector.check(interaction, activityPresence);
        });
    }
    
}