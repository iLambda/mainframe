import { SSHServer } from './network/protocols/ssh/ssh-server'
import { Operator } from './peripherals/operator'

/* The mainframe */
export class Mainframe {

  /* The servers */
  public server = {
    ssh: new SSHServer()  /* The SSH server */
  };

  /* The constructor */
  public constructor() {
    /* Initialize operator */
    Operator.initialize();
  }

  /* Running the mainframe */
  public async run() {
    /* Initialize the operator */
    await Operator.run();
    /* Run every server */
    this.server.ssh.run();
  }
}
