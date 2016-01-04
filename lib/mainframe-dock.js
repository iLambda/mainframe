// requiring modules
import * as _ from 'lodash'

// the dock class
export default class Dock{

  // creating a modules
  constructor(mainframe, ...modules) {
    // instantiate modules list
    this.modules = {}
    this.mainframe = mainframe
    // gather modules
    modules = _.isArray(modules) ? modules : arguments.slice(1)
    // dock all possible valid modules
    if (modules) {
      _.forEach(modules, mod => this.dock(mod), this)
    }
  }

  // return true if object is a module
  ismodule(mod) {
    return _.isString(mod.name)
        && mod.name.match(/[a-zA-Z_][a-zA-Z0-9_-]*/)
        && _.isFunction(mod.dock)
        && _.isFunction(mod.undock)
  }

  // return true if the given module is present
  has(mod) {
    var key = mod.key || key
    return _.has(this.modules, key)
  }

  // dock a new module
  dock(mod) {
    // if mod is a module and not already here
    if (!this.modules[mod.name] && !this.mainframe[mod.name] && this.ismodule(mod)) {
      // add it
      this.modules[mod.name] = mod
      this.mainframe[mod.name] = mod
      // tell it it's been docked
      mod.dock(this.mainframe)
      // return
      return mod.name
    }
    return undefined
  }

  // undock a new module
  undock(mod) {
    // defaulting mod
    mod = this.modules[mod.name] || mod
    // if module is valid and belongs
    if (this.modules[mod.name] && this.mainframe[mod.name] && this.ismodule(mod)) {
      // remove the module
      delete this.modules[mod.name]
      delete this.mainframe[mod.name]
      // tell it it's been undocked
      mod.undock(this.mainframe)
      // success
      return true
    }
    // error
    return false
  }
}
