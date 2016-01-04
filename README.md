# mainframe
mainframe is a hive-mind approach to event systems.

## install
**mainframe** is available on [npm](https://www.npmjs.com/package/mainframe-core) as '*mainframe-core*'.

```bash
$ sudo npm install mainframe-core
```

## principle
**mainframe** is a hive-mind. You can think about it as a central computer, or even as the [Borg Collective](http://memory-alpha.wikia.com/wiki/Borg_Collective).
Its point is to have a flock of agents available at all time, each one of them fulfilling a different function. The mainframe centralizes the decisions and can give different order to agents according to the data returned by all agents.

First, the mainframe has a **brain**. The brain have *layers*, which are essentially
[finite space machines](https://en.wikipedia.org/wiki/Finite-state_machine).
Each layer can *propagate* thoughts inside itself, which changes the current state of the layer.

The mainframe also have **agents**. Think of it as the endpoints of the central computer, or as a [borg drone](http://memory-alpha.wikia.com/wiki/Borg_drone).
They can be registered to different mainframes at the same time. They receive orders from the mainframe and obey, according to their function.

The mainframe can communicate with the agents by sending signals.
The mainframe can create groups of agents, **taskforces**, to manage tasks more efficiently when broadcasting signals to only a group of agents.

If you need to extend the abilities of the mainframe (add a database, or an evolutive grammar parser), you can by adding **modules**. Modules are simple objects that can be created on the fly or imported, that can extend the capacities of the mainframe. Adding the abilities to the mainframe itself means that all the agents will be able to use them.
## code

**TODO**
To create a mainframe :
```js
var Mainframe = require('mainframe-core')

var mainframe = new Mainframe()
```
