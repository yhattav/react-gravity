#!/bin/bash

# Start the development server in the background
npm run dev &
DEV_SERVER_PID=$!

# Wait for the server to be ready
npx wait-on http://localhost:5173

# Update the snapshots
npx playwright test --update-snapshots

# Kill the development server
kill $DEV_SERVER_PID 