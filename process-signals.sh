#!/bin/bash
# MoHoLocal — Screenshot Signal Processor
# Drop screenshots into signals-inbox/raw/ then run this script.
# Usage: ./process-signals.sh (from anywhere inside the project)

cd "$(dirname "$0")/app" && npm run process-signals
