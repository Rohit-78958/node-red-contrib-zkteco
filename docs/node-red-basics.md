# Node-RED Custom Node Architecture (Beginner Basics)

## 1. What is Node-RED?
Node-RED is a flow-based programming tool built on top of Node.js. It allows users to wire together hardware devices, APIs, and online services in new and interesting ways. It provides a browser-based editor where you drag and drop "nodes" and connect them.

## 2. What is a Node-RED node?
A node is the fundamental building block in Node-RED. There are three main types of nodes:
1. **Input nodes:** Inject messages into the flow (e.g., a timer or an HTTP listener).
2. **Action/Operation nodes:** Process incoming messages and send them onward (e.g., a function node, or our `zkteco-operation` node).
3. **Configuration nodes:** Hidden nodes that store shared configuration (like database connections or device credentials).

## 3. Runtime vs Editor
Every Node-RED node is strictly divided into two halves:
- **Editor (The `.html` file):** This code runs in the user's web browser. It defines what the node looks like, its color, its icon, and the configuration form the user fills out.
- **Runtime (The `.js` or `.ts` file):** This code runs on the Node.js server. It does the actual work (like connecting to the ZKTeco device).

## 4. The Editor: The `.html` file
In the HTML file, you register your node using `RED.nodes.registerType('your-node-name', { ... })`.

**Beginner Explanation:** You are telling the Node-RED web interface "Hey, I exist! Put me in the palette on the left side."

```html
<!-- Example of registering a node -->
<script type="text/javascript">
    RED.nodes.registerType('zkteco-hello',{
        category: 'function',
        color: '#a6bbcf',
        defaults: {
            name: {value:""} // A property the user can configure
        },
        inputs:1,
        outputs:1,
        icon: "file.png",
        label: function() {
            return this.name || "zkteco hello";
        }
    });
</script>

<!-- The configuration form presented to the user -->
<script type="text/html" data-template-name="zkteco-hello">
    <div class="form-row">
        <label for="node-input-name"><i class="fa fa-tag"></i> Name</label>
        <input type="text" id="node-input-name" placeholder="Name">
    </div>
</script>
```

## 5. The Runtime: The `.js` file
In the JavaScript file, you register the runtime behavior.

**Beginner Explanation:** You define a function that runs when Node-RED starts up and sees your node in a flow.

```javascript
module.exports = function(RED) {
    // This is the Node constructor function
    function ZKTecoHelloNode(config) {
        // 'config' contains the user's settings from the HTML form (e.g., config.name)
        RED.nodes.createNode(this, config);
        var node = this;

        // node.on("input") triggers when a message arrives
        node.on('input', function(msg, send, done) {
            msg.payload = "Hello ZKTeco!";
            send(msg); // Send to the next node
            if (done) done(); // Tell Node-RED we finished successfully
        });

        // node.on("close") triggers when the node is deleted or redeployed
        node.on('close', function(done) {
            // Clean up any open sockets here!
            done();
        });
    }
    
    // Register the constructor with Node-RED
    RED.nodes.registerType("zkteco-hello", ZKTecoHelloNode);
}
```

## 6. Crucial Concepts for this Project
- **`msg`**: The object passed between nodes. We usually read/write `msg.payload`.
- **`send(msg)`**: Sends the message to the next node.
- **`done(err)`**: Signals that this node has finished processing the message. If an error occurred, pass the error: `done(err)`. This allows Node-RED's Catch nodes to capture errors.
- **`node.status({...})`**: Changes the little colored dot under the node in the editor. Very useful for showing "Connected" or "Error".
- **`node.on('close')`**: **CRITICAL FOR ZKTECO.** When a user redeploys their flow, Node-RED destroys the old nodes and creates new ones. If we don't disconnect our TCP socket in `node.on('close')`, the old socket stays alive forever (a memory leak), and the new node won't be able to connect!
- **Asynchronous Code**: Because Node.js is single-threaded, any long operation (like fetching 10,000 attendance records) must be asynchronous (Promises / async-await) so it doesn't freeze the entire Node-RED server.
