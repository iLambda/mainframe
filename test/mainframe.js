// requiring modules
import Mainframe from '../lib/mainframe.js'
import keypress from 'keypress'

// create a mainframe
var mainframe = new Mainframe()

// change the brain model
mainframe.brain.transitions['IDLE'] = { "keypress": "HI" }
mainframe.brain.transitions['HI'] = { "ok": "IDLE" }
mainframe.brain.states['HI'] = function(mainframe, layer, result, args) {
  // prints 'hi !'
  mainframe.console.log(`hi ${args.key.name} !`)
  // go back to idle
  layer.process('ok')
}
// creating a brain layer
mainframe.brain.bud('main')

// dock a custom console module
mainframe.modules.dock({
  name: "console",
  dock: () => {},
  undock: () => {},

  log: (d) => console.log("mainframe> " + d)
})

// add a keydetector agentc
var id = mainframe.agents.register({
  name: 'keydetector',
  slots: {
    register: function(mainframe, args) {
      // register keypress event
      keypress(process.stdin)
        // if key press, propagate to mainframe
      process.stdin.on('keypress', function (ch, key) {
        if (key) {
          // pause the stdin
          process.stdin.pause()
          // process the thought
          mainframe.brain.layer('main').process('keypress', { key: key })
          // if we don't hit ctrl+c
          if (!(key.ctrl && key.name === 'c')) {
            // resume capture
            process.stdin.resume()
          }
        }
      })
      // setting raw mode
      process.stdin.setRawMode(true)
      // start capture
      process.stdin.resume()
    }
  }
})

// say hi
mainframe.console.log('hi')
