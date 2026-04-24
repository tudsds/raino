# Task 1: Browser Connectivity — BLOCKED

## Status: BLOCKED — WSL2 localhost forwarding failure

## Diagnosis

### Root Cause
WSL2 `localhostForwarding=true` is configured but NOT working. Playwright MCP launches Chrome on Windows, which binds its CDP WebSocket to Windows localhost (127.0.0.1). WSL2 cannot connect to Windows localhost despite `localhostForwarding=true` in `.wslconfig`.

### Evidence
1. **Chrome process verification**: Chrome fully closed (0 processes) before test
2. **Direct browser_navigate**: Failed with ECONNREFUSED 127.0.0.1:{PORT}
3. **WSL2 localhost forwarding test**: Started HTTP server on Windows localhost:55555, connection from WSL2 FAILED
4. **WSL config**: `.wslconfig` has `localhostForwarding=true` but forwarding is non-functional
5. **WSL version**: 2.6.3.0 (should support localhost forwarding)

### Attempted Solutions

#### Option A: Close Chrome, retry (FAILED)
- Killed all Chrome processes via PowerShell
- Verified 0 Chrome processes running
- Retry: Same ECONNREFUSED error

#### Option B: CDP endpoint with explicit address (FAILED)
- Started Chrome with `--remote-debugging-port=9222 --remote-debugging-address=0.0.0.0`
- Chrome still bound to `127.0.0.1:9222` (security feature ignores `--remote-debugging-address`)
- Cannot install `socat` for port forwarding (no sudo access)

#### Option C: Linux Chromium binary (FAILED)
- Playwright cache has Chromium at `~/.cache/ms-playwright/chromium-1217/`
- Binary missing system libraries: `libnspr4.so`, `libnss3.so`, `libasound.so.2`
- Cannot install dependencies without sudo

### Workaround Plan
Since browser automation is blocked, switch to **API-first testing**:
1. Use `curl` to test all API endpoints directly
2. Analyze code for bugs without browser DOM inspection
3. Test auth via Supabase client/API where possible
4. Document browser-specific issues for manual verification

### Files Modified
- `~/.config/opencode/opencode.json` — Reverted to original config after failed tests

## Next Steps
- The user may need to:
  1. Restart WSL2 (`wsl --shutdown` from PowerShell) to fix localhost forwarding
  2. Or run browser tests from a Windows-native environment
  3. Or install missing Linux libraries with admin access
