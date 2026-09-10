import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConnectionManager } from "../../src/core/connection-manager";
import { RealZktecoClient } from "../../src/adapters/real-zkteco-client";

// Mock the real client so we don't actually try to open TCP sockets during unit tests
vi.mock("../../src/adapters/real-zkteco-client", () => {
    return {
        RealZktecoClient: vi.fn().mockImplementation(function(this: any) {
            this.connect = vi.fn().mockResolvedValue(undefined);
            this.disconnect = vi.fn().mockResolvedValue(undefined);
        })
    };
});

describe("ConnectionManager", () => {
    beforeEach(async () => {
        // Clear all mocks and manually disconnect any lingering connections
        vi.clearAllMocks();
        await ConnectionManager.disconnectClient("192.168.1.100", 4370);
        await ConnectionManager.disconnectClient("192.168.1.101", 4370);
    });

    it("should create a new client if one does not exist for the IP", async () => {
        const client = await ConnectionManager.getClient("192.168.1.100", 4370, 10000);
        expect(client).toBeDefined();
        expect(RealZktecoClient).toHaveBeenCalledTimes(1);
    });

    it("should return the exact same client instance for identical IP/Port", async () => {
        const client1 = await ConnectionManager.getClient("192.168.1.100", 4370, 10000);
        const client2 = await ConnectionManager.getClient("192.168.1.100", 4370, 10000);
        
        expect(client1).toBe(client2);
        
        // The constructor should have only been called once!
        expect(RealZktecoClient).toHaveBeenCalledTimes(1);
    });

    it("should create different clients for different IP addresses", async () => {
        const client1 = await ConnectionManager.getClient("192.168.1.100", 4370, 10000);
        const client2 = await ConnectionManager.getClient("192.168.1.101", 4370, 10000);
        
        expect(client1).not.toBe(client2);
        
        // Constructor called twice (once for each unique IP)
        expect(RealZktecoClient).toHaveBeenCalledTimes(2);
    });

    it("should properly remove the client from the map on disconnect", async () => {
        await ConnectionManager.getClient("192.168.1.100", 4370, 10000);
        expect(RealZktecoClient).toHaveBeenCalledTimes(1);

        await ConnectionManager.disconnectClient("192.168.1.100", 4370);

        // Requesting it again should trigger a NEW connection
        await ConnectionManager.getClient("192.168.1.100", 4370, 10000);
        expect(RealZktecoClient).toHaveBeenCalledTimes(2);
    });
});
