import cfg = require('../../../cfg/access.json')
import { Fault } from '../../tools/fault';
import { Database } from './database'
import { pbkdf2 } from 'crypto'
import { promisify } from 'util'

export class Authcode {
    
    /* The auth key id */
    private id: number | null = null;
    /* Clearance level */
    private level: number = NaN;

    /* Is the authcode valid ? */
    public get valid() : boolean { return this.id != null; }
    /* The clearance level */
    public get clearance() : number | null { return isNaN(this.level) ? null : this.level; }
    /* The key ID */
    public get identifier() { return this.id; }

    
    /* Constructor */
    private constructor(id: number, level: number) { 
        /* Initialize */
        this.level = level;
        this.id = id;
    }


    /* Invalidate */
    public invalidate() : void {
        /* Invalidate */
        this.level = NaN;
        this.id = null;
    }

    /* Cure the passcode */
    private static cure(passcode: string) {
        /* TODO */
        return passcode;
    }

    /* Hash the passcode */
    private static async hash(passcode: string) {
        /* Cure the passcode */
        const cured = this.cure(passcode);
        /* Get the pepper */
        const pepper = cfg.pepper.authcode;
        /* Derive key using PBKDF2 */
        const kdf = promisify(pbkdf2);  
        const key = await kdf(cured, pepper, cfg.algorithms.pbkdf2.iterations, cfg.algorithms.pbkdf2.keylength, cfg.algorithms.pbkdf2.hash);
        /* Hash */
        return key.toString('ascii');
    }
    
    /* Make an auth code */
    public static async get(passcodeOrID: string | number) {
        /* Make db request */
        const dbrequest = async () => {
            /* Check parameter type */
            switch (typeof(passcodeOrID)) {
                /* String */
                case 'string':
                    /* Hash passcode and check key */
                    const key = await this.hash(passcodeOrID);
                    /* Check key validity */
                    return await Database.getAuthkey(key);
                /* Number */
                case 'number':
                    /* Return */
                    return await Database.getAuthkeyByID(passcodeOrID);
            }
        };
        /* Get db entry */
        const entry = await dbrequest();

        /* If does not exist */
        if (entry == null) {
            /* Throw */
            throw new Fault("Authorization code does not exist.");
        }
        /* Check its validity */
        if (entry.revoked) {
            /* Log into db (TODO) */
            /* Throw */
            throw new Fault(
                "Authorization code has been revoked.", 
                "The specified authorization code has been revoked. This incident will be reported in the log.");
        }
        /* Get the data */ 
        return new Authcode(entry.id, entry.clearance);
    }

    /* Check if task is allowed */
    public async allows(task: string) {
        /* If invalidated */
        if (this.id == null || this.clearance == null) {
            /* Code is not valid */
            throw new Fault("Authorization code is invalid.");
        }
        /* Check if revoked */
        if (await Database.isAuthkeyRevoked(this.id)) {
            /* Log into db (TODO) */
            /* Throw */
            throw new Fault(
                "Authorization code has been revoked.", 
                "The specified authorization code has been revoked. This incident will be reported in the log.");
        }
        /* Get target clearance level. */
        const tasklevel = await Database.getTaskClearance(task);
        /* Check if task exists */
        if (tasklevel == null) {
            /* Task not found. Can't be performed */
            return false;
        }
        /* Compare clearance level */
        return this.clearance <= tasklevel;
    }

    /* Assert that the task is allowed. */
    public async allowed(task: string) {
        /* If invalidated */
        if (this.id == null || this.clearance == null) {
            /* Code is not valid */
            throw new Fault("Authorization code is invalid.");
        }
        /* Check if revoked */
        if (await Database.isAuthkeyRevoked(this.id)) {
            /* Log into db (TODO) */
            /* Throw */
            throw new Fault(
                "Authorization code has been revoked.", 
                "The specified authorization code has been revoked. This incident will be reported in the log.");
        }
        /* Get target clearance level. */
        const tasklevel = await Database.getTaskClearance(task);
        /* Check if task exists */
        if (tasklevel == null) {
            /* Task not found. Can't be performed */
            throw new Fault(
                "This task cannot be performed.",
                "No clearance level has been defined for this task.");
        }
        /* Compare clearance level */
        if (!(this.clearance <= tasklevel)) {
            /* Not enough clearance */
            throw new Fault(
                "Insufficient permission.",
                `This task requires clearance level ${tasklevel}.`
            );
        }

    }

}