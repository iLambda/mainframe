import 'reflect-metadata'
import { Node } from './node'
import { Modality } from '../../interaction/nlp/data/intent'
import { REPL } from '../../interaction/repl'
import { Dictionary } from '../../tools/container/dictionary'

/* A link is a function taking a repl and other arguments */
export interface Link {
    /* The node it belongs to */
    readonly node: Node;
    /* The handler */
    readonly handler: (repl: REPL, ...args: any[]) => any;
    /* The output type */
    readonly output: string;
    /* The input type */
    readonly input: string[];
    /* The subjects */
    readonly subjects: string[];
    /* The training sentences */
    readonly nldata: string[];
};

/* Specify this function's natural language data file */
export function nldata(data: Dictionary<string[]>) {
    return function(target: any) {
        /* Define link: and output type metadata */
        Reflect.defineMetadata('link:nldata', data, target);
    }
}
/* Specify this function represents a link */
export function link(output?: Function) {
    /* Get output type */
    const outputname = output?.name ?? 'nothing';
    /* Check if class is node */
    return function<T extends Node>(target: T, key: string, desc: PropertyDescriptor) {
        /* Define link: and output type metadata */
        Reflect.defineMetadata('link:', true, target, key);
        Reflect.defineMetadata('link:output', outputname, target, key);
    }
}

/* Specify subject of function */
export function subject(subject: string, modalities?: Modality[]) {
    /* Return descriptor */
    return function<T extends Node>(target: T, key: string, desc: PropertyDescriptor) {
        /* Get intent list and push to it */
        const intents : string[] = Reflect.getMetadata('link:subjects', target, key) ?? [];
        intents.push(subject);
        /* Define intent & training data*/
        Reflect.defineMetadata('link:subjects', intents, target, key);
    }
}