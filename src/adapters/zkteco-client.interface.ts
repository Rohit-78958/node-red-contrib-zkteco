export interface ZktecoClient {
    /**
     * Connects to the ZKTeco device.
     * Throws an error if connection fails or times out.
     */
    connect(): Promise<void>;

    /**
     * Disconnects from the ZKTeco device safely.
     */
    disconnect(): Promise<void>;

    /**
     * Retrieves basic device information.
     */
    getInfo(): Promise<any>;

    /**
     * Retrieves all users registered on the device.
     */
    getUsers(): Promise<any[]>;

    /**
     * Retrieves all attendance logs from the device.
     */
    getAttendances(): Promise<any[]>;
}
