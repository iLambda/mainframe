import { SSHServer } from './network/protocols/ssh/ssh-server';

/* The mainframe */
export class Mainframe {

  /* The servers */
  server = {
    ssh: new SSHServer()  /* The SSH server */
  };

  /* Running the mainframe */
  run() {
    /* Run every server */
    this.server.ssh.run();
  }
}
