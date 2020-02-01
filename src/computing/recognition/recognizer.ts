import { Net } from '../net';
import { Interpret } from '../../interaction/nlp/interpret';
import { Utterance } from '../../interaction/nlp/data/utterance';

export abstract class Recognizer { 

    /* The net the recognizer was made from */
    readonly net: Net;
    /* The interpret */
    readonly interpret: Interpret;

    /* Build a recognizer */
    constructor(net: Net, interpret: Interpret) {
        this.net = net;
        this.interpret = interpret;
    }

    /* Train the recognizer, or load weights */
    public async abstract recall() : Promise<void>;
    /* Classify an utterance. Returns a list of possible subjects that have an associated link */
    public async abstract classify(utterance: Utterance) : Promise<string | null>;

}