"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealZktecoClient = void 0;
// @ts-ignore - node-zklib does not have official typescript definitions
const ZKLib = require("node-zklib");
const mutex_1 = require("../core/mutex");
class RealZktecoClient {
    host;
    port;
    timeoutMs;
    zkInstance;
    mutex = new mutex_1.Mutex();
    constructor(host, port, timeoutMs) {
        this.host = host;
        this.port = port;
        this.timeoutMs = timeoutMs;
        // ZKLib signature: ip, port, timeout, inport
        this.zkInstance = new ZKLib(host, port, timeoutMs, 5200);
    }
    async connect() {
        return this.mutex.runExclusive(async () => {
            try {
                await this.zkInstance.createSocket();
            }
            catch (error) {
                throw new Error(`ZKTeco Connection Error: ${error.message || 'Unknown network error'}`);
            }
        });
    }
    async disconnect() {
        return this.mutex.runExclusive(async () => {
            try {
                await this.zkInstance.disconnect();
            }
            catch (error) {
                console.warn(`[ZKTeco] Disconnect error for ${this.host}:`, error);
            }
        });
    }
    wrapTimeout(operationPromise, operationName) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`ZKTeco Timeout: ${operationName} took longer than ${this.timeoutMs}ms`));
            }, this.timeoutMs);
            operationPromise
                .then((result) => {
                clearTimeout(timer);
                resolve(result);
            })
                .catch((error) => {
                clearTimeout(timer);
                reject(new Error(`ZKTeco Error during ${operationName}: ${error.message || 'Unknown error'}`));
            });
        });
    }
    async getInfo() {
        return this.mutex.runExclusive(() => this.wrapTimeout(this.zkInstance.getInfo(), 'getInfo'));
    }
    async getUsers() {
        return this.mutex.runExclusive(() => this.wrapTimeout(this.zkInstance.getUsers().then((res) => res.data || []), 'getUsers'));
    }
    async getAttendances() {
        return this.mutex.runExclusive(() => this.wrapTimeout(this.zkInstance.getAttendances().then((res) => res.data || []), 'getAttendances'));
    }
}
exports.RealZktecoClient = RealZktecoClient;
