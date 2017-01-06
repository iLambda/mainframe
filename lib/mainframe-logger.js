// requiring modules
import * as _ from 'lodash'
import Log from 'log'
import * as fs from 'fs'

// the brain class
export default class Logger{

  // creating a logger
  constructor(mainframe) {
    // save the parent mainframe
    this.mainframe = mainframe
    // create main log
    this.make('main', 'INFO')
    // create log folder in case it doesn't already exists
    if (!fs.existsSync('./log/')) {
      fs.mkdirSync('./log')
    }
    // load all previously here logs
    var lognames = fs.readdirSync('./log/') || []
    lognames.forEach(logfile => {
      if (_.endsWith(logfile, '.log')) {
        var title = logfile.replace(/(\w+)\.\w+\.log/, '$1')
        var loglevel = logfile.replace(/\w+\.(\w+)\.log/, '$1').toUpperCase()
        this.make(title, loglevel)
      }
    })
  }

  // create a log
  make(title, loglevel) {
    // check log title
    if (!_.isString(title) || !/[A-Za-z]+((\-[A-Za-z]+)+)?/.test(title)) {
      throw "Log title must be in kebab-case."
    }
    // check log level
    if (!_.isString(loglevel) || !/[A-Z]+/.test(loglevel)) {
      throw "Log level is not a upper-case string containing only letters."
    }
    // create log
    this[title] = new Log(loglevel, fs.createWriteStream(`log/${title}.${loglevel.toLowerCase()}.log`))
    // return log
    return this[title]
  }

  // remove a log
  // CAUTION : all info will be lost
  erase(title) {
    // remove log file
    if (this[title] instanceof Log) {
      // close log stream
      this[title].destroy()
    }
    // return status
    return delete this[title]
  }

  // get a log by name
  get(title) {
    return this[title]
  }

}
