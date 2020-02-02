export class IP {
    /* Bytes */
    public readonly bytes: [number, number, number, number];
    /* As a string */
    public get text() : string { return this.bytes.join('.'); }

    /* Constructor */
    constructor(ip: string | [number,number,number,number]) {
        /* Default */
        this.bytes = [0, 0, 0, 0];
        /* Check type */
        if (typeof ip === 'string') {
            /* It is a string */
            const regexp = /^(?=.*[^\.]$)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.?){4}$/;
            /* Validate */
            if (!regexp.test(ip)) {
                throw new Error("Invalid IP");
            }
            /* Parse */
            const raw = ip.split('.').map(s => parseInt(s));
            /* Set */
            this.bytes = [raw[0], raw[1], raw[2], raw[3]];

        } else if (ip instanceof Array) {
            /* Check all are in range */
            for (let i = 0; i < ip.length; i++) {
                if (!(ip[i] >= 0 && ip[i] <= 255)) {
                    throw new Error("Invalid IP");
                }
            }
            /* Set */
            this.bytes = ip;
        }
    }
}