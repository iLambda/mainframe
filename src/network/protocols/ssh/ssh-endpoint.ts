import cfg = require('../../../../cfg/network.json')
import chalk = require('chalk')
import ssh2 = require('ssh2')
import { Writable } from 'stream'
import { Fault } from '../../../tools/fault'
import { Endpoint, Capabilities } from '../../endpoint'
import { Server } from '../../server'
import { SSHClient } from './ssh-client'
import { SSHWordTransform } from './ssh-word-transform'
import { rejects } from 'assert'

declare abstract class SSHServer extends Server {}


export class SSHEndpoint extends Endpoint implements Capabilities.IO {

    /* The client */
    readonly client: SSHClient;
    /* The underlying stream */
    private channel: ssh2.ServerChannel | null;
    /* The transformer */
    private curedStdin: SSHWordTransform | null;

    /* Get the cured input stream */
    private get curedStream() {
        /* Check channel */
        if (!this.curedStdin) {
            throw new Error("Stream hasn't been initialized.");
        }
        /* Return */
        return this.curedStdin;
    }

    /* Get the stream */
    public get stream() {
        /* Check channel */
        if (!this.channel) {
            throw new Error("Stream hasn't been initialized.");
        }
        /* Return */
        return this.channel;
    }
    /* Set the stream */
    public set stream(channel: ssh2.ServerChannel) {
        /* If not null */
        if (this.channel != null) {
            /* Error */
            throw new Error("Stream can only be set once for an SSH endpoint.");
        }
        /* Set */
        this.channel = channel;
        /* Pipe stdin to curing transform. Handle errors */
        this.curedStdin = this.channel.stdin.pipe(new SSHWordTransform());
    }

    /* Constructor */
    public constructor (server: SSHServer, client: SSHClient) {
        /* Call parent */
        super(server, 'type');
        /* Save ssh data */
        this.client = client;
        this.channel = null;
        this.curedStdin = null;
    }

    public kill() : void {
        /* Call base class */
        super.kill();
        /* Kill SSH client */
        this.client.connection.end();
    }

    public async greet() : Promise<void> {
        /* Make the handshake */
        const clearance = this.authenticator?.identifier || cfg.server.ssh.clearance;
        const descriptor = this.name 
            ? `Endpoint is ${this.name} (clearance ${clearance})`
            : `Default endpoint (clearance ${clearance})`;
        const separator = '#######################################################';
        /* Make the stream and give it to the endpoint ; handshake */
        await this.write(this.stream.stdout, `\r\n\r\n${separator}\r\n`);
        await this.write(this.stream.stdout, `# Mainframe @0.0.0.0\r\r\n`);
        await this.write(this.stream.stdout, `# ${descriptor}\r\n`);
        await this.write(this.stream.stdout, `${separator}\r\n\r\n`);
    }

    private async write(stream: Writable, msg: string) {
        /* Write to stream and check readyness*/
        if (!stream.write(msg)) {
            /* Must wait for drain */
            await new Promise(resolve => {
                /* Subscribe to drain */
                stream.once('drain', resolve);
            });
        }
    }

    public async say(message: string) {
        /* Format */
        const formatted = chalk`    {bold >} ${message}\r\n`;
        /* Write */
        this.write(this.stream.stdout, formatted);
    }

    public async report(message: string) { 
        /* Format */
        const formatted = chalk`    {bold >} ${message}\r\n`;
        /* Write */
        this.write(this.stream.stderr, formatted);
    }
    
    public async hear() {
        /* Write decorator */
        this.write(this.stream.stdout, chalk`{bold >}`);
        /* The data buffer */
        let chunks : Buffer[] = [];
        /* What happens when data is received */
        const onData = (chunk: Buffer) => {
            /* Add to buffer */
            chunks.push(chunk);
            /* Map backspaces to \b */
            const curedChunk = Array.from(chunk).flatMap((char, idx) => {
                return char === SSHWordTransform.backspace 
                        ? [0x08, 0x20, 0x08]
                        : [char];
            });
            /* Print */
            this.stream.stdout.write(Buffer.from(curedChunk).toString('ascii'));
        };
        /* Subscribe event and open */
        this.curedStream.addListener('data', onData);
        this.curedStream.allowData = true;
        /* Wait till stream closes */
        await new Promise<void>((resolve, reject) => {
            /* Error reporter */
            let thrower = () => reject(new Fault("Endpoint link has been severed."));
            /* Handle errors */
            this.curedStream
                .once('error', thrower)
                .once('close', thrower)
                .once('end', thrower)
            /* Stop when stream blocks */
            this.curedStream.once('block', () => {
                /* Unsub error handling */
                this.curedStream
                    .removeListener('error', thrower)
                    .removeListener('close', thrower)
                    .removeListener('end', thrower)
                /* Unsubscrive event */
                this.curedStream.removeListener('data', onData);
                /* Done */
                resolve();
            });
        })
        /* Print newline */
        await this.write(this.stream.stdout, '\r\n');
        /* All chunks are now there. Parse backspaces */
        /* Concat all */
        let cursor = 0;
        const uncuredData = Buffer.concat(chunks);
        const data = Buffer.alloc(uncuredData.length);
        /* Go through each char */
        for (let i = 0; i < uncuredData.length; i++) {
            /* Check character */
            if (uncuredData[i] !== SSHWordTransform.backspace) {
                /* Not a backspace. Add into buffer at cursor position */
                data[cursor] = uncuredData[i];
                /* Increment cursor */
                cursor++;
            } else {
                /* It is a backspace. Decrement cursor, but stay positive */
                if (cursor > 0) { cursor--; }
            }
        }
        /* Return data */
        return data.subarray(0, cursor).toString('ascii');
    }
}