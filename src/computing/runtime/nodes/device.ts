import * as data from './device.json'
import { REPL } from '../../../interaction/repl'
import { Node } from '../node'
import { link, nldata, subject } from '../link'
import { Operator } from '../../../peripherals/operator.js';

export namespace Nodes {

    @nldata(data)
    export class Device extends Node {

        /* Give the date */
        @link()
        @subject('device')
        public async register(repl: REPL) : Promise<void> {
            /* What kind of device ? */
            await repl.endpoint.say("Specify the kind of new device to register.");
            const kind = await repl.endpoint.hear();
            /* Try register a device */
            await Operator.register(repl, kind);
            /* Success */
            await repl.endpoint.say("New device has successfully been registered.")
        }
    }

}