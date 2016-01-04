// requiring modules
import * as _ from 'lodash'

// the brain layer class
export default class BrainLayer{

  // creating a brain layer
  constructor(mainframe, brain) {
    // save the parent mainframe
    this.mainframe = mainframe
    // save the parent brain
    this.brain = brain
    // the current state of the brain layer
    this.current = "IDLE"
  }


  // called when the mainframe processes a thought
  process(thought, args) {
    // defaulting args to {}
    args = args || {}
    // getting current state
    var currentState = this.current
    var previousState = this.current
    var res = {
      thought: thought,
      state: currentState,
      previousState: previousState,
      transitioned: false
    }
    // if a matching transition exists
    if (_.has(this.brain.transitions, currentState) &&
        _.has(this.brain.transitions[currentState], thought)) {
          // we change the current state
          this.current = this.brain.transitions[currentState][thought]
          res.transitioned = true
          res.state = this.current
          res.previousState = previousState

          // we transitioned, so current state must be called
          this.brain.states[this.current](this.mainframe, this, res, args)
    }
    // we return the (new?) current state in any case
    // and we indicate if we actually transitioned
    return res
  }
}