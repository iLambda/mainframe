import { Connection, ClientInfo } from 'ssh2'

export interface SSHClient {
    /* The connection */
    connection: Connection;
    /* Info about the client */
    info: ClientInfo;
};
