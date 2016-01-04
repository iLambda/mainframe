// requiring modules
import Mainframe from '../lib/mainframe.js'

// create a mainframe
var mainframe = new Mainframe()
mainframe.modules.dock({
  dock: () => {},
  undock: () => {},
  name: "kek",
  test: () => console.log('kek')
})

mainframe.kek.test()
