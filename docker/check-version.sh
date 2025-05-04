#!/bin/bash
set -ex

# Get current branch version

cd "$(dirname "$0")"
CURRENT_VERSION=$(node -p "require('../package.json').version")

# Fetch master branch
git fetch origin master

# Get master branch version
MASTER_VERSION=$(git show origin/master:package.json | node -p "JSON.parse(require('fs').readFileSync(0, 'utf-8')).version")

# Compare versions using node semver comparison
if node -e "process.exit(require('semver').gt('$CURRENT_VERSION', '$MASTER_VERSION') ? 0 : 1)"; then
    echo "Version $CURRENT_VERSION is greater than master version $MASTER_VERSION"
else
    echo "Error: Version $CURRENT_VERSION must be greater than master version $MASTER_VERSION"
    exit 1
fi
