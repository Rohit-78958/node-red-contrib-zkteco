import { describe, it, expect, vi } from "vitest";
import { Mutex } from "../../src/core/mutex";

describe("Mutex", () => {
    it("should execute operations in the order they were called", async () => {
        const mutex = new Mutex();
        const executionOrder: number[] = [];
        
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // Operation 1 takes 100ms
        const op1 = mutex.runExclusive(async () => {
            await delay(100);
            executionOrder.push(1);
        });

        // Operation 2 takes 10ms, but should wait for op1
        const op2 = mutex.runExclusive(async () => {
            await delay(10);
            executionOrder.push(2);
        });

        // Operation 3 takes 50ms, but should wait for op1 and op2
        const op3 = mutex.runExclusive(async () => {
            await delay(50);
            executionOrder.push(3);
        });

        await Promise.all([op1, op2, op3]);

        expect(executionOrder).toEqual([1, 2, 3]);
    });

    it("should release the lock even if an operation throws an error", async () => {
        const mutex = new Mutex();
        const executionOrder: string[] = [];

        const op1 = mutex.runExclusive(async () => {
            executionOrder.push("start 1");
            throw new Error("Op 1 failed");
        });

        const op2 = mutex.runExclusive(async () => {
            executionOrder.push("start 2");
        });

        // We expect op1 to throw, but op2 should still run afterwards
        await expect(op1).rejects.toThrow("Op 1 failed");
        await op2;

        expect(executionOrder).toEqual(["start 1", "start 2"]);
    });
});
