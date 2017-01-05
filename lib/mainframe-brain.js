// requiring modules
import BrainLayer from './mainframe-brainlayer.js'

// the brain class
export default class Brain{

  // creating a brain
  constructor(mainframe) {
    // create the layers array
    this.layers = {}
    // save the parent mainframe
    this.mainframe = mainframe
    // the states reachable in this layer
    this.states = {
      "IDLE": function(mainframe, layer, result, args) { }
    }
    // the transitions in this layer
    this.transitions = {
      "IDLE": { }
    }

    // create a log
    this.mainframe.logs.make('brain', 'INFO')
  }


  // create a bran new brain layer
  bud(id) {
    // log
    this.mainframe.logs.brain.info(`Trying to bud a layer at id '${id}'`)
    // check if layer exists and returns id
    return (!this.layers[id] && id != null)
         ? this.layers[id] = new BrainLayer(this.mainframe, this, id)
         : undefined
  }

  // get the id of a layer
  id(layer) {
    // returns the key
    return it != null
          ? _.findKey(this.layers, it => it === layer)
          : undefined
  }

  // get a layer by its id
  layer(id) {
    // return layer if id valid
    return id != null ? this.layers[id] : undefined
  }

  // remove a brain layer
  ted(layer) {
    // get id
    var id = this.layers[layer] ? layer : this.id(layer)
    // log
    this.mainframe.logs.brain.info(`Trying to ted a layer at id '${id}'`)
    // remove it if id is valid (ie arg is an id or layer was found)
    if (id != null) {
      delete this.layers[id]
    }
    // return true if the delete was successful (ie the id was valid)
    return id != null
  }
}
