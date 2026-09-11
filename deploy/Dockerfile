# dsh-surf Surf image: Selkies + Chrome (forced X11, ADR-0003).
# Base is pinned to a fixed upstream tag; floating tags are forbidden by release audit.
ARG BASE_TAG=153.0.8010.36-1-ls121
FROM lscr.io/linuxserver/chrome:${BASE_TAG}

# Deterministic whole-file session autostart: preserves the base Chrome launch
# line verbatim from the upstream default.
#
# Input design: Chinese input comes from the local-device IME via Selkies text
# injection — no in-container IME by design (it conflicts with injection; see
# README "Known limitations"). CJK fonts are shipped by the base image, so
# Chinese pages render out of the box.
#
# Upgrade semantics: the base init only copies /defaults/autostart into
# /config on first run. A persistent volume that already contains
# .config/openbox/autostart will NOT be auto-updated by image upgrades —
# migrate it explicitly before recreating the container.
COPY --chmod=0755 autostart /defaults/autostart
