"use strict";
const connection_manager_1 = require("../../core/connection-manager");
module.exports = function (RED) {
    function ZKTecoOperationNodeConstructor(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const configNode = RED.nodes.getNode(config.config);
        if (!configNode) {
            node.status({ fill: "red", shape: "ring", text: "missing config" });
            node.error("Missing ZKTeco configuration");
            return;
        }
        node.on("input", async function (msg, send, done) {
            node.status({ fill: "blue", shape: "dot", text: "executing..." });
            try {
                // Get the existing client (or it will throw if disconnected)
                const client = await connection_manager_1.ConnectionManager.getClient(configNode.host, configNode.port, configNode.timeout);
                let result;
                const startTime = Date.now();
                // Operation Registry Pattern
                const operations = {
                    getInfo: () => client.getInfo(),
                    getUsers: () => client.getUsers(),
                    getAttendances: () => client.getAttendances()
                };
                if (!operations[config.operation]) {
                    throw new Error(`Unsupported operation: ${config.operation}`);
                }
                // Execute the mapped operation
                result = await operations[config.operation]();
                const durationMs = Date.now() - startTime;
                node.status({ fill: "green", shape: "dot", text: "success" });
                // Construct a normalized output payload
                msg.payload = {
                    data: result,
                    operation: config.operation,
                    device: `${configNode.host}:${configNode.port}`,
                    timestamp: new Date().toISOString(),
                    durationMs
                };
                send(msg);
                if (done)
                    done();
            }
            catch (error) {
                node.status({ fill: "red", shape: "dot", text: "error" });
                node.error(`Operation failed: ${error.message}`, msg);
                if (done)
                    done(error);
            }
        });
    }
    RED.nodes.registerType("zkteco-operation", ZKTecoOperationNodeConstructor);
};
