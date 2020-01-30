declare class Endpoint {}

export abstract class Server {

    /* Get all endpoints */
    public abstract get endpoints() : readonly Endpoint[];

    /* Register an endpoint */
    public abstract register(endpoint: Endpoint) : Endpoint;
    /* Rescind an endpoint */
    public abstract rescind(endpoint: Endpoint) : void;
    /* Run the server */
    public abstract async run() : Promise<void>;
}