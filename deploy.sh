#!/bin/bash

# Time Management Web App - Netlify Rebuild Script
# This script triggers a rebuild of the website on Netlify using build hooks
# Documentation: https://docs.netlify.com/build/configure-builds/build-hooks/

# Netlify build hook URL
BUILD_HOOK_URL="https://api.netlify.com/build_hooks/68b839a238c8f1777209461f"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Main deployment function
deploy() {
    print_status "Starting Netlify rebuild for Time Management Web App..."
    print_status "Build hook URL: $BUILD_HOOK_URL"
    
    # Check if curl is available
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed. Please install curl first."
        exit 1
    fi
    
    # Trigger the build hook
    print_status "Triggering Netlify build..."
    
    # Execute the curl command and capture response
    RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST -d {} "$BUILD_HOOK_URL")
    
    # Extract HTTP status code
    HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    # Extract response body
    HTTP_BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')
    
    # Check if the request was successful
    if [ "$HTTP_STATUS" -eq 200 ]; then
        print_status "✅ Build hook triggered successfully!"
        print_status "Netlify is now rebuilding your website..."
        print_status "You can monitor the build progress at: https://app.netlify.com/projects/timemana/deploys"
        echo ""
        print_warning "Note: It may take a few minutes for the changes to appear on your live site."
    else
        print_error "❌ Failed to trigger build hook (HTTP $HTTP_STATUS)"
        if [ ! -z "$HTTP_BODY" ]; then
            echo "Response: $HTTP_BODY"
        fi
        exit 1
    fi
}

# Help function
show_help() {
    echo "Time Management Web App - Netlify Rebuild Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Show verbose output"
    echo ""
    echo "Examples:"
    echo "  $0              # Trigger a rebuild"
    echo "  $0 --verbose    # Trigger a rebuild with verbose output"
    echo ""
    echo "This script triggers a rebuild of your Netlify site using build hooks."
    echo "For more information, visit: https://docs.netlify.com/build/configure-builds/build-hooks/"
}

# Parse command line arguments
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use $0 --help for usage information"
            exit 1
            ;;
    esac
done

# Enable verbose mode if requested
if [ "$VERBOSE" = true ]; then
    set -x
fi

# Run the deployment
deploy

print_status "🚀 Deployment script completed successfully!"
