#!/bin/bash
# Portfolio Security Test Runner
# Usage: ./run-security-tests.sh [baseline|active] [target_url]

set -e

MODE=${1:-baseline}
TARGET=${2:-https://api.angelonesto.com}
REPORT_DIR="$(dirname "$0")/reports"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$REPORT_DIR"

echo "=== Portfolio Security Tests ==="
echo "Mode: $MODE"
echo "Target: $TARGET"
echo "================================"

if [ "$MODE" = "baseline" ]; then
  echo "[1/3] Running ZAP Baseline Scan (passive)..."
  docker run --rm \
    -v "$(pwd)/security-tests:/zap/wrk:rw" \
    ghcr.io/zaproxy/zaproxy:stable \
    zap-baseline.py \
    -t "$TARGET" \
    -c zap-baseline.conf \
    -r "reports/api-baseline-${TIMESTAMP}.html" \
    -J "reports/api-baseline-${TIMESTAMP}.json" \
    -I || true

  echo "[2/3] Running npm audit..."
  cd portfolio-api && npm audit --audit-level=high 2>&1 | tee "$REPORT_DIR/npm-audit-api-${TIMESTAMP}.txt" || true
  cd ../portfolio-frontend && npm audit --audit-level=high 2>&1 | tee "$REPORT_DIR/npm-audit-frontend-${TIMESTAMP}.txt" || true
  cd ..

  echo "[3/3] Checking security headers..."
  curl -sI "$TARGET" | grep -iE "^(strict-transport|x-content-type|x-frame|content-security|referrer-policy|permissions-policy)" | tee "$REPORT_DIR/headers-${TIMESTAMP}.txt"

elif [ "$MODE" = "active" ]; then
  echo "[1/1] Running ZAP Active Scan (this takes a while)..."
  docker run --rm \
    -v "$(pwd)/security-tests:/zap/wrk:rw" \
    ghcr.io/zaproxy/zaproxy:stable \
    zap-full-scan.py \
    -t "$TARGET" \
    -r "reports/api-active-${TIMESTAMP}.html" \
    -J "reports/api-active-${TIMESTAMP}.json" \
    -I || true
fi

echo ""
echo "=== Reports saved to $REPORT_DIR ==="
ls -la "$REPORT_DIR"/*${TIMESTAMP}* 2>/dev/null || echo "No reports generated"
