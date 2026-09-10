import { ZktecoClient } from "../adapters/zkteco-client.interface";
import { RealZktecoClient } from "../adapters/real-zkteco-client";

export class ConnectionManager {
    // Map to hold unique connections by their IP/host
    private static connections = new Map<string, ZktecoClient>();

    /**
     * Gets an existing connection or creates a new one.
     */
    public static async getClient(
        host: string,
        port: number,
        timeout: number
    ): Promise<ZktecoClient> {
        const key = `${host}:${port}`;

        if (this.connections.has(key)) {
            return this.connections.get(key)!;
        }

        // We are now instantiating the real ZKTeco client
        const client = new RealZktecoClient(host, port, timeout);
        
        await client.connect();
        this.connections.set(key, client);

        return client;
    }

    /**
     * Safely disconnects and removes a client from the manager.
     */
    public static async disconnectClient(host: string, port: number): Promise<void> {
        const key = `${host}:${port}`;
        if (this.connections.has(key)) {
            const client = this.connections.get(key)!;
            try {
                await client.disconnect();
            } catch (err) {
                console.error(`Error disconnecting ${key}:`, err);
            } finally {
                this.connections.delete(key);
            }
        }
    }
}
