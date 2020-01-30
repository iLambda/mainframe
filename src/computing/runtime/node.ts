import 'reflect-metadata'
import { REPL } from '../../interaction/repl'
import { Link } from './link'
import { Dictionary } from '../../tools/dictionary';

/* A node contains multiple links */
export abstract class Node {

    /* The links of a node */
    public get links() : readonly Link[] {
        /* The list of links */
        const links : Link[] = [];
        const allsubjects : Set<string> = new Set<string>();
        /* Go through all properties */
        for (var propname in this) {
            /* Check if link */
            if(!Reflect.getMetadata('link:', this, propname)) { 
                continue; 
            } 
            /* Get its signature */
            const output : string = Reflect.getMetadata('link:output', this, propname);
            const parameters : Function[] = Reflect.getMetadata('design:paramtypes', this, propname);
            /* Typecheck */
            if (parameters[0] !== REPL) {
                throw new Error("A link must have take REPL as its first parameter");
            }
            /* Get subjects */
            const subjects : string[] = Reflect.getMetadata('link:subjects', this, propname) ?? [];
            /* Check subjects exists */
            if (subjects.length == 0) {
                /* Check if node terminal */
                if (output === 'nothing') {
                    throw new Error("A terminal link must have at least one subject");
                }
            } else {
                /* Check if overlap */
                if(subjects.some(s => allsubjects.has(s))) {
                    /* There is an ovelap. */
                    throw new Error(`Link subjects must not overlap`);
                }
                /* Merge */
                subjects.forEach(s => allsubjects.add(s));
            }
            /* Get nldata file */
            const nlfile : Dictionary<string[]> = Reflect.getMetadata('link:nldata', this.constructor) ?? {};
            const nldata = subjects.flatMap(subject => nlfile?.[subject] ?? []) ?? [];
            /* Make input list */
            const input = parameters.slice(1).map(f => f.name);
            /* Convert the handler */
            const handler = 
                <(repl: REPL, ...args: any[]) => any>
                <unknown>this[propname];
            /* Its ok. Add it */
            links.push({ node: this, handler, output, input, subjects, nldata });
        }
        /* Return */
        return links;
    }

    /* The default constructor */
    constructor() {}
}