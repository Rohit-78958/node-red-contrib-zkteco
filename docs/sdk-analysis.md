# ZKTeco SDK & API Analysis

Based on online research, the standard approach for integrating ZKTeco biometric attendance terminals in Node.js environments without relying on native Windows DLLs is to use community libraries like `node-zklib` or `zklib-js`. These libraries implement the ZKTeco binary protocol over TCP/UDP.

## 1. Protocol & Transport
- **Protocol:** ZK Binary Protocol
- **Transport:** TCP (default) or UDP
- **Default Port:** `4370`
- **Dependencies:** Pure JavaScript (no native DLLs required, which means it works perfectly in Docker/Linux environments).
- **Architecture Suitability:** Highly suitable for Node-RED since it uses standard Node.js `net` (TCP) sockets.

## 2. Connection Lifecycle
The connection is stateful. It requires explicit connection and disconnection.

```javascript
// Example connection flow
const ZKLib = require('node-zklib');
const zk = new ZKLib('192.168.1.201', 4370, 10000, 4000, 0, 'tcp');

await zk.createSocket();  // CONNECT
// ... perform operations ...
await zk.disconnect();    // DISCONNECT
```

## 3. Available Operations
Based on the `zklib` API, the following core operations are available:

| Operation | SDK Method | Input | Output | Destructive | Concurrent? | Notes |
|-----------|------------|-------|--------|------------|------------|-------|
| Get Info | `getInfo()` | None | Device info | No | No | Good for testing connection |
| Get Users | `getUsers()` | None | Array of users | No | No | Can be large |
| Get Attendances | `getAttendances()` | None | Array of logs | No | No | Can be large |
| Real-Time Logs | `getRealTimeLogs()` | Callback | Stream of logs | No | N/A | Requires persistent connection |
| Clear Attendance | `clearAttendance()` | None | Success boolean | **Yes** | No | Destructive |

## 4. Unknowns / Caveats
- **Concurrency:** The ZK TCP protocol generally does **NOT** handle concurrent requests well. If you fire `getUsers()` and `getAttendances()` simultaneously on the same socket, the device may lock up or return garbled data. Therefore, our **ConnectionManager MUST implement a strict queue**.
- **Timeouts:** Embedded devices are slow. Large attendance fetches can take seconds.
- **Firmware Differences:** Some older devices behave differently. We must map errors gracefully.

## 5. Decision for this Project
We will abstract the ZKTeco protocol using an **Adapter Layer**. We will use `node-zklib` (or `zklib-js`) as our underlying dependency, but we will hide it behind our `ZktecoAdapter`. This ensures that if the library changes or we need to write our own binary parser later, the Node-RED nodes remain unaffected.
