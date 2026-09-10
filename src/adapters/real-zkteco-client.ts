import { ZktecoClient } from "./zkteco-client.interface";
// @ts-ignore - node-zklib does not have official typescript definitions
import ZKLib = require("node-zklib");
import { Mutex } from "../core/mutex";

export class RealZktecoClient implements ZktecoClient {
    private zkInstance: any;
    private mutex = new Mutex();

    constructor(
        private host: string,
        private port: number,
        private timeoutMs: number
    ) {
        // ZKLib signature: ip, port, timeout, inport
        this.zkInstance = new ZKLib(host, port, timeoutMs, 5200);
    }

    async connect(): Promise<void> {
        return this.mutex.runExclusive(async () => {
            try {
                await this.zkInstance.createSocket();
            } catch (error: any) {
                throw new Error(`ZKTeco Connection Error: ${error.message || 'Unknown network error'}`);
            }
        });
    }

    async disconnect(): Promise<void> {
        return this.mutex.runExclusive(async () => {
            try {
                await this.zkInstance.disconnect();
            } catch (error) {
                console.warn(`[ZKTeco] Disconnect error for ${this.host}:`, error);
            }
        });
    }

    private wrapTimeout<T>(operationPromise: Promise<T>, operationName: string): Promise<T> {
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

    async getInfo(): Promise<any> {
        return this.mutex.runExclusive(() => 
            this.wrapTimeout(this.zkInstance.getInfo(), 'getInfo')
        );
    }

    async getUsers(): Promise<any[]> {
        return this.mutex.runExclusive(() => 
            this.wrapTimeout(
                this.zkInstance.getUsers().then((res: any) => res.data || []),
                'getUsers'
            )
        );
    }

    async getAttendances(): Promise<any[]> {
        return this.mutex.runExclusive(() => 
            this.wrapTimeout(
                this.zkInstance.getAttendances().then((res: any) => res.data || []),
                'getAttendances'
            )
        );
    }
}
