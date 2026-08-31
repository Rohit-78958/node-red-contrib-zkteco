import { NodeAPI, Node, NodeDef } from "node-red";
import { ConnectionManager } from "../../core/connection-manager";

interface ZKTecoConfigNode extends Node {
    host: string;
    port: number;
}

interface ZKTecoDisconnectNodeDef extends NodeDef {
    config: string;
}

export = function (RED: NodeAPI) {
    function ZKTecoDisconnectNodeConstructor(this: Node, config: ZKTecoDisconnectNodeDef) {
        RED.nodes.createNode(this, config);
        const node = this;
        const configNode = RED.nodes.getNode(config.config) as ZKTecoConfigNode;

        if (!configNode) {
            node.status({ fill: "red", shape: "ring", text: "missing config" });
            node.error("Missing ZKTeco configuration");
            return;
        }

        node.on("input", async function (msg, send, done) {
            node.status({ fill: "yellow", shape: "dot", text: "disconnecting..." });

            try {
                // Call the manager to safely close and remove the connection
                await ConnectionManager.disconnectClient(configNode.host, configNode.port);

                node.status({ fill: "grey", shape: "ring", text: "disconnected" });
                
                msg.payload = {
                    connected: false,
                    device: `${configNode.host}:${configNode.port}`,
                    timestamp: new Date().toISOString()
                };
                
                send(msg);
                if (done) done();
                
            } catch (error: any) {
                node.status({ fill: "red", shape: "dot", text: "error" });
                node.error(`Disconnect failed: ${error.message}`, msg);
                if (done) done(error);
            }
        });
    }

    RED.nodes.registerType("zkteco-disconnect", ZKTecoDisconnectNodeConstructor);
};
