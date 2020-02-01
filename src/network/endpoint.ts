import { Authcode } from './authentication/authcode'
import { Server } from './server'
import { Fault } from '../tools/fault'
import { default as cfg } from "../../cfg/access.json"
import { pbkdf2, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { Database } from './authentication/database'
import { REPL, InputMode } from '../interaction/repl'

export abstract class Endpoint implements Capabilities.IO {
    
    /* The authcode */
    private authcode : Authcode | null;
    /* The name */
    private displayName : string | null;
    /* The server */
    readonly server : Server;
    /* The REPL */
    readonly repl : REPL;

    /* Get name */
    public get name() : string | null { return this.displayName; }
    /* Get authkey */
    public get authenticator() : Authcode | null { return this.authcode; }

    /* Constructor */
    constructor(server: Server, inputmode: InputMode = 'type') {
        /* Default fields */
        this.server = server;
        this.authcode = null;
        this.displayName = null;
        /* Create the REPL */
        this.repl = new REPL(this, inputmode);
    } 

    /* Send a greeting */
    public abstract async greet() : Promise<void>;

    /* Kill the endpoint */
    public kill() : void {
        /* Rescind */
        this.server.rescind(this);
    }

    /* The endpoint is ready */
    public async ready() : Promise<void> {
        /* Register */
        this.server.register(this);
        /* Run REPL */
        await this.repl.run();
    }

    /* Send a message */
    public abstract async say (message: string) : Promise<void>;
    /* Report an error */
    public abstract async report (message: string) : Promise<void>;
    /* Return data input by the user */
    public abstract async hear () : Promise<string>;

    /* Authenticate */
    public async authenticate(login: string, passcode: string) {
        /* Get endpoint id */
        const endpoint = await Database.getEndpointID(login);
        /* Check if endpoint w/ given login exists */
        if (endpoint == null) {
            /* Throw */
            throw new Fault("Endpoint does not exist.");
        }
        /* Derive key using PBKDF2 */
        const kdf = promisify(pbkdf2);
        const key = await kdf(passcode,
                              endpoint.salt, 
                              cfg.algorithms.pbkdf2.iterations, 
                              cfg.algorithms.pbkdf2.keylength, 
                              cfg.algorithms.pbkdf2.hash);
        const targetKey = Buffer.from(endpoint.pass, 'base64');
        
        if (!timingSafeEqual(targetKey, key)) {
            /* Throw */
            throw new Fault("Invalid password for this endpoint.");
        }
        /* Save name */
        this.displayName = endpoint.name;
        /* Check if auth id exists */
        if (endpoint.authid) {
            /* Invalidate old authcode and make new one */
            this.authcode?.invalidate();
            this.authcode = await Authcode.get(endpoint.authid);
        }
        /* Return the authcode */
        return this.authcode;
    }


    /* Register a new endpoint */
    public static async register(name: string, login: string, passcode: string, authkey: Authcode | null = null) {
        /* Check if username available */
        const endpoint = await Database.getEndpointID(login);
        /* Check if endpoint w/ given login exists */
        if (endpoint != null) {
            /* Throw */
            throw new Fault("Endpoint login is already in use.");
        }

        /* Generate salt */
        const saltbuffer = randomBytes(cfg.salt.endpoint);
        const salt = saltbuffer.toString('base64');
        /* Derive key using PBKDF2 */
        const kdf = promisify(pbkdf2);
        const keybuffer = await kdf(passcode,
                              salt, 
                              cfg.algorithms.pbkdf2.iterations, 
                              cfg.algorithms.pbkdf2.keylength, 
                              cfg.algorithms.pbkdf2.hash);
        const key = keybuffer.toString('base64');

        /* Get enpoint authid */
        const authid = authkey?.identifier;
        /* Insert into database */
        await Database.registerEndpoint(name, login, key, salt, authid != null ? authid : null);
    }
    
}

export namespace Capabilities {
    
    /* I/O supports */
    export interface IO {
        /* Say something */
        say: (message: string) => Promise<void>;
        /* Report an error */
        report: (message: string) => Promise<void>;
        /* Read something */
        hear: () => Promise<string>;
    }

}
