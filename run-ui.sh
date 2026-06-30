#!/bin/bash
echo "Starting Iqro UI..."
cd iqro-ui || exit
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Installing dependencies..."
    npm install
fi
npm run dev
