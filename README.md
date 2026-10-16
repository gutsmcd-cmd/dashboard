# Mat's Dashboard

Live: https://gutsmcd-cmd.github.io/dashboard/

Everything Mat's bots have made, in one place. Built by Grok Bot from `dashboard.json` with `build.py`
(kept on Grok Bot's box), refreshed weekly. Big or private files (games, private videos) live in Mat's Google Drive.

Uploads arrive as base64 parts in `b64/`; the `decode-site` workflow rebuilds them and mirrors `main` to `gh-pages`.
