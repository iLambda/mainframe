import { REPL } from "../interaction/repl"
import { Link } from './runtime/link'
import { Net } from './net'
import { Fault } from "../fault"
import { Utterance } from '../interaction/nlp/data/utterance'

export class Controller {
    
    /* The links */
    private net: Net;
    /* The REPL this controller is linked to */
    readonly repl : REPL;

    /* Create a constructor */
    public constructor(repl: REPL) {
        /* Save REPL */
        this.repl = repl;
        /* Make net */
        this.net = new Net(repl.interpret);
    }

    /* Train the net */
    public async train() {
        /* Train the net */
        await this.net.train();
    }

    /* Find link, given output type */
    private pick(outputType: string) : Link | null {
        /* If type is nothing, no node is needed */
        if (outputType === 'nothing') { return null; }

        /* Get the links */
        const candidates = this.net.get(outputType);
        /* Check list length */
        if (candidates.length === 0) {
            throw new Fault(`No defined behavior for obtaining a '${outputType}'.`);
        } else if (candidates.length > 1) {
            throw new Fault(`Too many candidates for obtaining a '${outputType}'.`)
        }
        /* Return the only */
        return candidates[0];
    }

    /* Run a link with dependencies */
    private async run(link: Link) : Promise<any> {
        /* Check link input type */
        if (link.input.length == 0) {
            /* No dependencies. Run right now */
            return await link.handler(this.repl);
        } else {
            /* Dependencies. Get all dependent links */
            const dependencies = link.input.map(i => this.pick(i));
            /* Run them all */
            const results = [];
            for (let i = 0; i < dependencies.length; i++) {
                /* Check if dependency run needed */
                const dependency = dependencies[i];
                if (!dependency) { continue; }
                /* Run parent node */
                const result = await this.run(dependency);
                results.push(result);                
            }
            /* Call this node, with parameters */
            return await link.handler(this.repl, ...results);
        }
    }

    /* Execute a command */
    public async execute(subject: Utterance | Link) : Promise<void> {
        /* The link to be executed */
        let link : Link;
        /* Check type */
        if (subject instanceof Utterance) {
            /* We use an utterance. Try pick node */
            link = await this.net.choose(subject);
        } else {
            /* A link is specified. Check it is inside net */
            if (!this.net.has(subject)) {
                throw new Error("Executed link must belong to underlying net.");
            }
            /* Set */
            link = subject;
        }
        /* Run the command */
        await this.run(link);
    }
    
}