# Physical Device Testing Guide

Automated unit tests ensure the software logic works, but they cannot prove that your specific ZKTeco device model behaves as expected. When you are ready to test against a real device, follow this guide.

## 1. Network Preparation
1. **Device IP:** Assign a static IP to your ZKTeco device via its physical menu (e.g., `192.168.1.201`).
2. **Ping Test:** From the machine running Node-RED, open a terminal and run `ping 192.168.1.201`. Ensure you get replies.
3. **Port Check:** The default port is `4370`. Ensure no firewalls are blocking outbound TCP traffic on this port from your Node-RED server.

## 2. Safe Testing (Non-Destructive)
When testing a new device firmware for the first time, only use non-destructive operations.

1. **Connect Node:** Wire an Inject node to a `ZKTeco Connect` node. Configure the IP. Trigger it. Ensure the dot turns green.
2. **Get Info:** Wire the success output to a `ZKTeco Operation: Get Device Info` node. This is the safest command. It simply reads the capacity limits.
3. **Get Users / Get Attendance:** These are safe read operations. Note that if your device has 50,000 attendance records, this operation may take several seconds. The Node-RED flow will pause at this node until the download is complete.

## 3. Destructive Testing (Caution)
*Currently, destructive operations (like `Clear Attendance`) are not exposed in the dropdown to prevent accidental data loss.*

If you add them in the future:
1. **Always backup data first** (run `Get Attendance` and save the payload to a JSON file on disk).
2. Never wire a destructive operation to a repeating Inject node.
3. Test on a staging device, not the production terminal used by employees.

## 4. Connection Cleanup
If you restart your Node-RED server or click "Deploy", the package automatically attempts to gracefully close the TCP socket. However, if you pull the power cord on the Node-RED server, the ZKTeco device might keep a "half-open" socket. If you cannot reconnect after a hard crash, reboot the physical ZKTeco device to clear its network stack.
