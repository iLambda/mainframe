import winston = require('winston');

/* The logger */
export class Logger {

    /* The winston logger */
    private logger: winston.Logger;
    /* The log name */
    readonly name: string;

    /* The default constructor */
    constructor(name: string) {
        /* Save name */
        this.name = name;
        /* Make the logger */
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: `log/${this.name}.log` })
            ]
        });
    }

    /* Log */
    log(level: string, msg: string) { this.logger.log(level, `{${this.name}} ${msg}`); }
    /* Log with levels */
    error(msg: string) { this.log('error', msg); }
    warn(msg: string) { this.log('warn', msg); }
    info(msg: string) { this.log('info', msg); }
    verbose(msg: string) { this.log('verbose', msg); }
    debug(msg: string) { this.log('debug', msg); }
    silly(msg: string) { this.log('silly', msg); }
}