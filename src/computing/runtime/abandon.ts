import { Link } from "./link"

export interface Continuation {
    /* The node */
    node: Link;
    /* The input data */
    input: any;
}

export class Abandon {

    /* Reason for exiting */
    readonly reason: string;
    /* The continuation */
    readonly continuation: Continuation;

    /* Make an early exit error */
    constructor(reason: string, continuation: Continuation) { 
        this.reason = reason;
        this.continuation = {
            node: continuation.node,
            input: continuation.input
        };
        
    }

}