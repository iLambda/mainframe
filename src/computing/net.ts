import { Dictionary } from "../tools/container/dictionary"
import { Node } from "./runtime/node"
import { Link, subject } from "./runtime/link"
import { Recognizer } from './recognition/recognizer'
import { NaiveRecognizer } from './recognition/baiyesrecognizer'
import { Interpret } from '../interaction/nlp/interpret'
import { Utterance } from '../interaction/nlp/data/utterance'
import { Fault } from '../tools/fault'

export interface SubjectDictionary {
    /* The root keys */
    [Key: string]: {
        /* The link */
        link: Link;
        /* Its children */
        sublinks: SubjectDictionary;
    };
}

export class Net {
        
    /* The links. Key represents the return type of the link */
    private links: Dictionary<Link[]> = {};
    /* The recognizer */
    private recognizer: Recognizer;
    /* The interpret */
    readonly interpret: Interpret;

    /* Constructor */
    constructor(interpret: Interpret) {
        /* Fetch all links */
        this.load();
        /* Save the interpret */
        this.interpret = interpret;
        /* Make the recognizer */
        this.recognizer = new NaiveRecognizer(this, interpret);
    }

    /* Initialize the classifier */
    public async train() {
        /* Train the recognizer */
        this.recognizer.recall();
    }

    /* Given an utterance, choose a node */
    public async choose(utterance: Utterance) : Promise<Link> {
        /* Analyze utterance to get subject */
        const subject = await this.recognizer.classify(utterance);
        const bestMatch = this.get().find(l => subject ? l.subjects.includes(subject) : false);
        /* Check if match */
        if (!bestMatch) {
            throw new Fault("Command couldn't be understood.");
        }
        /* Pick node */
        return bestMatch;
    }

    /* Get nodes with given return type */
    public get(type? : Function | string) : readonly Link[] {
        /* Get name */
        const typename = typeof type === 'string' ? type : 
                         typeof type === 'function' ? type.name :
                         'nothing';
        /* Return nodes with given key */
        const links = this.links[typename]; 
        return links ? links : [];
    }

    /* Check if module belongs to the net */
    public has(link: Link) : boolean {
        /* Check */
        return this.links[link.output]?.includes(link);
    }
    
    /* Load modules */
    private load() : void {
        /* The module resolver */
        const resolver = (Module: any) => {
             /* Check if 'Nodes' namespace exists */
             if (!Module.Nodes) { return null; }
             /* Make it all */
             for (let key in Module.Nodes) {
                 /* Make it, and register */
                 const node = new Module.Nodes[key]();
                 /* Check if ok, and push links */
                 if (node instanceof Node) {
                     this.register(...node.links);
                 }
             }
         };
        /* Fetch all modules */
        require('require-all')({
            /* In the nodes folder... */
            dirname: __dirname + '/runtime/nodes',
            /* .. take all modules */
            filter: /.*\.js$/,
            /* ... and instantiate them */
            resolve: resolver
        });
     }

    /* Get the root nodes ordered by subject */
    public root() : SubjectDictionary {
        /* Make the dictionary and get all root links */
        const dictionary = {};
        const links = this.get();
        /* The intermediary map containing nodes * subjects */
        const pairs = links.flatMap(
                        link => link.subjects.map(
                            subject => [subject, link] as [string, Link]));
        /* Sort according to depth */
        pairs.sort(([subA, _linkA], [subB, _linkB]) =>  {
            /* Check for equality */
            if (subA === subB) { return 0; }
            /* Split alongside dots */
            const depthA = /\./g.exec(subA)?.length ?? 0;
            const depthB = /\./g.exec(subB)?.length ?? 0;
            /* Compare the depth */
            const depthDiff = depthA - depthB;
            if (depthDiff !== 0) { 
                return depthDiff;
            }
            /* Depth is equal. Order does not matter */
            return +(subA > subB) - +(subA < subB);
        });
        
        /* Iterate */
        pairs.forEach(([subject, link]) => {
            /* Get depth, and access fields */
            const fields = subject.split('.');
            const depth = fields.length - 1;
            /* Check if all parent nodes exist */
            let node : SubjectDictionary = dictionary;
            for (let i = 0; i < depth; i++) {
                /* If i_th field does not exists */    
                if (!(fields[i] in node)) {
                    /* Error */
                    throw new Error(`Link has subject ${subject}, but no parent subject ${fields.slice(0, i+1).join('.')} was declared.`);
                }
                /* Go deeper */
                node = node[fields[i]].sublinks;
            }
            /* Check if subject is free */
            if (fields[depth] in node) {
                throw new Error(`Subject ${subject} was already claimed by another link.`);
            }
            /* Add it */
            node[fields[depth]] = { link, sublinks: {} };
        });        
        /* Return */
        return dictionary;        
    }

    /* Register a new link */
    private register(...links: Link[]) : void {
        /* Get all functions */
        links.forEach(link => {
            /* Get output type */
            const output = link.output;
            /* Check if dictionary has key, and put link in it */
            let array = this.links[output];
            array = array ? array : [];
            array.push(link);
            /* Set */
            this.links[output] = array;
        });
    }
}