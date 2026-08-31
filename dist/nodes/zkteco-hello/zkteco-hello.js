"use strict";
module.exports = function (RED) {
    function ZKTecoHelloNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        // When a message arrives at the input of this node
        node.on("input", function (msg, send, done) {
            // Set node status in the editor to show activity
            node.status({ fill: "blue", shape: "dot", text: "saying hello..." });
            // Modify the message payload
            msg.payload = `Hello ZKTeco! Your node is named: ${config.name || 'unnamed'}`;
            // Send the message to the next node in the flow
            send(msg);
            // Clear the status after 1 second
            setTimeout(() => {
                node.status({});
            }, 1000);
            // Signal to Node-RED that we successfully finished processing this message
            if (done) {
                done();
            }
        });
        // When the node is removed or redeployed
        node.on("close", function (done) {
            // Here is where we will eventually close TCP sockets
            // For now, there is nothing to clean up.
            node.log("ZKTeco Hello Node closed/cleaned up.");
            done();
        });
    }
    RED.nodes.registerType("zkteco-hello", ZKTecoHelloNode);
};
