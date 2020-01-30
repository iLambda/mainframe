"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ssh_server_1 = require("./network/protocols/ssh/ssh-server");
/* The mainframe */
var Mainframe = /** @class */ (function () {
    function Mainframe() {
        /* The servers */
        this.server = {
            ssh: new ssh_server_1.SSHServer() /* The SSH server */
        };
    }
    /* Running the mainframe */
    Mainframe.prototype.run = function () {
        /* Run every server */
        this.server.ssh.run();
    };
    return Mainframe;
}());
exports.Mainframe = Mainframe;
