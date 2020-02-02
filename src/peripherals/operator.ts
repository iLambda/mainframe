import cfg = require('../../cfg/peripherals.json')
import knex = require('knex')
import { Device } from './device.js';
import { Dictionary } from '../tools/container/dictionary.js';
import { Fault } from '../tools/fault.js';
import { REPL } from '../interaction/repl.js';

export class Operator {
    
    /* The database */
    private static db = knex({
        /* Load db config */
        ...cfg.database,
        /* Use null as default */
        useNullAsDefault: true
    });
    /* The drivers */
    private static drivers: Dictionary<new (cfg: any) => Device> = {};
    /* The devices */
    private static registeredDevices: Dictionary<Device> = {};

    /* The devices */
    public static get devices() : readonly Device[] {
        return Object.keys(this.registeredDevices).map(key => this.registeredDevices[key]);
    }

    /* Build an operator */
    private constructor() { }

    /* Retrieve all devices */
    private static async retrieve() {
        /* Request */
        const devices = await this.db
            .from('devices')
            .select('*');
        /* For each candidate */
        for (const deviceData of devices) {
            /* Get data */
            const id = <number>deviceData.id;
            const type = <string>deviceData.type;
            const cfg = <any>JSON.parse(deviceData.configuration);
            /* Check if type exists */
            if (!(type in this.drivers)) {
                /* Keep going */
                continue;
            }
            /* Make device */
            const Driver = this.drivers[type];
            const device = new Driver(cfg);
            /* Register it */
            this.registeredDevices[id] = device;
        }
    }

    /* Register a new device */
    public static async register(repl: REPL, driver: string) : Promise<Device> {
        /* Check if type exists */
        if (!(driver in this.drivers)) {
            /* Error */
            throw new Fault('There is no driver on file for such a device.');
        }
        /* Get the driver */
        const Driver = this.drivers[driver];
        /* Check if register exists */
        const registration = Driver?.prototype?.constructor?.register;
        if (!registration) {
            /* Error */
            throw new Fault('There is no registration procedure on file for such a device.');
        }
        /* Register a new device */
        const device : Device = await registration(repl);
        /* Check if any exists already (same driver and same hash) */
        const anyCollision = Object.entries(this.registeredDevices)
                                   .some(([_, dev]) => dev.devname === device.devname &&
                                                       dev.hash == device.hash);
        if (anyCollision) {
            /* Error */
            throw new Fault("Device is already in file.");
        }        
        /* Make entry */
        const entry = {
            /* The type of the device */
            type: driver,
            /* The configuration of the device */
            configuration: JSON.stringify(device.configuration),
            /* The hash */
            hash: device.hash
        };
        /* Push it into db */
        await this.db('devices').insert(entry);
        /* Get id to register */
        const id : number = (await this.db('devices').select('id').where(entry).first()).id;
        /* Register */
        this.registeredDevices[id] = device;
        /* Return it */
        return device;
    }

    /* Load drivers */
    public static initialize() : void {
        /* The driver resolver */
        const resolver = (Module: any) => {
            /* Check if 'Nodes' namespace exists */
            if (!Module.Devices) { return null; }
            /* Make it all */
            for (let key in Module.Devices) {
                /* Make it, and register */
                const driver = new Module.Devices[key]();
                /* Check if ok, and push links */
                if (driver instanceof Device) {
                    /* Check devname */
                    if (!driver.devname) {
                        throw new Error("Tag @device must be set while defining class.");
                    }
                    /* Register constructor */
                    this.drivers[driver.devname] = <new () => Device>driver.constructor;
                }
            }
        };
        /* Fetch all modules */
        require('require-all')({
           /* In the nodes folder... */
           dirname: __dirname + '/drivers/',
           /* .. take all modules */
           filter: /.*\.js$/,
           /* ... and instantiate them */
           resolve: resolver
        });
    }

    /* Startup the operator */
    public static async run() {
        /* Retrieve all devices */
        await this.retrieve();
    }

}