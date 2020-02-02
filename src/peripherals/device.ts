import { REPL } from '../interaction/repl'
import { Fault } from '../tools/fault'

/* Specify this class represents a device */
export function device(name: string) {
    /* Check if class is node */
    return function(target: any) {
        /* Define device: and metadata */
        Reflect.defineMetadata('device:', true, target);
        Reflect.defineMetadata('device:names', name, target);
    }
}

/* A device */
export abstract class Device {
    /* Display name */
    public get devname() : string | null {
        /* The name */
        const name = Reflect.getMetadata('device:names', this.constructor);
        /* Check if string */
        return typeof name === 'string' ? name : null;
    }
    /* Display name */
    public abstract get name() : string;
    /* Configuration data */
    public abstract get configuration() : any;
    /* Hash */
    public abstract get hash() : string;

    /* Initialize the device */
    public abstract async open() : Promise<void>;

    /* Register a device of this type */
    public static async register(repl: REPL) : Promise<Device> {
        throw new Fault('There is no registration procedure on file for such a device.');
    }
}