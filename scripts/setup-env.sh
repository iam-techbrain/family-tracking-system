#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if [ ! -f "$ROOT_DIR/backend/.env" ]; then
    echo "Creating backend/.env from .env.example..."
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/backend/.env"
    echo "backend/.env created. Update secrets before production use."
else
    echo "backend/.env already exists."
fi

