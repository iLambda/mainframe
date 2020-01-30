import * as data from './time.json'
import { REPL } from '../../../interaction/repl'
import { Node } from '../node';
import { link, nldata, subject } from '../link'

export namespace Nodes {

    @nldata(data)
    export class Time extends Node {

        /* Give the date */
        @link()
        @subject('date')
        public async date(repl: REPL) : Promise<void> {
            await repl.endpoint.say("You asked for the date.")
        }

        /* Give the hour */
        @link()
        @subject('date.year')
        public async year(repl: REPL) : Promise<void> { 
            /* Get today's date */
            const date = new Date();
            /* Say it */
            await repl.endpoint.say(`The year is ${date.getFullYear()}.`);
        }

        /* Give the day */
        @link()
        @subject('date.day')
        public async day(repl: REPL) : Promise<void> { 
            /* Get today's date */
            const date = new Date();
            /* Get parameters */
            const day = {
                name: date.toLocaleDateString('en-US', { weekday: 'long' }),
                number: date.getDate()
            };
            /* Say it */
            await repl.endpoint.say(`Today is ${day.name} ${day.number}.`);
        }

        /* Give the time */
        @link()
        @subject('time')
        public async time(repl: REPL) : Promise<void> { 
            /* Get today's date */
            const date = new Date();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            /* Say it */
            await repl.endpoint.say(`${hours} hours, ${minutes} minutes and ${seconds} seconds.`);
        }


    }

}