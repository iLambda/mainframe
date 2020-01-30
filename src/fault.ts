export class Fault {

    /* Reason for exiting */
    readonly reason: string;
    /* Detailed error message */
    readonly explanation: string | null;

    /* Make an early exit error */
    constructor(reason: string, explanation: string | null = null) { 
        /* Save */
        this.reason = reason;
        this.explanation = explanation;
    }

}