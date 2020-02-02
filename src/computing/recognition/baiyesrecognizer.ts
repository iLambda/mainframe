import natural from 'natural'
import { Recognizer } from './recognizer'
import { Utterance } from '../../interaction/nlp/data/utterance'
import { Dictionary } from '../../tools/container/dictionary';
import { SubjectDictionary, Net } from '../net';
import { Interpret } from '../../interaction/nlp/interpret';
import { assert } from '../../tools/assert';
import { Link, subject } from '../runtime/link';

interface ClassifierHierarchy {
    /* The classifier */
    classifier: natural.LogisticRegressionClassifier | null;
    /* The subclassifiers */
    subclassifiers: Dictionary<ClassifierHierarchy>;
    /* Its own data */
    data: string[];
    /* Its name */
    identifier: string | null;
}

export class NaiveRecognizer extends Recognizer {

    /* The root node hierarchy */
    private nodes: SubjectDictionary;
    /* The classifier hierarchy */
    private classifiers: ClassifierHierarchy;

    /* The constructor */
    public constructor(net: Net, interpret: Interpret) {
        /* Parent */
        super(net, interpret);
        /* Initialize own fields */
        this.nodes = net.root();
        /* Populate the classifier hierarchy */
        this.classifiers = this.populate(this.nodes);
    }

    private populate(links: SubjectDictionary, identifier: string | null = null, link: Link | null = null) : ClassifierHierarchy {
        /* The subclassifier array */
        const subclassifiers : Dictionary<ClassifierHierarchy> = {};
        /* Get all keys */
        for (const key in links) {
            /* Check if self key */
            if (!links.hasOwnProperty(key)) { continue; }
            /* Make identifier */
            const subid = identifier ? `${identifier}.${key}` : `${key}`;
            /* Add key, and populate */
            subclassifiers[key] = this.populate(links[key].sublinks, subid, links[key].link);
        }
        /* Get own training data */
        const data = link?.nldata ?? [];
        /* Return */
        return {
            /* Only create a classifier if link has sublinks */
            classifier: Object.entries(links).length != 0 ? new natural.LogisticRegressionClassifier() : null,
            /* Add the rest of the object properties */
            identifier,
            subclassifiers,
            data
        };
    }

    private preprocess(sentence: string | Utterance) : string {
        return Interpret.cure(sentence);
    }

    private async train() {
        /* Add documents */
        const addDocuments = (classifier: natural.LogisticRegressionClassifier, text: string[], stem: string) => {
            text.map(t => this.preprocess(t)).forEach(t => classifier.addDocument(t, stem))
        }

        /* The training samples memoization array */
        const samples : Dictionary<string[]> = {};
        /* Train a classifier */
        const subtrain = (hierarchy: ClassifierHierarchy) => {
            /* Check if any subclassifiers */
            if (Object.entries(hierarchy.subclassifiers).length == 0) {
                /* Leaf. Check if not root node */
                if (hierarchy.identifier) {
                    /* Save single training data */
                    samples[hierarchy.identifier] = hierarchy.data;
                }
            } else {
                /* Node. Assert classifier exists */
                assert(hierarchy.classifier != null, "Node classifier is null!"); 
                /* Get the classifier */
                const classifier = hierarchy.classifier;

                /* Check if this is the root node */
                if (hierarchy.identifier) {
                    /* For each sentence, train this node */
                    addDocuments(classifier, hierarchy.data, hierarchy.identifier);
                }
                /* For each subclass */
                Object.entries(hierarchy.subclassifiers).forEach(([_, subhierarchy]) => {
                    /* Assert subhierarchy isn't root */
                    assert(subhierarchy.identifier != null, "Subclassifier cannot be root!"); 
                    /* Train the child */
                    subtrain(subhierarchy);
                    /* For each sentence, train this node */
                    addDocuments(classifier, samples[subhierarchy.identifier], subhierarchy.identifier);
                })
                /* End training */
                classifier.train();

                /* Now, it is time to fullfill the invariant 
                   and concatenate all children data with self,
                   for memoization purposes */
                const childrenData = Object.entries(hierarchy.subclassifiers).flatMap(([_, subhierarchy]) => {
                    /* Assert subhierarchy isn't root */
                    assert(subhierarchy.identifier != null, "Subclassifier cannot be root!"); 
                    /* Return */
                    return samples[subhierarchy.identifier] ?? [];
                })
                const ownData = hierarchy.data;
                /* Concatenate and set */
                if (hierarchy.identifier) { 
                    samples[hierarchy.identifier] = [...ownData, ...childrenData];
                }
            }

        };

        /* Train the subclassifiers */
        subtrain(this.classifiers);
    }
    
    public async recall(){
        /* Train network */
        this.train();
    }

    public async classify(utterance: Utterance) : Promise<string | null> {
        /* Pick one subject */
        const pick = (hierarchy: ClassifierHierarchy, threshold: number | null = null) : string | null => {
            /* Check classifier */
            if (!hierarchy.classifier) {
                throw new Error("Classifier has not been trained.");
            }

            /* Get classifications and sort */
            const classification = hierarchy.classifier
                                        .getClassifications(utterance.text)
                                        .sort(c => c.value);
            /* Get top classification score */
            const score = classification[0].value;
            const label = classification[0].label;
            /* Try get the subclassifier */
            const subidentifier = label.replace(/.*\.([^\.]+)$/g, "$1");
            const subhierarchy = hierarchy.subclassifiers[subidentifier];
            /* Make the threshold check */
            const thresholdOk = threshold ? score > threshold : true;
            /* Check if there are subclassifiers */
            if (subhierarchy?.classifier && thresholdOk) {
                /* Pick in the subhierarchy */
                return pick(subhierarchy);
            } else {
                /* Return if threshold */
                return thresholdOk ? label : null;
            }
        };        
        /* Check if the top classification is over 1/2 */   
        return pick(this.classifiers, 0.5);
    }

}