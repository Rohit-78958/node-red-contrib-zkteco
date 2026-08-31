"use strict";
const connection_manager_1 = require("../../core/connection-manager");
module.exports = function (RED) {
    function ZKTecoConnectNodeConstructor(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        // Retrieve the configuration node instance using its ID
        const configNode = RED.nodes.getNode(config.config);
        if (!configNode) {
            node.status({ fill: "red", shape: "ring", text: "missing config" });
            node.error("Missing ZKTeco configuration");
            return;
        }
        node.on("input", async function (msg, send, done) {
            node.status({ fill: "yellow", shape: "dot", text: "connecting..." });
            try {
                // Call the manager to establish or retrieve the connection
                await connection_manager_1.ConnectionManager.getClient(configNode.host, configNode.port, configNode.timeout);
                node.status({ fill: "green", shape: "dot", text: "connected" });
                // Return success state
                msg.payload = {
                    connected: true,
                    device: `${configNode.host}:${configNode.port}`,
                    timestamp: new Date().toISOString()
                };
                send(msg);
                if (done)
                    done();
            }
            catch (error) {
                node.status({ fill: "red", shape: "dot", text: "error" });
                node.error(`Connection failed: ${error.message}`, msg);
                if (done)
                    done(error);
            }
        });
    }
    RED.nodes.registerType("zkteco-connect", ZKTecoConnectNodeConstructor);
};
