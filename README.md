# mainframe
mainframe is a hive-mind approach to event systems.

## install
**mainframe** is available on [npm](https://www.npmjs.com/package/mainframe-core) as '*mainframe-core*'.

```sh
$ npm install mainframe-core
```

## principle
**mainframe** is a hive-mind. You can think about it as a central computer, or even as the [Borg Collective](http://memory-alpha.wikia.com/wiki/Borg_Collective).
Its point is to have a flock of agents available at all time, each one of them fulfilling a different function. The mainframe centralizes the decisions and can give different order to agents according to the data returned by all agents.

First, the mainframe has a **brain**. The brain have *layers*, which are essentially
[finite space machines](https://en.wikipedia.org/wiki/Finite-state_machine).
Each layer can *propagate* thoughts inside itself, which changes the current state of the layer.

The mainframe also have **agents**. Think of it as the endpoints of the central computer, or as a [borg drone](http://memory-alpha.wikia.com/wiki/Borg_drone).
They can be registered to different mainframes at the same time. They receive orders from the mainframe and obey, according to their function.

The mainframe communicate with the agents by sending signals.
The mainframe can create groups of agents, **taskforces**, to manage tasks more efficiently when broadcasting signals to only a group of agents.

If you need to extend the abilities of the mainframe (add a database, or an evolutive grammar parser), you can by adding **modules**. Modules are simple objects that can be created on the fly or imported, that can extend the capacities of the mainframe. Adding the abilities to the mainframe itself means that all the agents will be able to use them.

## documentation

To create a mainframe :
```js
var Mainframe = require('mainframe-core')

var mainframe = new Mainframe()
```

### brain

The brain of the mainframe is accessible by the following property :
```js
var brain = mainframe.brain
```
You can manage layers with the following methods :
```js
mainframe.brain.bud(id)        // create a layer at given id
mainframe.brain.id(layer)      // get the id of a layer
mainframe.brain.layer(id)      // get the layer associated to an id
mainframe.brain.ted(layerorid)  // delete a layer (by object or id)
```

### agents

Agents can be registered to the mainframe. The organ manging the agents is named the *commander*, and it is accessible by the following property :
```js
var commander = mainframe.agents
```

An agent is a particular type of object created specially to interface with a mainframe.
It is an object of the form :
```js
var agent = {
  // REQUIRED
  name: '[agent name]',
  // REQUIRED
  slots: {
    // called when the agent is registered.
    // adding this slot is optional.
    // NB : the args param always contains the keys
    // 'id', 'taskforce', and 'self' (a reference to the agent itself)
    register: function (mainframe, args) { }
    // called when the agent is unregistered
    // adding this slot is optional.
    // NB : the args param always contains the keys
    // 'id', 'taskforce', and 'self' (a reference to the agent itself)
    unregister: function (mainframe, args) { }

    // add your own slots to respond to the mainframe signals.
    // the name of the function is the content of the signal
    // send by the mainframe.
  }
}
```

You can manage agents with the following methods :
```js
mainframe.agents.register(agent, taskforce, args) // register an agent
mainframe.agents.unregister(agent, args)          // unregister an agent
mainframe.agents.id(agent)                        // return the id of the agent
```

You can communicate with agents with the following methods (the taskforce argument
  is always facultative):
```js
// send a signal to a precise agent
mainframe.agents.unicast(receiver, signal, args)
// send a signal to agents that match a given predicate. you can specify
// the taskforce where the search will be made
mainframe.agents.multicast(predicate, signal, args, taskforce)
// send a signal to all the agents. you can specify the taskforce
// where the search will be made
mainframe.agents.broadcast(signal, args, taskforce)
```

You can manage taskforces with the following methods :
```js
// create a layer at given id
mainframe.agents.demote(agent)        
// get the id of a layer
mainframe.agents.promote(agent, taskforce)
// get the layer associated to an id   
mainframe.agents.taskforce(agent)      
```

### logging

The logger of the mainframe is accessible by the following property :
```js
var logger = mainframe.logs
```
You can manage logs with the following methods :
```js
// create a new log that'll be returned
mainframe.logs.make(title, loglevel)     
// erase a log
// CAUTION : all data will be lost
mainframe.logs.erase(title)
// get a log by title
// (all syntaxes are equivalent)
mainframe.logs.get('title')
mainframe.logs['title']
mainframe.logs.title
```

A log has a logging threshold set at its creation. Only the messages that have a higher level of importance will be indeed logged.

The different levels are here shown sorted from more important to less important.
```js
'EMERGENCY' // most important
'ALERT'
'CRITICAL'
'ERROR'
'WARNING'
'NOTICE'
'INFO'
'DEBUG'     // less important
```
By default, a log titled 'main' with logging level 'INFO' is created. All organs have their own log
(respectively 'brain', 'commander', and 'dock') with logging level set at 'INFO'.

### modules

The modules added to the mainframe are simple objects of the form :
```js
var module = {
  // the name of the module
  // must match /[a-zA-Z_][a-zA-Z0-9_-]*/
  name: "[mymodule]",

  // called when the module is docked.
  // REQUIRED
  dock: function() { },
  // called when the module is undocked
  // REQUIRED
  undock: function() {}

  // add your own methods
  myMethod: function() { /*...*/ }
}
```

The name of the module **must** match the regex :
```js
/[a-zA-Z_][a-zA-Z0-9_-]*/
```
... which means that a module name is composed of letters, numbers, and underscores, and must begin by a letter or an underscore

To add or remove a module from the dock of modules, simply call :
```js
mainframe.dock(module) // dock the module
// ... use the module...
mainframe.undock(module) // undock the module, optional
```

When the module is docked, you can access the properties of the module you created by doing :
```js
module === mainframe.mymodule // the module is now accessible here
mainframe.mymodule.myMethod() // access the module
```
