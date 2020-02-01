import { Capabilities, Endpoint } from '../network/endpoint'
import { Fault } from '../tools/fault'
import { Interpret, VoiceInterpret, TypeInterpret } from './nlp/interpret'
import { Utterance } from './nlp/data/utterance'
import { Controller } from '../computing/controller'

export type InputMode = 'voice' | 'type';
export class REPL {
    
    /* The last occurring error */
    private lastError: Fault | null = null;
    /* The endpoint */
    readonly endpoint: Endpoint;
    /* The interpreter */
    readonly interpret: Interpret;
    /* The controller */
    readonly controller : Controller;

    /* The IO layer for the REPL */
    public get io() : Capabilities.IO { return this.endpoint; }

    /* Constructor */
    constructor(endpoint: Endpoint, inputmode: InputMode) {
        /* Save endpoint and make controller*/
        this.endpoint = endpoint;
        this.controller = new Controller(this);
        /* Decide which interpret to use */
        switch(inputmode) {
            /* This REPL will have commands said out loud */
            case 'voice': { this.interpret = new VoiceInterpret(); break; }
            /* This REPL will have commands typed */
            case 'type': { this.interpret = new TypeInterpret(); break; }
        }
    }

    /* Run the REPL */
    public async run() : Promise<void> {
        /* Train the controller's net */
        await this.controller.train();
        /* Evaluation loop */
        while (true) {
            /* Watch for a Fault */
            try {
                /* Wait for interaction, and build utterance */
                const command = await this.endpoint.hear();
                const utterance = this.interpret.parse(command);
                /* Call the command */
                await this.controller.execute(utterance);
            } catch(e) {
                /* Check type of error */
                if (e instanceof Fault) {
                    /* Save the error */
                    this.lastError = e;
                    /* An error occured */
                    await this.endpoint.report(e.reason);
                } else {
                    /* Rethrow */
                    throw e;
                }
            }
        }
    }
    
}