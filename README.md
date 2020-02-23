# wgcf-client

A simple Node.JS based client to set up a Cloudflare WARP (WireGaurd protocol) VPN

## Simple to use

This Node.JS script will register your WireGaurd based VPN with CloudFlare's WARP VPN service. It prints all debug info to the console (stdout), the last thing printed is the contents of a VPN config file that can be saved as a backup or used to manually import into other clients.

## No Catch

This script collects no data, and only calls CloudFlare's API via HTTPS. The HTTP library it uses is written / maintained by me and is a pure wrapper on the native Node.JS ClientRequest API. Please inspect the source yourself and feel free to open a PR to improve it.

## Configuration

You should only need two arguments (`--public`, `--private`) passed on command line. The API configuration for communication with cloudflare is located at `utils/config`. In the future I plan to allow passing a config file, but for now that is the only location.

## Example

```bash
node wgcf.js --public mypublickey --private myprivatekey
```

### Please use, redistribute, improve etc. A private internet is a better internet.

**This project is in no way affiliated with Cloudflare.**
**By using this software you are implicitly agreeing to Cloudflare's Terms of Service.**
