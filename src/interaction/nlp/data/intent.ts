/* An intent's modality */
export type Modality = 'question' | 'order';

/* An intent */
export interface Intent {
    /* Is it a question or an order ? */
    modality : Modality;
    /* The subjects the sentence is talking about */
    subjects: string[];
}
