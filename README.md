# node-red-contrib-zkteco

A production-quality Node-RED contribution package for integrating with ZKTeco biometric and attendance devices over TCP/UDP.

## Features
- **Decoupled Architecture:** Clean separation between Node-RED configuration and ZKTeco operations.
- **Connection Pooling:** Multiple operations intelligently share a single connection to the device.
- **Concurrency Protection:** A built-in Mutex queue prevents simultaneous commands from crashing older embedded devices.
- **Timeout Safety:** Every network call is wrapped in a strict timeout to prevent your Node-RED flows from hanging indefinitely.
- **Secure Credentials:** Device passwords are encrypted securely by the Node-RED credential system.

## Supported Devices
Any ZKTeco device that supports the standard ZK Binary Protocol over TCP/UDP (Port 4370). This includes most standard standalone fingerprint and facial recognition attendance terminals.

## Supported Operations
- **Get Device Info:** Retrieve capacities and counts.
- **Get Users:** Download all users registered on the terminal.
- **Get Attendance Logs:** Download all check-in/check-out logs.

## Installation

Run the following command in your Node-RED user directory (typically `~/.node-red`):

```bash
npm install node-red-contrib-zkteco
```

Restart your Node-RED instance.

## Node Setup & Configuration

This package avoids the "One Giant Node" anti-pattern. Instead, you configure your device once, and reference it across your flows.

### 1. ZKTeco Config Node
*Note: This is a hidden configuration node. You create it via the edit menu of the other nodes.*
- **IP Address:** The network IP of your ZKTeco device (e.g., `192.168.1.201`).
- **Port:** Usually `4370`.
- **Protocol:** `TCP` (recommended) or `UDP`.
- **Comm Password:** Only required if you set a communication password on the device itself.

### 2. ZKTeco Connect
Explicitly opens the TCP socket to the device.
- Connect this node before running any operations.
- Outputs `{"connected": true}` on success.

### 3. ZKTeco Disconnect
Explicitly closes the TCP socket.
- Good practice to run this if you only fetch data once a day. (Note: The node automatically cleans up connections during a Node-RED redeploy).

### 4. ZKTeco Operation
The workhorse node. Select the operation you want to perform from the dropdown menu (e.g., "Get Users").
- Ensure the device is connected first.
- Outputs the device data wrapped in standard metadata (duration, timestamp).

## Example Flow

```text
[Inject] -> [ZKTeco Connect] -> [ZKTeco Operation: Get Users] -> [Debug]
```

## Error Handling
If an operation takes longer than the configured timeout, or if the device drops off the network, the Operation node will throw a Catchable error in Node-RED and output to the debug console. Wire a Node-RED `Catch` node to the ZKTeco nodes to build custom retry or alert logic.

## Security
- Passwords are never logged.
- Passwords are never exported when you export your flows to JSON.
- We strictly whitelist operations via an internal Operation Registry, preventing prototype pollution or arbitrary code execution via manipulated `msg.payload` injections.

## License
MIT
