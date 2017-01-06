// requiring modules
import Brain from './mainframe-brain.js'
import Commander from './mainframe-commander.js'
import Dock from './mainframe-dock.js'
import Logger from './mainframe-logger.js'

// creating the Mainframe
export default class Mainframe {

  // creating a mainframe
  constructor(...modules) {
    // creating the organs
    this.logs = new Logger(this)
    this.modules = new Dock(this, ...modules) 
    this.brain = new Brain(this)
    this.agents = new Commander(this)
  }
}
