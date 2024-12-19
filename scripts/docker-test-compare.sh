#!/bin/bash

# Enable error handling
set -e

# Function to check Docker connection
check_docker() {
    local max_attempts=5
    local attempt=1
    local wait_time=5

    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt of $max_attempts: Checking Docker connection..."
        if $CLI info > /dev/null 2>&1; then
            echo "Docker connection successful!"
            return 0
        fi
        echo "Docker connection failed. Waiting $wait_time seconds before retry..."
        sleep $wait_time
        attempt=$((attempt + 1))
    done

    echo "Failed to connect to Docker after $max_attempts attempts"
    return 1
}

echo "🚀 Starting container build process..."

# Use full path to Docker from Rancher Desktop
CLI="${HOME}/.rd/bin/docker"

# Switch to Rancher Desktop context
echo "Switching to Rancher Desktop context..."
$CLI context use rancher-desktop

# Check Docker connection
if ! check_docker; then
    echo "❌ Error: Could not establish connection to Docker daemon"
    exit 1
fi

# Clean up any existing containers and images
echo "🧹 Cleaning up any existing containers and images..."
$CLI rm -f react-gravity-test-run 2>/dev/null || true
$CLI rmi -f react-gravity-test 2>/dev/null || true

# Build the container image with build progress
echo "🏗️  Building container image..."
$CLI build \
    --progress=plain \
    --no-cache \
    --network=host \
    --platform linux/arm64 \
    --build-arg BUILDPLATFORM=linux/arm64 \
    --build-arg TARGETPLATFORM=linux/arm64 \
    -t react-gravity-test \
    -f Dockerfile.test.compare .

# Run the container and copy the test results back
echo "🏃 Running tests in container..."
$CLI run --name react-gravity-test-run react-gravity-test

# Copy test results regardless of test outcome
echo "📊 Copying test results..."
$CLI cp react-gravity-test-run:/app/playwright-report ./
$CLI cp react-gravity-test-run:/app/test-results ./ || true

echo "🧹 Cleaning up container..."
$CLI rm react-gravity-test-run

echo "✅ Done! Check playwright-report/index.html for test results" 