"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = void 0;
const real_zkteco_client_1 = require("../adapters/real-zkteco-client");
class ConnectionManager {
    // Map to hold unique connections by their IP/host
    static connections = new Map();
    /**
     * Gets an existing connection or creates a new one.
     */
    static async getClient(host, port, timeout) {
        const key = `${host}:${port}`;
        if (this.connections.has(key)) {
            return this.connections.get(key);
        }
        // We are now instantiating the real ZKTeco client
        const client = new real_zkteco_client_1.RealZktecoClient(host, port, timeout);
        await client.connect();
        this.connections.set(key, client);
        return client;
    }
    /**
     * Safely disconnects and removes a client from the manager.
     */
    static async disconnectClient(host, port) {
        const key = `${host}:${port}`;
        if (this.connections.has(key)) {
            const client = this.connections.get(key);
            try {
                await client.disconnect();
            }
            catch (err) {
                console.error(`Error disconnecting ${key}:`, err);
            }
            finally {
                this.connections.delete(key);
            }
        }
    }
}
exports.ConnectionManager = ConnectionManager;
