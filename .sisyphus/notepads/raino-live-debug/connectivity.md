# Task 1: Playwright MCP + Chrome Connectivity Validation

## Date: 2026-04-23

## Findings

### Chrome Location
- **Executable**: `/mnt/c/Program Files/Google/Chrome/Application/chrome.exe`
- **Profile 1** (27jamesgong@gmail.com): `/mnt/c/Users/27jam/AppData/Local/Google/Chrome/User Data/Profile 1`
- **Profile 3** (realvaluecp@gmail.com): `/mnt/c/Users/27jam/AppData/Local/Google/Chrome/User Data/Profile 3`

### WSL2 Networking
- `localhostForwarding=true` in WSL2 config
- **CDP from WSL2 to Windows localhost does NOT work** — Chrome bound to 127.0.0.1 is not accessible from WSL2
- Windows host IP: `10.255.255.254` (WSL2 virtual adapter)
- Windows LAN IP: `192.168.1.222`
- WSL2 virtual network IP: `172.22.80.1`
- Windows portproxy requires admin elevation (not available)

### Working Approach: Playwright MCP Direct Launch
Instead of connecting to existing Chrome via CDP, configure Playwright MCP to **launch Chrome itself**:
- Playwright MCP handles browser lifecycle internally
- No need for direct CDP access from WSL2
- Chrome launches with Profile 1 when MCP client sends first request

### Configuration Applied
`~/.config/opencode/opencode.json` updated with:
```json
"playwright-chrome": {
  "type": "local",
  "command": [
    "npx", "-y", "@playwright/mcp@latest",
    "--browser", "chrome",
    "--executable-path", "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe",
    "--user-data-dir", "/mnt/c/Users/27jam/AppData/Local/Google/Chrome/User Data/Profile 1"
  ]
}
```

### Validation Results
- ✅ JSON config is valid
- ✅ MCP server starts without errors
- ✅ Chrome path is correct
- ✅ Profile 1 directory exists and is accessible
- ⚠️  Actual browser launch verification requires MCP client interaction (Tasks 5-11)

### Known Limitations
- Chrome must not already be running with Profile 1 when MCP launches (profile lock)
- If Chrome is already running, MCP may fail to launch — must kill Chrome first
- WSL2→Windows CDP direct connection is NOT possible without admin portproxy

## Recommendation
**GATE PASSED** — Proceed with Task 2 (already done), Task 3 (MCP connection verification during first browser task), and Task 4 (baseline).
