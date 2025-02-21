#!/bin/bash
set -e
set -x
THIS_DIR=$(dirname "$0")
cd "${THIS_DIR}" || exit

# Runs cypress tests

IMAGE_NAME=pomotrack-cypress
CONTAINER_NAME=pomotrack-cypress

THIS_DIR=$(dirname "$0")
cd "${THIS_DIR}/.." || exit

docker build \
       -f docker/cypress.dockerfile \
       -t ${IMAGE_NAME} \
       . && \
docker run -it --rm \
           --net=bridge \
           --name ${CONTAINER_NAME} \
           --add-host=host.docker.internal:host-gateway \
           --env CYPRESS_POMOTRACK_HOSTNAME='host.docker.internal' \
           ${IMAGE_NAME} \
           --browser chrome