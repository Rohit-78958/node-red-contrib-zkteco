import { ZktecoClient } from "./zkteco-client.interface";

export class MockZktecoClient implements ZktecoClient {
    private connected = false;

    constructor(
        private host: string,
        private port: number,
        private timeoutMs: number
    ) {}

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log(`[Mock] Connecting to ${this.host}:${this.port}...`);
            setTimeout(() => {
                if (this.host === "0.0.0.0") {
                    reject(new Error("ECONNREFUSED: Mock connection refused"));
                } else {
                    this.connected = true;
                    console.log(`[Mock] Connected.`);
                    resolve();
                }
            }, 500); // Simulate network delay
        });
    }

    async disconnect(): Promise<void> {
        this.connected = false;
        console.log(`[Mock] Disconnected.`);
        return Promise.resolve();
    }

    private checkConnection() {
        if (!this.connected) {
            throw new Error("Device is not connected.");
        }
    }

    async getInfo(): Promise<any> {
        this.checkConnection();
        return Promise.resolve({
            userCounts: 150,
            logCounts: 4500,
            logCapacity: 100000,
            deviceType: "Mock ZK Device"
        });
    }

    async getUsers(): Promise<any[]> {
        this.checkConnection();
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { uid: 1, userId: "100", name: "Alice", role: 0 },
                    { uid: 2, userId: "101", name: "Bob", role: 14 }
                ]);
            }, 300);
        });
    }

    async getAttendances(): Promise<any[]> {
        this.checkConnection();
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { userSn: 1, deviceUserId: "100", recordTime: "2023-10-25 09:00:00" },
                    { userSn: 2, deviceUserId: "101", recordTime: "2023-10-25 09:05:00" }
                ]);
            }, 800);
        });
    }
}
