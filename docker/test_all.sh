#!/bin/bash
set -e
set -x
THIS_DIR=$(dirname "$0")
cd "${THIS_DIR}" || exit

echo
echo "Running Packages Audit and Lint..."
echo
./test_basic.sh

IMAGE_NAME=pomotrack-prod
CONTAINER_NAME=pomotrack-prod
echo
echo "Deploying production container..."
echo
./prod.sh -d
./wait.sh
echo
echo "Production container deployed."
echo
echo "Testing against production container..."
echo
set +e
./test_cypress.sh
test_exit_code=$?
echo
echo "Stopping production container..."
echo
docker stop ${CONTAINER_NAME}
exit ${test_exit_code}
