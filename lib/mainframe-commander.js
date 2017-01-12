// requiring modules
import * as _ from 'lodash'

// the commander class
export default class Commander{

  // creating a commander
  constructor(mainframe) {
    // create the layers array
    this._globalid = 0
    // save the parent mainframe
    this.mainframe = mainframe
    // save agents
    this.registered = {}
    this.taskforces = {}

    // create a log
    this.mainframe.logs.make('commander', 'INFO')
  }

  /*
  * Agents management
  */
  // registers an agent to the mainframe
  register(agent, taskforce, args={}) {
    // we default the taskforce
    taskforce = taskforce || '*'
    // we test if the object can be registered (must be an agent and previously independant)
    if (!(agent
          && agent.slots
          && agent.slots.register
          && _.isFunction(agent.slots.register)
          && !_.includes(this.registered, agent))) {
            return undefined
    }
    // we push it in the registered list and keep the id
    var id = this._globalid++
    this.registered[id] = agent
    // we create the taskforce if necessary
    this.taskforces[taskforce] = this.taskforces[taskforce] || { }
    // we populate the taskforce
    this.taskforces[taskforce][id] = agent
    // we inform the agent it's been registered
    this.unicast(agent, 'register', _.assign(args, { id: id, taskforce: taskforce, self: agent }))
    // log
    this.mainframe.logs.commander.info(`Registered agent '${id}' in taskforce '${taskforce}'`)
    // returning the id
    return id
  }

  // unregisters an agent from the mf
  unregister(agent, args={}) {
    // we get the id of the item, input can be int or obj
    var id = this.registered[agent] ? agent : this.id(agent)
    agent = this.registered[agent] || agent
    // we get the taskforce and the associated feels
    // TODO : UNREGISTER
    // we notify the agent its being registered
    this.unicast(agent, 'unregister', _.assign(args, { id: id, taskforce: taskforce, self: agent }))
    // log
    this.mainframe.logs.commander.info(`Unregistered agent '${id}' in taskforce '${taskforce}'`)
  }

  // returns the id of an agent according to the mf
  id(agent) {
    // return index if agent registered, else undefined
    return agent
          ? _.findKey(this.registered, it => it === agent)
          : undefined
  }

  /*
  * Taskforce management
  */
  // remove given agent from any taskforce
  demote(agent) {
    // log
    this.mainframe.logs.commander.info(`Demoted agent '${id}' to taskforce '*'`)
    return this.promote(agent)
  }

  // modify the taskforce of a given agent
  promote(agent, taskforce) {
    // we default the taskforce
    taskforce = taskforce || '*'
    // we get the id of the item, input can be int or obj
    var id = this.registered[agent] ? agent : this.id(agent)
    agent = this.registered[agent] || agent
    // we test if the object can be registered (must be an agent and previously independant)
    if (!(id != undefined
          && agent
          && agent.slots
          && agent.slots.register
          && _.isFunction(agent.slots.register))) {
            return undefined
    }
    // we unregister from the old taskforces
    var oldtaskforce = this.taskforce(agent)
    delete this.taskforces[oldtaskforce][id]
    // we delete empty taskforces
    if (_.isEmpty(this.taskforces[oldtaskforce])) {
      delete this.taskforces[oldtaskforce]
    }
    // we create the taskforce if necessary
    this.taskforces[taskforce] = this.taskforces[taskforce] || { }
    // we populate the taskforce
    this.taskforces[taskforce][id] = agent
    // we inform the agent it's been promoted
    this.unicast(agent, 'promote', { id: id, taskforce: taskforce, self: agent })
    // log
    this.mainframe.logs.commander.info(`Promoted agent '${id}' from '${oldtaskforce}' to taskforce '${taskforce}'`)
    // returning the id
    return id
  }

  // retourns the taskforce of an agent
  taskforce(agent) {
    // we get the agent, input can be int or obj
    agent = this.registered[agent] || agent
    // return taskforce if agent registered, else undefined
    if (agent) {
      // we take every taskforce...
      for (var taskforce in this.taskforces) {
        if (this.taskforces.hasOwnProperty(taskforce)) {
          // ... and look inside it
          for (var agentid in this.taskforces[taskforce]) {
            if (this.taskforces[taskforce].hasOwnProperty(agentid) &&
                this.taskforces[taskforce][agentid] == agent) {
                  // we found it !
                  return taskforce
            }
          }
        }
      }
    }
    // we didn't find anything
    return undefined
  }

  /*
   * Mainframe to Agents communications
   */
  // casts signal to one receiver
  unicast(receiver, signal, args) {
    // get receiver (input can be object or int)
    receiver = this.registered[receiver] || receiver
    args = args || {}
    // if no receiver
    if (!receiver) {
      // if the item is undefined then we couldn't make it
      return false
    }
    // if the item is not registered we don't send anything
    if (!this.id(receiver)) {
      return false
    }
    // cast the signal to the receiver
    if (receiver.slots[signal]) {
      receiver.slots[signal](this.mainframe, args);
      // log
      this.mainframe.logs.commander.info(`Sent signal '${signal}' to agent '${this.id(receiver)}'`)
      return true
    }
  }

  // casts signal to some receivers that match a predicate
  multicast(predicate, signal, args, taskforce) {
    args = args || {}
    var i = 0
    var source = taskforce && this.taskforces[taskforce]
                ? this.taskforces[taskforce]
                : this.registered
    // search into the pool
    for (var id in source) {
      // cast the signal to the receiver
      if (source[id].slots[signal] && predicate(source[id], id)) {
        source[id].slots[signal](this.mainframe, args)
        i++
      }
    }
    // log
    this.mainframe.logs.commander.info(`Sent signal '${signal}' in taskforce '${taskforce}' to agents matching '${predicate.toString()}'`)
    // if we hit something
    return i > 0
  }

  // cast signal to all
  broadcast(signal, args, taskforce) {
    args = args || {}
    var i = 0
    var source = taskforce && this.taskforces[taskforce]
                ? this.taskforces[taskforce]
                : this.registered
    // searching thru pool
    for (var id in source) {
      // cast the signal to the receiver
      if (source[id].slots[signal]) {
        source[id].slots[signal](this.mainframe, args)
        i++
      }
    }
    // log
    this.mainframe.logs.commander.info(`Broadcast signal '${signal}' in taskforce '${taskforce}'`)
    // if we hit something
    return i > 0
  }

}
