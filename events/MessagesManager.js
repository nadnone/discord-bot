import { Events } from "discord.js";
import Address_checker from '../modules/Address_checker.js';
import QuoiFeurDetector from "../modules/QuoiFeurDetector.js";
import SwearsChecker from "../modules/SwearsChecker.js";


export default class MessagesManager {

    constructor(addr_checker) {
        this.addr_checker = addr_checker;
        this.quoifeurDetector = new QuoiFeurDetector();
        this.swearsChecker = new SwearsChecker();
    }

    eventLoop(client, activityPresence) {

        client.on(Events.MessageCreate, async (interaction) => {

            this.addr_checker.check(interaction, activityPresence);
            this.quoifeurDetector.check(interaction, activityPresence);
            this.swearsChecker.check(interaction, activityPresence);
        });
    }
    
}