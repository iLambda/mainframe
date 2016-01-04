// requiring modules
import Brain from './mainframe-brain.js'
import Commander from './mainframe-commander.js'
import Dock from './mainframe-dock.js'

// creating the Mainframe
export default class Mainframe {

  // creating a mainframe
  constructor() {
    // creating the organs
    this.brain = new Brain(this)
    this.agents = new Commander(this)
    this.modules = new Dock(this)
  }
}
