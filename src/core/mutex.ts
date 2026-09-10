export class Mutex {
    private mutex = Promise.resolve();

    /**
     * Syntactic sugar to wrap an async function in a mutex lock.
     */
    async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
        let release: () => void;
        
        // Create a new promise that represents the lock for the NEXT caller
        const nextMutex = new Promise<void>((resolve) => {
            release = resolve;
        });

        // Wait for the CURRENT mutex to resolve before we can proceed
        const previousMutex = this.mutex;
        this.mutex = nextMutex;

        await previousMutex;

        try {
            return await fn();
        } finally {
            // Unblock the next caller in line
            release!();
        }
    }
}
