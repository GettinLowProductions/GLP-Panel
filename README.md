# GLP Server Panel

**Host game servers from your own PC — built for humans, not sysadmins.**

By Gettin' Low Productions.

One installer. The panel auto-provisions everything each game needs — the
right Java version, SteamCMD, server files, Workshop mods with their
dependencies and signing keys — and a Go Live checklist opens the doors
(firewall, router, a free stable address) so friends can join.

Free and self-hosted: your hardware, your servers, your data.

## Games

- **Minecraft Java** — one-click Fabric, in-panel mod search (Modrinth +
  CurseForge) with automatic dependency resolution, SHA-1 verified
- **DayZ / Arma 3** — in-panel Workshop search or paste a link; required
  items pulled automatically, keys and load order handled
- **Anything** — generic SteamCMD template, or write your own JSON template

## Run your servers

Live console with commands · RCON player list, kick, and broadcast
(BattlEye + Minecraft) · per-server RAM/CPU caps · live stats · scheduled
restarts · crash detection with Discord notifications · backups & restore ·
file manager & friendly config editors with built-in JSON/XML checking.

## Play with friends

One panel, many PCs. A friend's PC (or a rented VPS) joins as a node with
the setup wizard — first launch asks one question: host here, join a
friend's panel, or connect to an existing one. Give each user exactly the
access you want, from full admin to view-only, per server and per
capability. Built-in team chat with file and GIF sharing keeps everyone in
one place. Remote access via Tailscale (recommended) or direct HTTPS, with
login rate limiting and audit logging.

## Built for beginners

An extensive built-in Help & FAQ walks you through everything — firewalls,
routers, port forwarding, what's safe to click and why. The Go Live
checklist automates the scary parts: firewall rule (one prompt), UPnP port
forwarding with manual fallback, free DuckDNS address, and a copyable
invite your friends can just paste and join.

## Install

Grab `GLP-Server-Panel-Setup.exe` from **Releases**. The installer handles
everything — shortcuts, firewall pre-authorization, WebView2 runtime — and
upgrades never touch your server data.

## Feedback

Found a bug or want a feature? Open an **Issue** — the panel is actively
developed and community feedback shapes the roadmap.
## License

GLP Panel is **free to use** — download it, host your servers, invite
your friends. It is **not open source**: the code is public for
transparency, but it may not be redistributed, modified, rebranded, or
sold. See [LICENSE](LICENSE) for the full terms.

**Only download GLP Panel from this repository's
[Releases](https://github.com/GettinLowProductions/GLP-Panel/releases)
page.** Copies from anywhere else are unofficial and may be unsafe.

© 2026 Gettin' Low Productions
