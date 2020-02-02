import natural from 'natural'
import compromise from 'compromise'
import compromise_numbers from 'compromise-numbers'
import compromise_sentences from 'compromise-sentences'
import { Intent } from './data/intent'
import { WordMatch } from './data/wordmatch'
import { Utterance } from './data/utterance'

/* Import compromise plugins */
compromise.extend(compromise_numbers);
compromise.extend(compromise_sentences);

/* Define type for semantics */
export type Semantics = compromise.Document;

/* The natural language interpret */
export abstract class Interpret {

    /* Constants */
    public abstract readonly tokenizer : natural.Tokenizer;
    public abstract readonly stemmer : natural.Stemmer;
    
    /* Constructor */
    public constructor() { }

    /* Get semantics */
    private semantics(text: string) : Semantics {
        /* Parse it */
        const semantics = compromise(text);
        /* Normalize text */
        semantics.normalize();
        /* Return */
        return semantics;
    }

    /* Get intent */
    private intent(semantics: Semantics) : Intent {
        /* Get text */
        const text = semantics.text();
        /* Stem and tokenize */
        let stemmed = this.stemmer.tokenizeAndStem(text);
        // console.log(stemmed);
        
        return { 
            modality: 'question',
            subjects: []
        };
    }


    /* Cure some text */
    public static cure(text: string | Utterance | Semantics) : string{
        /* Return cured text */
        const semantics = 
            text instanceof Utterance ? text.semantics :
            typeof text === "string"  ? compromise(text) 
                                      : text;
        return (<any><unknown>(semantics.normalize())).text();
    }


    /* Get closest word that matches in the list of words */
    public abstract closest(word: string, dictionary: string[]) : WordMatch;

    /* Parse an utterance */
    public parse(text: string) : Utterance {
        /* Parse the semantics, then the intent */
        const semantics = this.semantics(text);
        const intent = this.intent(semantics);
        /* Return the utterance */
        return new Utterance(this, intent, semantics)
    }

    /* Tokenize and stem */
    public stemtokenize(text: string) : string[] {
        return this.stemmer.tokenizeAndStem(text);
    }

    /* Pluralize */
    public pluralize(word: string, fun: 'noun' | 'verb') : string {
        /* Check function */
        switch (fun) {
            case 'noun': return new natural.NounInflector().pluralize(word);
            case 'verb': return new natural.PresentVerbInflector().pluralize(word);
        }
    }
    /* Singularize */
    public singularize(word: string, fun: 'noun' | 'verb') : string {
        /* Check function */
        switch (fun) {
            case 'noun': return new natural.NounInflector().singularize(word);
            case 'verb': return new natural.PresentVerbInflector().singularize(word);
        }
    }

    /* Numberize */
    public numberize(word: string, count: number, fun: 'noun' | 'verb') : string {
        /* Check count */
        return count === 1 ? this.singularize(word, fun) : this.pluralize(word, fun);
    }
    /* Return a numberizer */
    public numberizer(count: number) {
        return (fun: 'noun' | 'verb') => ((word: string) => this.numberize(word, count, fun));
    }

}

export class VoiceInterpret extends Interpret {

    /* The tokenizer */
    public readonly tokenizer : natural.Tokenizer = new natural.WordTokenizer();
    /* The stemmer */
    public readonly stemmer : natural.Stemmer = natural.PorterStemmer;

    /* Get closest word that matches in the list of words */
    public closest(word: string, dictionary: string[]) : WordMatch {
        /* Return */
        return {
            set: dictionary,
            match: word,
            distance: 0.0
        };
    }
}

export class TypeInterpret extends Interpret {
    /* The tokenizer */
    public readonly tokenizer : natural.Tokenizer = new natural.WordTokenizer();
    /* The stemmer */
    public readonly stemmer : natural.Stemmer = natural.PorterStemmer;

    /* Get closest word that matches in the list of words */
    public closest(word: string, dictionary: string[]) : WordMatch {
        /* Return */
        return {
            set: dictionary,
            match: word,
            distance: 0.0
        };
    }
}