#!/bin/bash

# Function to cleanup background processes
cleanup() {
    echo "Cleaning up..."
    # Kill the development server if it's running
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID || true
    fi
    # Kill any process using port 5173
    lsof -t -i:5173 | xargs -r kill -9 || true
}

# Set up cleanup on script exit
trap cleanup EXIT

# Kill any existing process on port 5173
echo "Ensuring port 5173 is free..."
lsof -t -i:5173 | xargs -r kill -9 || true

# Build the app
echo "Building the app..."
npm run build

# Start the preview server in the background
echo "Starting preview server..."
npm run preview &
SERVER_PID=$!

# Wait for the server to be ready
echo "Waiting for server to be ready..."
npx wait-on http://localhost:5173

# Update the snapshots
echo "Updating snapshots..."
npx playwright test --update-snapshots

# Store the test exit code
TEST_EXIT_CODE=$?

# Exit with the test exit code
exit $TEST_EXIT_CODE