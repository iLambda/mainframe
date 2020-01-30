import cfg = require('../../../../cfg/network.json')
import ssh2 = require('ssh2')
import { promisify } from 'util'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Endpoint } from '../../endpoint'
import { SSHEndpoint } from './ssh-endpoint'
import { Server } from '../../server'

export class SSHServer implements Server {
    
    /* The server */
    private sshserver : ssh2.Server;
    /* The endpoints */
    private sshendpoints : SSHEndpoint[];
    

    /* Return endpoints */
    public get endpoints() : readonly Endpoint[] {
        /* Shallow copy */
        return this.sshendpoints;
    }

    /* Build a SSHServer */
    public constructor() {
        /* Compute path to the keys */
        const keys = cfg.server.ssh.keys.map(key => resolve(__dirname, '../../../../../', key.private));
        /* Make the server */
        this.sshendpoints = [];
        this.sshserver = new ssh2.Server({
            /* The host keys */
            hostKeys: keys.map(f => readFileSync(f)),
            // The display name of the server
            ident: "Mainframe SSH Endpoint",
            /* The greeting send before handshaking */ 
            greeting: cfg.server.ssh.messages.greeting,
            /* The banner sent before authentication */
            banner: cfg.server.ssh.messages.banner
        },
        /* The connection handler */
        this.onConnect.bind(this));
    }

    public register(endpoint: SSHEndpoint): SSHEndpoint {
        /* Add */
        this.sshendpoints.push(endpoint);
        /* Return */
        return endpoint;
    }

    public rescind(endpoint: SSHEndpoint): void {
        /* Find index */
        const idx = this.sshendpoints.indexOf(endpoint);
        /* Check if endpoint was in the list */
        if (idx < 0) { return; }
        /* Actually remove */
        this.sshendpoints.splice(idx, 1);
    }

    /* Run server */
    public async run() {
        /* Run the server */
        await new Promise<void>((resolve) => {
            /* Start listening */
            this.sshserver.listen(
                /* The SSH port */
                cfg.server.ssh.port, 
                /* Hostname */
                cfg.server.ssh.hostname,
                /* Callback */
                resolve)
        });
    }

    /* Called when a connection is established */
    private onConnect(connection: ssh2.Connection, info: ssh2.ClientInfo) : void {
        /* New endpoint */
        const endpoint = new SSHEndpoint(this, { connection, info });
        /* Register callbacks */
        connection.on('authentication', this.onAuthentication.bind(this, endpoint));
        connection.on('ready', this.onReady.bind(this, endpoint));
        connection.on('end', this.onDisconnect.bind(this, endpoint));
    }

    /* Called when a client is disconnected */
    private async onAuthentication(endpoint: SSHEndpoint, ctx: ssh2.AuthContext) {
        ctx.accept(); return;
        /* Check method of identification */
        // switch (ctx.method) {
        //     /* Log in with password */
        //     case 'password':
        //         /* Try authenticate */
        //         try { await endpoint.authenticate(ctx.username, ctx.password); }
        //         catch (error) {
        //             /* Check if fault */
        //             let reason = error instanceof Fault 
        //                             /* Reason is available */
        //                             ? [ (<Fault>error).reason ]
        //                             /* No detail */
        //                             : undefined;
        //             /* Error occured. Reject */
        //             ctx.reject(reason, true); 
        //             return;
        //         }
        //         /* It worked */
        //         ctx.accept();
        //         return;

        //     /* Log with public key */
        //     case 'publickey':
        //         /* Accept (TODO) */
        //         ctx.reject();
        //         return;
        // }
        // /* Else, reject */
        // ctx.reject(); 
    }

    /* Called when a client is ready */
    private onReady(endpoint: SSHEndpoint) {
        /* Client has been authenticated */
        endpoint.client.connection.on('session', (accept, reject) => {
            /* Accept the session request */
            let session = accept();
            /* Listen PTY event */
            session.once('pty', (accept) => accept());
            /* Listen 'shell' event */
            session.once('shell', async (accept) => {
                /* Save stream */
                endpoint.stream = accept();
                /* Greet and ready */
                await endpoint.greet();
                await endpoint.ready();
            });
        });
    }

    /* Called when a client is disconnected */
    private onDisconnect(endpoint: SSHEndpoint) : void {
        /* Rescind */
        this.rescind(endpoint);
    }

}