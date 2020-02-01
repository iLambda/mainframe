import { Intent } from "./intent"
import { Interpret, Semantics } from "../interpret"

/* An interpreted text typed/spoken by an user */
export class Utterance {
    /* The original text */
    public get text() { return this.semantics.text(); }
    /* The cured text */
    public get cured() { return Interpret.cure(this); }

    /* The intent */
    readonly intent: Intent;
    /* The semantics */
    readonly semantics: Semantics;

    /* Build an utterance */
    constructor (interpret: Interpret, intent: Intent, semantics: Semantics) {
        /* Save text and parse */
        this.intent = intent;
        this.semantics = semantics;
    }
};