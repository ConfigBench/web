# ConfigBench

The modern browser workbench for Minecraft players, creators, and server owners. Fast, client-side tools for blueprints, gradient text, animated TAB, and live plugin config rendering.

> Not affiliated with, endorsed by, or sponsored by Adventure (Kyori), PaperMC, or Mojang. MiniMessage is a text format created by the Adventure project (Kyori).

## What it does

**Config tool** — Editing server configs is blind work: you write a gradient tag, save, and hop in-game to check it. ConfigBench closes that loop. Paste any YAML config and every message in it renders live; move your cursor through the file and the matching message highlights, click a rendered message to jump back to its source. Problems in the file are listed below the editor, one click to jump to the line.

**RGB Gradient** — Build gradient text for chat, MOTD, TAB lists, and item names. Pick your colors, choose from six blending modes and every output format Minecraft servers actually use, and copy the result. Includes a decoder: paste existing gradient text back in and it recovers the colors.

**Animated TAB** — Animate your TAB header with scrolling or bouncing gradients and export ready-to-paste YAML for the TAB plugin.

**Circle Generator** — Generate pixel-perfect blueprints for Minecraft circles, ovals, spheres, and domes with layer-by-layer guides, F3 in-game coordinate anchoring, survival stack calculations, and PNG export.

**World Size Calculator** — Calculate the exact disk footprint, chunk counts, and region file breakdown across all Minecraft versions before pregeneration, with Chunky CLI scripts and SSD recommendations.

**Coordinate Calculator** — Convert Block, Chunk, and Region coordinates with live Overworld ↔ Nether 8:1 portal linking dynamics, search box boundaries, and one-click teleport commands.

**Server Status** — Query Minecraft Java and Bedrock servers to inspect live latency, player counts, versions, and formatted in-game MOTD with multi-provider fallback.

**Skin Viewer** — Inspect, render, and download Minecraft skins in real time. Features an interactive 3D WebGL character model with walking, running, flying, and idle animations, orbit camera controls, 2D avatar/bust/body renders with armor layers, and raw 64x64 texture sheets.

Everything runs in your browser. No accounts, no uploads, nothing leaves your machine.

## Using it

1. Open a tool from the **Tools** menu.
2. Paste your text or config.
3. Tweak, preview, copy the result.

Your workspace is saved in your browser automatically, so it's still there when you come back.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to report bugs, suggest features, and open pull requests. If you're planning a new feature, please open an issue to discuss it first — unsolicited feature PRs are usually declined.

## License

Released under the [GNU Affero General Public License v3.0](LICENSE). ConfigBench is a product of [SoftGrid](https://softgrid.dev) — © 2026 SoftGrid. MiniMessage is by Adventure (Kyori) and its trademark/name belongs to its owners.
