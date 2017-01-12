// requiring modules
import * as _ from 'lodash'
import ClassicLog from 'log'

// the logger class
export default class Log extends ClassicLog{

  constructor(mainframe, level, stream){
    // call parent constructor
    super(level, stream)
    // set owner
    this.owner = mainframe
  }

  log(levelStr, args) {
    // create new args list
    let modifiedargs = []
    // check length
    if (args.length == 1) {
      // get the string
      modifiedargs = args
    } else if (args.length > 1) {
      // get the string and the mainframe
      modifiedargs = _.take(args, 1)
      // return the id of the current agent
      var id = this.owner.agents.id(args[1])
      // is id valid
      if (id !== undefined) {
        modifiedargs[0] = `ID=${id} ` + modifiedargs[0]
      }
    }
    // call parent method
    super.log(levelStr, modifiedargs)
  }
}
