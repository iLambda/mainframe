import { REPL } from '../../../interaction/repl'
import { Node } from '../node';
import { link } from '../link'
import { IP } from '../../../tools/datatypes/ip.js';
import { Fault } from '../../../tools/fault.js';

export namespace Nodes {

    export class Datatypes extends Node {

        @link(IP)
        public async askIP(repl: REPL) : Promise<IP> {
            /* Ask */
            await repl.endpoint.say(`Please input a valid IP address.`)
            let res = await repl.endpoint.hear();
            /* Try parse */
            try {
                /* Make new IP */
                const ip = new IP(res);
                /* Return */
                return ip;

            } catch(e) {
                /* Rethrow */
                throw new Fault("The entered IP address is invalid.");
            }
        }


    }

}