import { Transform } from "stream"

export class SSHWordTransform extends Transform {

    /* Check if stream opened */
    public allowData : boolean = false;
    
    /* Backspace char */
    public static get backspace() { return SSHWordTransform.ascii('\x7F'); }
    /* Newline char */
    public static get newline() { return SSHWordTransform.ascii('\r'); }
    /* Punctuation */
    public static get punctuation() { 
        const chars = [ '?', ' ', '.', '-', '=', '+', '*', '&', "'", ','];
        return chars.map(SSHWordTransform.ascii); 
    }

    /* Build a transformer */
    constructor() {
        /* Build */
        super({
            objectMode: false,
            readableObjectMode: false,
            writableObjectMode: false
        });
    }

    /* Get ascii code */
    private static ascii(s: string) : number {
        return s.charCodeAt(0);
    }

    /* Check if word */
    private static isWordCharacter(c: number) : boolean {
        return (c >= SSHWordTransform.ascii('A') && c <= SSHWordTransform.ascii('Z'))    /* Handle A-Z */
            || (c >= SSHWordTransform.ascii('a') && c <= SSHWordTransform.ascii('z'))    /* Handle a-z */
            || (c >= SSHWordTransform.ascii('0') && c <= SSHWordTransform.ascii('9'))    /* Handle 0-9 */
            || (c == SSHWordTransform.backspace)   /* Handle backspace */
            || SSHWordTransform.punctuation.includes(c); /* Handle punctuation */
    }

    /* Transform */
    _transform(buffer: Buffer, encoding: string, next: () => void) : void {   
        /* Check if opened */
        if (this.allowData) {
            /* Get index of newline */
            const newlineIdx = buffer.indexOf(SSHWordTransform.newline);
            const hasNewline = newlineIdx != -1;
            /* Cut until newline */
            const chunk = hasNewline
                            ? buffer.subarray(0, newlineIdx)
                            : buffer;
            /* Filter */
            const filteredData = chunk.filter(SSHWordTransform.isWordCharacter);
            /* Check length */
            if (filteredData.length != 0) {
                /* Push */
                this.push(Buffer.from(filteredData));
            }
            /* If newline, close stream */
            if (hasNewline) {
                this.allowData = false;
                /* Send event */
                this.emit('block')
            }
        }
        /* Done */
        next();
    }


}