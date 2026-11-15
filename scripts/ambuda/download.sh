#!/usr/bin/env bash
# Download Ambuda's open data used by the meaning and example scripts (≈400 MB, not committed).
set -euo pipefail
mkdir -p vidyut-data
[ -f vidyut-data/monier.xml ] || curl -L -o vidyut-data/monier.xml https://raw.githubusercontent.com/ambuda-org/data/main/dictionaries/monier.xml
[ -d vidyut-data/gretil ] || git clone --depth 1 https://github.com/ambuda-org/gretil.git vidyut-data/gretil
echo "Ambuda data ready in vidyut-data/"
