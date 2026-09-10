"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mutex = void 0;
class Mutex {
    mutex = Promise.resolve();
    /**
     * Syntactic sugar to wrap an async function in a mutex lock.
     */
    async runExclusive(fn) {
        let release;
        // Create a new promise that represents the lock for the NEXT caller
        const nextMutex = new Promise((resolve) => {
            release = resolve;
        });
        // Wait for the CURRENT mutex to resolve before we can proceed
        const previousMutex = this.mutex;
        this.mutex = nextMutex;
        await previousMutex;
        try {
            return await fn();
        }
        finally {
            // Unblock the next caller in line
            release();
        }
    }
}
exports.Mutex = Mutex;
