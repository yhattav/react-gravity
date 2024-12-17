#!/bin/bash

# Function to cleanup background processes
cleanup() {
    echo "Cleaning up..."
    # Kill the development server if it's running
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID || true
    fi
    # Kill any process using port 4173
    lsof -t -i:4173 | xargs -r kill -9 || true
}

# Set up cleanup on script exit
trap cleanup EXIT

# Kill any existing process on port 4173
echo "Ensuring port 4173 is free..."
lsof -t -i:4173 | xargs -r kill -9 || true

# Build the app
echo "Building the app..."
npm run build

# Start the preview server in the background
echo "Starting preview server..."
VITE_PORT=4173 npm run preview -- --host &
SERVER_PID=$!

# Add a small delay to let the server initialize
sleep 5

# Print server status for debugging
echo "Server process status:"
ps aux | grep preview
echo "Port 4173 status:"
netstat -tulpn | grep 4173 || true

# Wait for the server to be ready
echo "Waiting for server to be ready..."
npx wait-on -v -t 60000 http://localhost:4173

# Update the snapshots
echo "Updating snapshots..."
npx playwright test --update-snapshots

# Store the test exit code
TEST_EXIT_CODE=$?

# Exit with the test exit code
exit $TEST_EXIT_CODE