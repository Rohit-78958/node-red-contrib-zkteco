import { NodeAPI, Node, NodeDef } from "node-red";
import { ConnectionManager } from "../../core/connection-manager";

interface ZKTecoConfigNodeDef extends NodeDef {
    host: string;
    port: number;
    protocol: "tcp" | "udp";
    timeout: number;
}

interface ZKTecoConfigCredentials {
    password?: string;
}

interface ZKTecoConfigNode extends Node<ZKTecoConfigCredentials> {
    host: string;
    port: number;
    protocol: "tcp" | "udp";
    timeout: number;
}

export = function (RED: NodeAPI) {
    function ZKTecoConfigNodeConstructor(this: ZKTecoConfigNode, config: ZKTecoConfigNodeDef) {
        RED.nodes.createNode(this, config);
        
        this.host = config.host;
        this.port = Number(config.port) || 4370;
        this.protocol = config.protocol || "tcp";
        this.timeout = Number(config.timeout) || 10000;
        
        const node = this;

        this.on("close", async function (done: () => void) {
            // Safely close the TCP socket if this config node is redeployed or deleted
            await ConnectionManager.disconnectClient(node.host, node.port);
            done();
        });
    }

    RED.nodes.registerType("zkteco-config", ZKTecoConfigNodeConstructor as any, {
        credentials: {
            password: { type: "password" }
        }
    });
};
