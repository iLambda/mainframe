import * as TypedHue from 'typedhue'
import hash = require('object-hash')
import { Device, device } from '../device'
import { Bridge } from 'typedhue/lib/classes/Bridge'
import { State } from 'typedhue/lib/interfaces/State'
import { assert } from '../../tools/assert'
import { Fault } from '../../tools/fault'
import { DeviceFault } from '../devfault'
import { REPL } from '../../interaction/repl'
import { IP } from '../../tools/datatypes/ip'
import { EventEmitter } from 'events'

export namespace Devices {
    
    namespace Hue {
        /* The Hue parameters */
        export interface Configuration {
            /* The IP */
            ip: IP;
            /* Username */
            username: string;
        }        
    }

    /* A command */
    export class HueCommand {

        /* The state */
        private state: State | null;
        /* The targets */
        private targets: { id: string, type: 'light'|'group' }[];

        /* Make a new command */
        constructor() {
            /* Default the state */
            this.state = null;
            this.targets = [];
        }

        /* Append */
        private append(state: State) : this { 
            /* Make state merger list */
            const states = this.state
                                ? [this.state, state]
                                : [state];
            /* Merge states */
            this.state = TypedHue.StateCreator.joinStates(states);
            /* Return self */
            return this; 
        }
        /* Turn a fraction into a range value */
        private unnormalize(value: number, min: number, max: number) : number {
            /* Ensure max > min */
            assert(max > min);
            /* Clamp */
            const clamped = value >= 0 
                                ? value <= 1 
                                    ? value 
                                    : 1
                                : 0;
            /* Normalize */
            return (clamped * (max - min)) + min;
        }

        /* Execute on a bridge */
        public async execute (bridge: Bridge) {
            /* Check if state is null */
            if (!this.state) { return; }
            const state = this.state;
            /* Make a set */
            const targets = Array.from(new Set(this.targets));
            /* For each target */
            const promises = targets.map(target => 
                /* Make a promise */
                new Promise<void>((resolve, reject) => {
                    /* Make the callback */
                    const done = (success: boolean) => {
                        /* Successful */
                        if (success) { resolve(); }
                        /* Error */
                        else { reject(new Error(`Could not set ${target.type} state of ${target.id}`)); }
                    }
                    /* Check type */
                    switch (target.type) {
                        /* Design a group */
                        case 'group': {
                            /* Set state */
                            bridge.setGroupState(target.id, state, done);
                            break;
                        }
                        /* Design light */
                        case 'light': {
                            /* Set state */
                            bridge.setLightState(target.id, state, done);
                            break;
                        }
                    }
                })
            );
            try {
                /* Wait for them all */
                await Promise.all(promises);
            } catch (e) {
                /* Error occured. Throw fault */
                throw new Fault("An error occured while trying to set some lights.");
            };
        }

        /* Select a light */
        public light(id: string) { 
            this.targets.push({ id, type: 'light' });
        }
        /* Select a group */
        public group(id: string) { 
            this.targets.push({ id, type: 'group' });
        }

        /* On control */
        public on() { 
            return this.append(TypedHue.StateCreator.onOffState(true)); 
        }
        /* Off control */
        public off() { 
            return this.append(TypedHue.StateCreator.onOffState(false)); 
        }
        /* On/off control */
        public power(state: boolean) { 
            return this.append(TypedHue.StateCreator.onOffState(state)); 
        }
        /* Control the brightness of the light */
        public brightness(value: number) { 
            return this.append(TypedHue.StateCreator.setBrightness(this.unnormalize(value, 1, 254)));
        }
        /* Control the color of the light */
        public xy(x: number, y: number) { 
            return this.append(TypedHue.StateCreator.setColorCIEColorspace(x, y));
        }
        /* Control the temperature of the light */
        public temperature(temperature: number) { 
            return this.append(TypedHue.StateCreator.setColortemperator(temperature));
        }
        /* Control the hue of the light */
        public hue(hue: number) { 
            return this.append(TypedHue.StateCreator.setHue(hue));
        }
        /* Control the saturation of the light */
        public saturation(saturation: number) { 
            return this.append(TypedHue.StateCreator.setSaturation(saturation));
        }
    }

    /* A Philips hue device */
    @device('hue')
    export class Hue extends Device {

        /* The configuration */
        readonly configuration: Hue.Configuration;
        /* The bridge */
        private bridge: Bridge | null;

        /* The name of the device */
        public get name(): string { return "Philips Hue Bridge"; }
        /* The hash of the device */
        public get hash(): string { return hash.sha1(this.configuration.ip.text); }

        /* Build a philips hue bridge */
        constructor(configuration: Hue.Configuration) {
            /* Build a device */
            super();
            /* Default fields */
            this.bridge = null;
            this.configuration = configuration;
        }

        /* Register a device of this type */
        public static async register(repl: REPL) : Promise<Device> {
            /* Ask for IP address */
            const ip = await repl.controller.ask(IP);
            /* Say press button */
            await repl.endpoint.say("You have 30 seconds to press the button on your bridge.");
            await repl.endpoint.say("Press the button and advise when connection can take place.");
            /* TODO wait for ack */
            await repl.endpoint.hear();
            /* Since some dumb f**k decided to throw errors by using
               process.exit, this bundler allows to remove the method
               and replace it with some method that does nothing. */
            const { neuter, reinstate, emitter } = (() => {
                /* Save console.error and exit in the closure */
                const exit = process.exit;
                const error = console.error;
                /* Return */
                return { 
                    /* Make neuter */
                    neuter : () => {
                        /* Workaround to ignore the fact that NOBODY thought
                           to handle error properly in typedhue; as a matter of fact,
                           any error thrown here could NOT BE CAUGHT ever. 
                           So, we just raise a flag and wait for the best. 
                           Since exit returns 'never', type fuckery is needed. */
                        process.exit = <() => never>(() => { emitter.emit('error') });
                        console.error = () => {};
                    },
                    /* Make reinstate */
                    reinstate: () => {
                        process.exit = exit;
                        console.error = error;
                    },
                    /* The event listener to hear from failure */
                    emitter: new EventEmitter()
                }
            })();
            /* The username */
            let username: string;
            /* Handle error */
            try {
                /* Neuter the damn code */
                neuter();
                /* Start request for username */
                username = await new Promise<string>((resolve, reject) => {
                    /* Make a new bridge */
                    new TypedHue.Bridge(ip.text, (success: boolean, username: string) => {
                        /* Check if success */
                        if (success) {
                            /* Successful ! */
                            resolve(username);
                        }
                    });
                    /* Once error */
                    emitter.once('error', () => reject());
                });
                /* Reinstate */
                reinstate();
            } catch(e) {
                /* Reinstate */
                reinstate();
                /* Error occured */
                throw new Fault('Link with the bridge could not be established.');
            }
            /* Log */
            repl.endpoint.say("Link with the bridge has been established.");
            /* Username has been resolved. Make configuration */
            const cfg: Hue.Configuration = {
                ip: ip,
                username: username
            };
            /* Return new */
            return new Hue(cfg);
        }

        /* Initialize the device */
        public async open() : Promise<void> {
            /* Initialize */
            this.bridge = await new Promise((resolve, reject) => {
                /* Create the bridge */
                const bridge = new TypedHue.Bridge(this.configuration.ip.text, (success: boolean, username: string) => {
                    /* Check if success */
                    if (success) {
                        /* Resolve */
                        resolve(bridge);
                    } else {
                        /* Reject */
                        reject(new DeviceFault(this, `Could not connect to Hue Bridge @ ${this.configuration.ip}.`));
                    }
                }, this.configuration.username);
            });
        }

        /* Execute a command */
        public async execute(command: HueCommand) {
            /* Check if bridge has been opened */
            if (!this.bridge) {
                throw new DeviceFault(this, "Device was not opened");
            }
            /* Execute the command */
            await command.execute(this.bridge);
        }

    };
}