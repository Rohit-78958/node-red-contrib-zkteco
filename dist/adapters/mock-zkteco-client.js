"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockZktecoClient = void 0;
class MockZktecoClient {
    host;
    port;
    timeoutMs;
    connected = false;
    constructor(host, port, timeoutMs) {
        this.host = host;
        this.port = port;
        this.timeoutMs = timeoutMs;
    }
    async connect() {
        return new Promise((resolve, reject) => {
            console.log(`[Mock] Connecting to ${this.host}:${this.port}...`);
            setTimeout(() => {
                if (this.host === "0.0.0.0") {
                    reject(new Error("ECONNREFUSED: Mock connection refused"));
                }
                else {
                    this.connected = true;
                    console.log(`[Mock] Connected.`);
                    resolve();
                }
            }, 500); // Simulate network delay
        });
    }
    async disconnect() {
        this.connected = false;
        console.log(`[Mock] Disconnected.`);
        return Promise.resolve();
    }
    checkConnection() {
        if (!this.connected) {
            throw new Error("Device is not connected.");
        }
    }
    async getInfo() {
        this.checkConnection();
        return Promise.resolve({
            userCounts: 150,
            logCounts: 4500,
            logCapacity: 100000,
            deviceType: "Mock ZK Device"
        });
    }
    async getUsers() {
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
    async getAttendances() {
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
exports.MockZktecoClient = MockZktecoClient;
