import * as data from './debug.json'
import { REPL } from '../../../interaction/repl'
import { Node } from '../node';
import { link, subject, nldata } from '../link'

export namespace Nodes {

    @nldata(data)
    export class Debug extends Node {

        @link()
        @subject('debug.product')
        public async product(repl: REPL, i: number, j: number) : Promise<void> {
            await repl.endpoint.say(`The entered numbers are ${i}, ${j}. Product is ${i*j}. Congrats !`)
        }

        @link()
        @subject('debug')
        public async printNumber(repl: REPL, i: number) : Promise<void> {
            await repl.endpoint.say(`The entered number is ${i}. Congrats !`)
        }

        @link(Number)
        public async askNumber(repl: REPL) : Promise<number> {
            await repl.endpoint.say(`Enter a number.`)
            let res = await repl.endpoint.hear();
            return +res;
        }


    }

}