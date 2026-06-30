@echo off
echo Starting Iqro UI...
cd iqro-ui
if not exist node_modules (
    echo node_modules not found. Installing dependencies...
    call npm install
)
call npm run dev
