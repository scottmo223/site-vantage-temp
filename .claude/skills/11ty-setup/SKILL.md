---
name: 11ty-setup
description: Configure Eleventy dev server for local network access and mobile testing
disable-model-invocation: true
---

## Eleventy Local Network Setup

When setting up an Eleventy project for local network / mobile device testing:

### 1. Configure the dev server in `eleventy.config.js`

Add or update `setServerOptions` with:

```js
eleventyConfig.setServerOptions({
  port: 8080,
  host: "0.0.0.0",        // Bind to all interfaces so LAN devices can connect
  showAllHosts: true,      // Print the LAN IP in the terminal on startup
});
```

- `host: "0.0.0.0"` makes the server accessible from other devices on the same Wi-Fi network.
- `showAllHosts: true` prints all available URLs (localhost + LAN IP) in the terminal so the dev can click to open.

