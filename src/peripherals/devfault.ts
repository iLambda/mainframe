import { Fault } from '../tools/fault'
import { Device } from './device';

export class DeviceFault extends Fault {

    /* The device */
    readonly device: Device;

    /* Construct a fault */
    constructor(device: Device, reason: string, explanation: string|null = null) {
        /* Make string */
        const extendedReason = `Device error from ${device.name}. ${reason}`;
        /* Make fault */
        super(extendedReason, explanation);
        /* Save device */
        this.device = device;
    }
};