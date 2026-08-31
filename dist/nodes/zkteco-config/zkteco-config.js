"use strict";
const connection_manager_1 = require("../../core/connection-manager");
module.exports = function (RED) {
    function ZKTecoConfigNodeConstructor(config) {
        RED.nodes.createNode(this, config);
        this.host = config.host;
        this.port = Number(config.port) || 4370;
        this.protocol = config.protocol || "tcp";
        this.timeout = Number(config.timeout) || 10000;
        const node = this;
        this.on("close", async function (done) {
            // Safely close the TCP socket if this config node is redeployed or deleted
            await connection_manager_1.ConnectionManager.disconnectClient(node.host, node.port);
            done();
        });
    }
    RED.nodes.registerType("zkteco-config", ZKTecoConfigNodeConstructor, {
        credentials: {
            password: { type: "password" }
        }
    });
};
