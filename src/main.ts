import 'reflect-metadata'
import { Mainframe } from './mainframe';
import { Endpoint } from './network/endpoint';

/* Creating the mainframe */
const mainframe: Mainframe = new Mainframe();

/* Run it */
mainframe.run();
/* Started */

console.log("Started !\n")