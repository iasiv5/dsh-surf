# Reverse proxy guide

`dsh-surf` serves a Selkies/Chrome streaming surface over HTTP on port **3000** inside
the container. The example compose publishes it on `127.0.0.1:3000` only — put a
TLS-terminating reverse proxy in front and follow the rules below.

## Rule 1 — loopback binding, TLS at the edge

Never publish port 3000 on a public interface. Bind it to `127.0.0.1` (as the example
compose does) and terminate TLS at your edge proxy (nginx / Caddy / ...). All user
traffic must arrive via HTTPS.

## Rule 2 — WebSocket, long timeouts, no buffering

The surface upgrades to a WebSocket at `/surf/websocket`. Your proxy location must:

- forward the upgrade headers (`proxy_set_header Upgrade $http_upgrade;`
  `proxy_set_header Connection $connection_upgrade;` on nginx);
- allow long-lived connections (`proxy_read_timeout 3600s;` or higher);
- disable response buffering (`proxy_buffering off;`) so video frames stream
  low-latency instead of being buffered.

## Rule 3 — explicit request body limit

Set a deliberate body limit (e.g. `client_max_body_size 25m;` on nginx). Uploads above
the limit are rejected with **413 at the proxy layer** and never reach the container —
pick the value consciously, and remember each proxy hop in the chain enforces its own
limit (the smallest one wins).

## Rule 4 — sub-path mounts (`SUBFOLDER`)

If you mount the surface under a path prefix, e.g. `https://host/app/surf/`:

- strip the outer prefix at the proxy so the container still receives `/surf/...`;
- keep `SUBFOLDER=/surf/` so the app generates correct asset URLs;
- watch the double-slash pitfall: if the stripped path still carries a leading slash
  while `SUBFOLDER` already has a trailing one, links can end up with `//` — normalize
  the prefix stripping so no doubled slashes reach the client.

## Authentication — forward-auth, not optional

Do not expose `/surf/` unauthenticated. Prefer a forward-auth gateway: intercept every
`/surf/*` request, verify the session cookie against your auth service
(`forward_auth` on Caddy, `auth_request` on nginx), and redirect anonymous requests to
an interactive login instead of the surface.

## Container hardening (already in the example compose)

- `DISABLE_TERMINALS=true` — no web terminals;
- `DISABLE_SUDO=true` — no root escalation from inside the browser session;
- `SELKIES_ENABLE_SHARING=false|locked`, `SELKIES_MICROPHONE_ENABLED=false|locked` —
  screen sharing and microphone are off and locked (the UI cannot re-enable them).

Keep these enabled; do not relax them without re-reviewing your exposure.

## Security warning

A `/surf/` endpoint is a full remote browser session running on your host with your
network behind it. A surface that is reachable without TLS + authentication is a hole
into your machine — treat Rules 1 and the forward-auth section as hard requirements,
not suggestions.
