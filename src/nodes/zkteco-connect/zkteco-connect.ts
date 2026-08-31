import { NodeAPI, Node, NodeDef } from "node-red";
import { ConnectionManager } from "../../core/connection-manager";

// We import the config node interface to access the host/port
interface ZKTecoConfigNode extends Node {
    host: string;
    port: number;
    timeout: number;
}

interface ZKTecoConnectNodeDef extends NodeDef {
    config: string; // The ID of the config node
}

export = function (RED: NodeAPI) {
    function ZKTecoConnectNodeConstructor(this: Node, config: ZKTecoConnectNodeDef) {
        RED.nodes.createNode(this, config);
        const node = this;

        // Retrieve the configuration node instance using its ID
        const configNode = RED.nodes.getNode(config.config) as ZKTecoConfigNode;

        if (!configNode) {
            node.status({ fill: "red", shape: "ring", text: "missing config" });
            node.error("Missing ZKTeco configuration");
            return;
        }

        node.on("input", async function (msg, send, done) {
            node.status({ fill: "yellow", shape: "dot", text: "connecting..." });

            try {
                // Call the manager to establish or retrieve the connection
                await ConnectionManager.getClient(
                    configNode.host,
                    configNode.port,
                    configNode.timeout
                );

                node.status({ fill: "green", shape: "dot", text: "connected" });
                
                // Return success state
                msg.payload = {
                    connected: true,
                    device: `${configNode.host}:${configNode.port}`,
                    timestamp: new Date().toISOString()
                };
                
                send(msg);
                if (done) done();
                
            } catch (error: any) {
                node.status({ fill: "red", shape: "dot", text: "error" });
                node.error(`Connection failed: ${error.message}`, msg);
                if (done) done(error);
            }
        });
    }

    RED.nodes.registerType("zkteco-connect", ZKTecoConnectNodeConstructor);
};
