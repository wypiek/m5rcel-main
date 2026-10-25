#!/usr/bin/env bash
# Cloudflare Pages build: installs the .NET 10 SDK if it is missing, then renders the site
# to static files in dist/ (index.html, 404.html, assets and a _headers file).
set -euo pipefail
cd "$(dirname "$0")"

export DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1 DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1
if ! command -v dotnet >/dev/null 2>&1 || ! dotnet --list-sdks | grep -q '^10\.'; then
    curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh
    bash /tmp/dotnet-install.sh --channel 10.0 --install-dir "$HOME/.dotnet"
    export PATH="$HOME/.dotnet:$PATH"
fi

dotnet run --configuration Release -- --export dist
