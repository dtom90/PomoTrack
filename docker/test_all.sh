#!/bin/bash
set -e
set -x
THIS_DIR=$(dirname "$0")
cd "${THIS_DIR}/.." || exit

echo
echo "Running Packages Audit and Lint..."
echo
./docker/test_basic.sh

IMAGE_NAME=pomodash-prod
CONTAINER_NAME=pomodash-prod
echo
echo "Deploying production container..."
echo
./docker/prod.sh -d
./docker/wait.sh
echo
echo "Production container deployed."
echo
echo "Testing against production container..."
echo
set +e
./docker/test_cypress.sh
test_exit_code=$?
echo
echo "Stopping production container..."
echo
docker stop ${CONTAINER_NAME}
exit ${test_exit_code}
