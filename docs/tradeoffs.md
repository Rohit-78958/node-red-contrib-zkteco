# Architectural Tradeoffs

Building a production-quality Node-RED package requires balancing flexibility for the user against safety for the underlying hardware. Here are the major decisions made during this project.

## 1. TypeScript vs JavaScript
- **Option A:** Pure JavaScript. (Pros: No build step, instantly editable in node_modules. Cons: Difficult to maintain, no type safety for complex ZKTeco responses).
- **Option B:** TypeScript. (Pros: Interfaces ensure data correctness, catching errors at compile time. Cons: Requires `npm run build` and `tsconfig.json`).
- **Chosen Approach:** TypeScript.
- **Why:** The ZKTeco protocol has many specific data shapes (Users, Attendance logs). TypeScript prevents the most common beginner errors (like misspelling a property) before the code even runs. 

## 2. Shared Connection vs Connection-Per-Operation
- **Option A:** Every node creates a new TCP socket, fetches data, and closes it.
- **Option B:** A ConnectionManager holds one socket per device IP, and multiple nodes share it.
- **Chosen Approach:** Shared Connection.
- **Why:** Embedded ZKTeco devices often have strict limits on concurrent TCP sockets (sometimes as low as 1 or 2). Connection-per-operation leads to rapid socket exhaustion and device crashes.

## 3. Explicit Connect vs Lazy Connect
- **Option A:** The `zkteco-operation` node automatically connects if it isn't already connected.
- **Option B:** The user must explicitly wire a `zkteco-connect` node before the operation.
- **Chosen Approach:** Explicit Connect.
- **Why:** Node-RED is about visual flow control. If connections happen invisibly, users can't handle connection failures visually. An explicit node allows them to wire a specific path for "If device is offline, send me a Telegram message."

## 4. Operation Node vs Separate Nodes
- **Option A:** A separate node for `Get Users`, `Get Attendance`, `Get Info`, etc.
- **Option B:** One `zkteco-operation` node with a dropdown.
- **Chosen Approach:** One Operation Node.
- **Why:** Reduces palette clutter. As we support more of the SDK, having 20 different ZKTeco nodes on the left sidebar is overwhelming. 

## 5. Concurrency vs Serialization
- **Option A:** Allow Node-RED to fire multiple requests to the device concurrently.
- **Option B:** Force operations into a strict single-file line (Mutex Queue).
- **Chosen Approach:** Serialization (Mutex Queue).
- **Why:** The underlying TCP protocol parsing in `node-zklib` cannot handle overlapping byte responses on the same socket. If two operations fire simultaneously, the data chunks interleave and corrupt the parser.

## 6. Unit Tests vs Physical-Device Tests
- **Option A:** Tests require a real ZKTeco device on `192.168.1.201`.
- **Option B:** Tests mock the hardware.
- **Chosen Approach:** Mock the hardware via Vitest.
- **Why:** CI/CD pipelines (like GitHub Actions) do not have a physical biometric scanner attached to them. To ensure the package can be automatically tested and maintained long-term, the core logic must be testable purely in software.
