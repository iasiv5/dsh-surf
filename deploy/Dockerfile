# dsh-surf Surf image: Selkies + Chrome (forced X11, ADR-0003) + fcitx5 Chinese input.
# Base is pinned to a fixed upstream tag; floating tags are forbidden by release audit.
ARG BASE_TAG=153.0.8010.36-1-ls121
FROM lscr.io/linuxserver/chrome:${BASE_TAG}

# Chinese input stack: fcitx5 core + Chinese addons (Pinyin) + CJK fonts.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        fcitx5 \
        fcitx5-chinese-addons \
        fonts-noto-cjk \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# IME environment so Chromium picks up fcitx5 under X11.
ENV GTK_IM_MODULE=fcitx \
    QT_IM_MODULE=fcitx \
    XMODIFIERS=@im=fcitx \
    INPUT_METHOD=fcitx

# Deterministic whole-file session autostart with BOTH responsibilities:
# the base Chrome launch line (kept verbatim from the upstream default)
# AND the fcitx5 daemon line. Losing either breaks the surface or the IME.
#
# Upgrade semantics: the base init only copies /defaults/autostart into
# /config on first run. A persistent volume that already contains
# .config/openbox/autostart will NOT be auto-updated by image upgrades —
# migrate it explicitly (deployment plan, Task 3 Step 1) before recreating.
COPY --chmod=0755 autostart /defaults/autostart
